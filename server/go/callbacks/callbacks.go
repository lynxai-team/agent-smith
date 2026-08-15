package callbacks

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"sync"

	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/synw/agent-smith/server/go/utils"
	"github.com/synw/agent-smith/server/go/websock"
)

// CallbackHandlers bridges execution events to WebSocket messages.
type CallbackHandlers struct {
	ws               websock.WSConn
	from             string
	confirmToolCalls map[string]*utils.Awaiter
	mu               sync.Mutex // protects confirmToolCalls map
}

// NewCallbackHandlers creates a new CallbackHandlers instance.
func NewCallbackHandlers(ws websock.WSConn, from string) *CallbackHandlers {
	return &CallbackHandlers{
		ws:               ws,
		from:             from,
		confirmToolCalls: make(map[string]*utils.Awaiter),
	}
}

// sendMsg sends a WsRawServerMsg over the WebSocket connection.
func (cb *CallbackHandlers) sendMsg(msgType types.WsServerMsgType, msg string) {
	rsm := types.WsRawServerMsg{
		Type: msgType,
		From: cb.from,
		Msg:  msg,
	}
	data, err := json.Marshal(rsm)
	if err != nil {
		if state.IsDebug.Load() {
			fmt.Printf("Failed to marshal message: %v\n", err)
		}
		return
	}
	if err := cb.ws.Send(data); err != nil {
		if state.IsDebug.Load() {
			fmt.Printf("Failed to send message: %v\n", err)
		}
	}
}

// BuildOptions returns a map of callback functions for the lm binary execution.
func (cb *CallbackHandlers) BuildOptions() map[string]interface{} {
	return map[string]interface{}{
		"onStartEmit": func(p types.PromptProcessingInProgressStats, from string) {
			data, err := json.Marshal(p)
			if err != nil {
				fmt.Printf("Failed to marshal start emit: %v\n", err)
				return
			}
			cb.sendMsg(types.StartEmitType, string(data))
		},
		"onToken": func(t string, from string) {
			cb.sendMsg(types.TokenType, t)
		},
		"onThinkingToken": func(t string, from string) {
			cb.sendMsg(types.ThinkingTokenType, t)
		},
		"onStartThinking": func(from string) {
			cb.sendMsg(types.ThinkingStartType, "")
		},
		"onEndThinking": func(from string) {
			cb.sendMsg(types.ThinkingEndType, "")
		},
		"onTurnStart": func(from string) {
			cb.sendMsg(types.TurnStartType, "")
		},
		"onTurnEnd": func(ht map[string]interface{}, from string) {
			data, err := json.Marshal(ht)
			if err != nil {
				fmt.Printf("Failed to marshal turn end: %v\n", err)
				return
			}
			cb.sendMsg(types.TurnEndType, string(data))
		},
		"onAssistant": func(txt string, from string) {
			cb.sendMsg(types.AssistantType, txt)
		},
		"onThink": func(txt string, from string) {
			cb.sendMsg(types.ThinkType, txt)
		},
		"onEndEmit": func(res types.InferenceResult, from string) {
			data, err := json.Marshal(res)
			if err != nil {
				fmt.Printf("Failed to marshal end emit: %v\n", err)
				return
			}
			cb.sendMsg(types.EndEmitType, string(data))
		},
		"onToolCallToken": func(t string, from string) {
			data, err := json.Marshal(t)
			if err != nil {
				fmt.Printf("Failed to marshal tool call token: %v\n", err)
				return
			}
			cb.sendMsg(types.ToolCallTokenType, string(data))
		},
		"onToolCallInProgress": func(tcs []interface{}, from string) {
			data, err := json.Marshal(tcs)
			if err != nil {
				fmt.Printf("Failed to marshal tool call in progress: %v\n", err)
				return
			}
			cb.sendMsg(types.ToolCallInProgressType, string(data))
		},
		"onPromptProcessingProgress": func(progress types.PromptProcessingInProgressStats, from string) {
			data, err := json.Marshal(progress)
			if err != nil {
				fmt.Printf("Failed to marshal prompt processing progress: %v\n", err)
				return
			}
			cb.sendMsg(types.PromptProcessingProgress, string(data))
		},
		"onToolsTurnStart": func(tcs map[string]interface{}, from string) {
			data, err := json.Marshal(tcs)
			if err != nil {
				fmt.Printf("Failed to marshal tools turn start: %v\n", err)
				return
			}
			cb.sendMsg(types.ToolsTurnStartType, string(data))
		},
		"onToolsTurnEnd": func(tr map[string]interface{}, from string) {
			data, err := json.Marshal(tr)
			if err != nil {
				fmt.Printf("Failed to marshal tools turn end: %v\n", err)
				return
			}
			cb.sendMsg(types.ToolsTurnEndType, string(data))
		},
		"onToolCall": func(tc map[string]interface{}, typeStr string, from string) {
			if tcID, ok := tc["id"].(string); !ok || tcID == "" {
				tc["id"] = generateUUID()
			}
			payload := map[string]interface{}{
				"tc":   tc,
				"type": typeStr,
				"from": from,
			}
			data, err := json.Marshal(payload)
			if err != nil {
				fmt.Printf("Failed to marshal tool call: %v\n", err)
				return
			}
			cb.sendMsg(types.ToolCallType, string(data))
		},
		"onToolCallEnd": func(tc map[string]interface{}, tr interface{}, typeStr string, from string) {
			var toolResData string
			if trObj, ok := tr.(map[string]interface{}); ok {
				trObj["type"] = typeStr
				if text, exists := trObj["text"]; exists {
					toolResData = fmt.Sprintf("%v", text)
				} else {
					data, _ := json.Marshal(trObj)
					toolResData = string(data)
				}
			} else if trStr, ok := tr.(string); ok {
				toolResData = trStr
			} else {
				toolResData = fmt.Sprintf("%v", tr)
			}
			payload := map[string]interface{}{
				"tc":   tc,
				"type": typeStr,
				"from": from,
			}
			payloadData, err := json.Marshal(payload)
			if err != nil {
				fmt.Printf("Failed to marshal tool call end payload: %v\n", err)
				return
			}
			toolCallEndMsg := string(payloadData) + "<|xtool_call_id|>" + toolResData
			cb.sendMsg(types.ToolCallEndType, toolCallEndMsg)
		},
		"onConfirmToolUsage": func(tc map[string]interface{}, from string) (bool, error) {
			if tcID, ok := tc["id"].(string); !ok || tcID == "" {
				tc["id"] = generateUUID()
			}
			tcData, err := json.Marshal(tc)
			if err != nil {
				fmt.Printf("Failed to marshal tool confirmation: %v\n", err)
				return false, err
			}
			cb.sendMsg(types.ToolCallConfirmType, string(tcData))

			awaiter := utils.CreateAwaiter()
			tcID := tc["id"].(string)
			cb.mu.Lock()
			cb.confirmToolCalls[tcID] = awaiter
			cb.mu.Unlock()

			result := awaiter.Wait()
			cb.mu.Lock()
			delete(cb.confirmToolCalls, tcID)
			cb.mu.Unlock()
			return result, nil
		},
		"nocli": true,
	}
}

// SendToken sends a token message.
func (cb *CallbackHandlers) SendToken(token string) {
	cb.sendMsg(types.TokenType, token)
}

// SendThinkingToken sends a thinking token message.
func (cb *CallbackHandlers) SendThinkingToken(token string) {
	cb.sendMsg(types.ThinkingTokenType, token)
}

// SendEndEmit sends an endemit message.
func (cb *CallbackHandlers) SendEndEmit(result types.InferenceResult) {
	data, err := json.Marshal(result)
	if err != nil {
		fmt.Printf("Failed to marshal end emit result: %v\n", err)
		return
	}
	cb.sendMsg(types.EndEmitType, string(data))
}

// SendFinalResult sends a finalresult message.
func (cb *CallbackHandlers) SendFinalResult(result types.InferenceResult) {
	data, err := json.Marshal(result)
	if err != nil {
		fmt.Printf("Failed to marshal final result: %v\n", err)
		return
	}
	cb.sendMsg(types.FinalResultType, string(data))
}

// From returns the source identifier.
func (cb *CallbackHandlers) From() string {
	return cb.from
}

// ResolveToolConfirmation resolves a pending tool confirmation awaiter.
func (cb *CallbackHandlers) ResolveToolConfirmation(id string, value bool) {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	if awaiter, exists := cb.confirmToolCalls[id]; exists {
		awaiter.Resolve(value)
		delete(cb.confirmToolCalls, id)
	}
}

// generateUUID generates a random UUID v4.
func generateUUID() string {
	uuid := make([]byte, 16)
	if _, err := io.ReadFull(rand.Reader, uuid); err != nil {
		return "00000000-0000-4000-8000-000000000000"
	}
	uuid[6] = (uuid[6] & 0x0f) | 0x40
	uuid[8] = (uuid[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:16])
}

// toMap converts an interface{} to map[string]interface{}.
func toMap(v interface{}) map[string]interface{} {
	switch val := v.(type) {
	case map[string]interface{}:
		return val
	case map[string]string:
		m := make(map[string]interface{})
		for k, v := range val {
			m[k] = v
		}
		return m
	default:
		return nil
	}
}
