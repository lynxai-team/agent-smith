package httpserver

import (
	"encoding/json"
	"fmt"
	"slices"

	"github.com/labstack/echo/v4"
	"github.com/synw/agent-smith/server/go/callbacks"
	"github.com/synw/agent-smith/server/go/lm"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/types"
	"golang.org/x/net/websocket"
)

// WsHandler handles WebSocket connections.
func WsHandler(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		// Per-session state
		session := &state.WsSession{
			ConfirmToolCalls: make(map[string]chan bool),
		}

		if state.IsVerbose {
			fmt.Printf("WebSocket connection established\n")
		}

		// Message receive loop
		for {
			var rawMsg json.RawMessage
			err := websocket.Message.Receive(ws, &rawMsg)
			if err != nil {
				if state.IsVerbose {
					fmt.Printf("WebSocket disconnect: %v\n", err)
				}
				break
			}

			var msg types.WsClientMsg
			if err := json.Unmarshal(rawMsg, &msg); err != nil {
				sendWsError(ws, fmt.Sprintf("Failed to parse message: %v", err))
				continue
			}

			switch msg.Type {
			case types.SystemMsgType:
				handleSystemMessage(ws, session, msg)
			case types.CommandMsgType:
				handleCommandMessage(ws, session, msg)
			default:
				sendWsError(ws, fmt.Sprintf("Unknown message type: %s", msg.Type))
			}
		}

		if state.IsVerbose {
			fmt.Printf("WebSocket connection closed\n")
		}
	}).ServeHTTP(c.Response(), c.Request())

	return nil
}

// handleSystemMessage processes system-level commands.
func handleSystemMessage(ws *websocket.Conn, session *state.WsSession, msg types.WsClientMsg) {
	switch msg.Command {
	case "stop":
		if state.IsVerbose {
			fmt.Printf("Stop command received\n")
		}
		// TODO: Implement abort logic via context cancellation
		sendWsError(ws, "Stop command received (abort not yet implemented)")

	case "confirmtool":
		// Extract payload.id and payload.confirm
		payload := msg.Payload
		if payload == nil {
			sendWsError(ws, "confirmtool requires payload with 'id' and 'confirm' fields")
			return
		}
		id, ok := payload["id"].(string)
		if !ok || id == "" {
			sendWsError(ws, "confirmtool requires a valid 'id' in payload")
			return
		}
		confirmVal, ok := payload["confirm"].(bool)
		if !ok {
			sendWsError(ws, "confirmtool requires a 'confirm' boolean in payload")
			return
		}

		// Resolve the awaiter for this tool call ID
		if ch, exists := session.ConfirmToolCalls[id]; exists {
			ch <- confirmVal
			delete(session.ConfirmToolCalls, id)
			if state.IsVerbose {
				fmt.Printf("Tool confirmation resolved: %s = %v\n", id, confirmVal)
			}
		} else {
			sendWsError(ws, fmt.Sprintf("No pending confirmation for tool call ID: %s", id))
		}

	default:
		if state.IsVerbose {
			fmt.Printf("Unknown system command: %s\n", msg.Command)
		}
		sendWsError(ws, fmt.Sprintf("Unknown system command: %s", msg.Command))
	}
}

// handleCommandMessage routes command messages to appropriate executors.
func handleCommandMessage(ws *websocket.Conn, session *state.WsSession, msg types.WsClientMsg) {
	if msg.Payload == nil {
		sendWsError(ws, "Command message requires a payload")
		return
	}

	// Initialize options if nil, set nocli=true
	if msg.Options == nil {
		msg.Options = make(map[string]interface{})
	}
	msg.Options["nocli"] = true

	switch msg.Feature {
	case "agent":
		executeAgent(ws, session, msg)
	case "workflow":
		sendWsError(ws, "Workflow execution not yet implemented")
	default:
		sendWsError(ws, fmt.Sprintf("Unsupported feature type: %s", msg.Feature))
	}
}

// executeAgent runs an agent via the lm binary with callback handlers.
func executeAgent(ws *websocket.Conn, session *state.WsSession, msg types.WsClientMsg) {
	cmdName := msg.Command
	apiKey := "" // No API key at WebSocket level yet — authorization is per-command
	payload := msg.Payload

	// Create callback handlers
	cbHandler := callbacks.NewCallbackHandlers(ws, cmdName)

	// Build options map
	options := cbHandler.BuildOptions()

	// Merge client-provided options (non-callback fields)
	for k, v := range msg.Options {
		// Skip callback function keys — they're already in options
		if _, exists := options[k]; !exists || k == "nocli" {
			options[k] = v
		}
	}

	// Validate API key authorization
	if !isCommandAuthorized(apiKey, cmdName) {
		sendWsError(ws, fmt.Sprintf("Command '%s' is not authorized", cmdName))
		return
	}

	// Serialize payload and options to JSON
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		sendWsError(ws, fmt.Sprintf("Failed to marshal payload: %v", err))
		return
	}

	optsJSON, err := json.Marshal(options)
	if err != nil {
		sendWsError(ws, fmt.Sprintf("Failed to marshal options: %v", err))
		return
	}

	// Call lm.RunCmd with params
	lm.RunCmd(cmdName, []string{"--payload", string(payloadJSON), "--options", string(optsJSON)}, ws, cbHandler, session)
}

// isCommandAuthorized checks if an API key is authorized to run a command.
func isCommandAuthorized(apiKey, cmd string) bool {
	// Main key allows all commands
	if state.Conf.CmdApiKey.IsValid && apiKey == state.Conf.CmdApiKey.Key {
		return true
	}

	// If no main key, check group authorization
	if apiKey != "" {
		authorizedCmds := state.Conf.Groups[types.GroupApiKey(apiKey)]
		return slices.Contains(authorizedCmds, cmd)
	}

	// No API key provided — allow if main key is set (for local dev)
	// In production, this should return false
	if !state.Conf.CmdApiKey.IsValid {
		return false
	}
	return true
}

// sendWsError sends an error message over WebSocket.
func sendWsError(ws *websocket.Conn, errMsg string) {
	msg := types.WsRawServerMsg{
		Type: types.ErrorMsgType,
		From: "server",
		Msg:  errMsg,
	}
	data, err := json.Marshal(msg)
	if err != nil {
		if state.IsDebug {
			fmt.Printf("Failed to marshal error message: %v\n", err)
		}
		return
	}
	if err := websocket.Message.Send(ws, string(data)); err != nil {
		if state.IsDebug {
			fmt.Printf("Failed to send error message: %v\n", err)
		}
	}
}
