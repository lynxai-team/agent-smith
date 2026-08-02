package types

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

// ---------------------------------------------------------------------------
// 1. WsClientMsg round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestWsClientMsg_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := WsClientMsg{
		Command: "run",
		Type:    CommandMsgType,
		Feature: "test-feature",
		Payload: map[string]interface{}{
			"key1": "value1",
			"key2": 42,
			"key3": true,
		},
		Options: map[string]interface{}{
			"timeout": 30,
		},
	}

	// Marshal to JSON
	data, err := json.Marshal(original)
	assert.NoError(t, err, "Marshalling WsClientMsg should not error")
	assert.NotEmpty(t, data, "Marshaled data should not be empty")

	// Verify expected JSON fields are present
	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	assert.NoError(t, err)
	assert.Equal(t, "run", raw["command"])
	assert.Equal(t, "command", raw["type"])
	assert.Equal(t, "test-feature", raw["feature"])

	// Unmarshal back
	var decoded WsClientMsg
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err, "Unmarshalling WsClientMsg should not error")

	// Round-trip assertions
	assert.Equal(t, original.Command, decoded.Command)
	assert.Equal(t, original.Type, decoded.Type)
	assert.Equal(t, original.Feature, decoded.Feature)
	assert.Equal(t, original.Payload["key1"], decoded.Payload["key1"])
	// JSON numbers unmarshal as float64
	assert.Equal(t, float64(42), decoded.Payload["key2"])
	assert.Equal(t, original.Payload["key3"], decoded.Payload["key3"])
	assert.Equal(t, float64(30), decoded.Options["timeout"])

	// --- Test with omittable fields (zero values) ---
	minimal := WsClientMsg{
		Command: "stop",
		Type:    SystemMsgType,
	}

	data2, err := json.Marshal(minimal)
	assert.NoError(t, err)

	var raw2 map[string]interface{}
	err = json.Unmarshal(data2, &raw2)
	assert.NoError(t, err)

	// Feature, Payload, Options should be omitted when zero
	_, featureExists := raw2["feature"]
	_, payloadExists := raw2["payload"]
	_, optionsExists := raw2["options"]
	assert.False(t, featureExists, "empty Feature should be omitted")
	assert.False(t, payloadExists, "nil Payload should be omitted")
	assert.False(t, optionsExists, "nil Options should be omitted")

	var decoded2 WsClientMsg
	err = json.Unmarshal(data2, &decoded2)
	assert.NoError(t, err)
	assert.Equal(t, "stop", decoded2.Command)
	assert.Equal(t, SystemMsgType, decoded2.Type)
}

// ---------------------------------------------------------------------------
// 2. WsRawServerMsg round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestWsRawServerMsg_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := WsRawServerMsg{
		Type: ErrorMsgType,
		From: "server",
		Msg:  "something went wrong",
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	var decoded WsRawServerMsg
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.Equal(t, original.Type, decoded.Type)
	assert.Equal(t, original.From, decoded.From)
	assert.Equal(t, original.Msg, decoded.Msg)

	// Test with other message types
	for _, msgType := range []WsServerMsgType{
		StartEmitType, TokenType, ThinkingTokenType, TurnStartType, TurnEndType,
		AssistantType, ThinkingStartType, ThinkingEndType, ToolCallInProgressType,
		PromptProcessingProgress, ToolCallTokenType, ToolsTurnStartType,
		ToolsTurnEndType, ToolCallType, ToolCallEndType, ToolCallConfirmType,
		FinalResultType, ThinkType, EndEmitType,
	} {
		t.Run(string(msgType), func(t *testing.T) {
			msg := WsRawServerMsg{
				Type: msgType,
				From: "agent",
				Msg:  "test message",
			}

			data, err := json.Marshal(msg)
			assert.NoError(t, err)

			var decoded WsRawServerMsg
			err = json.Unmarshal(data, &decoded)
			assert.NoError(t, err)
			assert.Equal(t, msgType, decoded.Type)
			assert.Equal(t, "agent", decoded.From)
			assert.Equal(t, "test message", decoded.Msg)
		})
	}
}

// ---------------------------------------------------------------------------
// 3. WsServerMsgType constants — verify all 20 message type constants
// ---------------------------------------------------------------------------

func TestWsServerMsgType_Constants(t *testing.T) {
	t.Parallel()

	expected := map[WsServerMsgType]string{
		ErrorMsgType:             "error",
		StartEmitType:            "startemit",
		TokenType:                "token",
		ThinkingTokenType:        "thinkingtoken",
		TurnStartType:            "turnstart",
		TurnEndType:              "turnend",
		AssistantType:            "assistant",
		ThinkingStartType:        "thinkingstart",
		ThinkingEndType:          "thinkingend",
		ToolCallInProgressType:   "toolcallinprogress",
		PromptProcessingProgress: "promptprocessingprogress",
		ToolCallTokenType:        "toolcalltoken",
		ToolsTurnStartType:       "toolsturnstart",
		ToolsTurnEndType:         "toolsturnend",
		ToolCallType:             "toolcall",
		ToolCallEndType:          "toolcallend",
		ToolCallConfirmType:      "toolcallconfirm",
		FinalResultType:          "finalresult",
		ThinkType:                "think",
		EndEmitType:              "endemit",
	}

	for msgType, expectedStr := range expected {
		t.Run(string(msgType), func(t *testing.T) {
			assert.Equal(t, expectedStr, string(msgType))
		})
	}

	// Verify we have exactly 20 constants
	assert.Equal(t, 20, len(expected), "Should have exactly 20 WsServerMsgType constants")
}

// ---------------------------------------------------------------------------
// 4. WsClientMsgType constants — verify Command and System types
// ---------------------------------------------------------------------------

func TestWsClientMsgType_Constants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, WsClientMsgType("command"), CommandMsgType, "CommandMsgType should be 'command'")
	assert.Equal(t, WsClientMsgType("system"), SystemMsgType, "SystemMsgType should be 'system'")

	// Verify string conversion
	assert.Equal(t, "command", string(CommandMsgType))
	assert.Equal(t, "system", string(SystemMsgType))
}

// ---------------------------------------------------------------------------
// 5. ToolCallSpec round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestToolCallSpec_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := ToolCallSpec{
		ID:    "call_abc123",
		Name:  "execute_code",
		Arguments: map[string]interface{}{
			"code":      "print('hello')",
			"language":  "python",
			"timeout":   60,
			"interactive": true,
		},
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	// Verify JSON structure
	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	assert.NoError(t, err)
	assert.Equal(t, "call_abc123", raw["id"])
	assert.Equal(t, "execute_code", raw["name"])
	assert.NotNil(t, raw["arguments"])

	var decoded ToolCallSpec
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.Equal(t, original.ID, decoded.ID)
	assert.Equal(t, original.Name, decoded.Name)
	assert.Equal(t, original.Arguments["code"], decoded.Arguments["code"])
	assert.Equal(t, original.Arguments["language"], decoded.Arguments["language"])
	// JSON numbers unmarshal as float64
	assert.Equal(t, float64(60), decoded.Arguments["timeout"])
	assert.Equal(t, original.Arguments["interactive"], decoded.Arguments["interactive"])

	// Test with empty ID (should be omitted)
	emptyID := ToolCallSpec{
		Name:      "list_files",
		Arguments: map[string]interface{}{"path": "/tmp"},
	}

	data2, err := json.Marshal(emptyID)
	assert.NoError(t, err)

	var raw2 map[string]interface{}
	err = json.Unmarshal(data2, &raw2)
	assert.NoError(t, err)
	_, idExists := raw2["id"]
	assert.False(t, idExists, "empty ID should be omitted")

	var decoded2 ToolCallSpec
	err = json.Unmarshal(data2, &decoded2)
	assert.NoError(t, err)
	assert.Equal(t, "list_files", decoded2.Name)
}

// ---------------------------------------------------------------------------
// 6. InferenceResult round-trip JSON serialization (includes nested PerformanceMetrics)
// ---------------------------------------------------------------------------

func TestInferenceResult_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := InferenceResult{
		Text: "Hello, world!",
		Stats: PerformanceMetrics{
			ThinkingTime:       1.5,
			ThinkingTimeFormat: "1.5s",
			EmitTime:           0.8,
			EmitTimeFormat:     "0.8s",
			TotalTime:          2.3,
			TotalTimeFormat:    "2.3s",
			TokensPerSecond:    45.6,
			TotalTokens:        105,
		},
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	// Verify nested structure
	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	assert.NoError(t, err)
	assert.Equal(t, "Hello, world!", raw["text"])
	stats, ok := raw["stats"].(map[string]interface{})
	assert.True(t, ok, "stats should be a map")
	assert.Equal(t, float64(1.5), stats["thinkingTime"])
	assert.Equal(t, float64(105), stats["totalTokens"])

	var decoded InferenceResult
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.Equal(t, original.Text, decoded.Text)
	assert.Equal(t, original.Stats.ThinkingTime, decoded.Stats.ThinkingTime)
	assert.Equal(t, original.Stats.ThinkingTimeFormat, decoded.Stats.ThinkingTimeFormat)
	assert.Equal(t, original.Stats.EmitTime, decoded.Stats.EmitTime)
	assert.Equal(t, original.Stats.EmitTimeFormat, decoded.Stats.EmitTimeFormat)
	assert.Equal(t, original.Stats.TotalTime, decoded.Stats.TotalTime)
	assert.Equal(t, original.Stats.TotalTimeFormat, decoded.Stats.TotalTimeFormat)
	assert.Equal(t, original.Stats.TokensPerSecond, decoded.Stats.TokensPerSecond)
	assert.Equal(t, original.Stats.TotalTokens, decoded.Stats.TotalTokens)
}

// ---------------------------------------------------------------------------
// 7. PerformanceMetrics round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestPerformanceMetrics_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := PerformanceMetrics{
		ThinkingTime:       0.0,
		ThinkingTimeFormat: "",
		EmitTime:           1.234,
		EmitTimeFormat:     "1.23s",
		TotalTime:          5.678,
		TotalTimeFormat:    "5.68s",
		TokensPerSecond:    42.0,
		TotalTokens:        238,
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	var decoded PerformanceMetrics
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.InDelta(t, original.ThinkingTime, decoded.ThinkingTime, 0.001)
	assert.Equal(t, original.ThinkingTimeFormat, decoded.ThinkingTimeFormat)
	assert.InDelta(t, original.EmitTime, decoded.EmitTime, 0.001)
	assert.Equal(t, original.EmitTimeFormat, decoded.EmitTimeFormat)
	assert.InDelta(t, original.TotalTime, decoded.TotalTime, 0.001)
	assert.Equal(t, original.TotalTimeFormat, decoded.TotalTimeFormat)
	assert.InDelta(t, original.TokensPerSecond, decoded.TokensPerSecond, 0.001)
	assert.Equal(t, original.TotalTokens, decoded.TotalTokens)

	// Test with zero values — all fields should be present in JSON (no omitempty)
	zero := PerformanceMetrics{}
	data2, err := json.Marshal(zero)
	assert.NoError(t, err)

	var raw map[string]interface{}
	err = json.Unmarshal(data2, &raw)
	assert.NoError(t, err)

	// All fields should be present even when zero (no omitempty tags)
	assert.Contains(t, raw, "thinkingTime")
	assert.Contains(t, raw, "thinkingTimeFormat")
	assert.Contains(t, raw, "emitTime")
	assert.Contains(t, raw, "emitTimeFormat")
	assert.Contains(t, raw, "totalTime")
	assert.Contains(t, raw, "totalTimeFormat")
	assert.Contains(t, raw, "tokensPerSecond")
	assert.Contains(t, raw, "totalTokens")

	var decoded2 PerformanceMetrics
	err = json.Unmarshal(data2, &decoded2)
	assert.NoError(t, err)
	assert.Equal(t, 0.0, decoded2.ThinkingTime)
	assert.Equal(t, 0, decoded2.TotalTokens)
}

// ---------------------------------------------------------------------------
// 8. Conf round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestConf_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := Conf{
		Origins: []string{"http://localhost:3000", "https://example.com"},
		CmdApiKey: ValidApiKey{
			Key:     "secret-api-key-123",
			IsValid: true,
		},
		Groups: map[GroupApiKey]AuthorizedCmds{
			"group-admin":  {"run", "stop", "status"},
			"group-viewer": {"status"},
		},
		ApiKeys: []GroupApiKey{"group-admin", "group-viewer"},
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	var decoded Conf
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	// Origins
	assert.Equal(t, original.Origins, decoded.Origins)
	assert.Len(t, decoded.Origins, 2)
	assert.Equal(t, "http://localhost:3000", decoded.Origins[0])
	assert.Equal(t, "https://example.com", decoded.Origins[1])

	// CmdApiKey
	assert.Equal(t, original.CmdApiKey.Key, decoded.CmdApiKey.Key)
	assert.Equal(t, original.CmdApiKey.IsValid, decoded.CmdApiKey.IsValid)

	// Groups
	assert.Len(t, decoded.Groups, 2)
	assert.Equal(t, AuthorizedCmds{"run", "stop", "status"}, decoded.Groups["group-admin"])
	assert.Equal(t, AuthorizedCmds{"status"}, decoded.Groups["group-viewer"])

	// ApiKeys
	assert.Equal(t, original.ApiKeys, decoded.ApiKeys)

	// Test with minimal Conf
	minimal := Conf{}
	data2, err := json.Marshal(minimal)
	assert.NoError(t, err)

	var decoded2 Conf
	err = json.Unmarshal(data2, &decoded2)
	assert.NoError(t, err)
	assert.Nil(t, decoded2.Origins)
	assert.Equal(t, "", decoded2.CmdApiKey.Key)
	assert.False(t, decoded2.CmdApiKey.IsValid)
	assert.Empty(t, decoded2.Groups)
	assert.Empty(t, decoded2.ApiKeys)
}

// ---------------------------------------------------------------------------
// 9. ValidApiKey round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestValidApiKey_MarshalUnmarshal(t *testing.T) {
	t.Parallel()

	original := ValidApiKey{
		Key:     "my-secret-key",
		IsValid: true,
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	// Verify JSON structure — ValidApiKey has no JSON tags, so keys are "Key" and "IsValid"
	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	assert.NoError(t, err)
	assert.Equal(t, "my-secret-key", raw["Key"])
	assert.Equal(t, true, raw["IsValid"])

	var decoded ValidApiKey
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.Equal(t, original.Key, decoded.Key)
	assert.Equal(t, original.IsValid, decoded.IsValid)

	// Test with invalid key
	invalid := ValidApiKey{
		Key:     "bad-key",
		IsValid: false,
	}

	data2, err := json.Marshal(invalid)
	assert.NoError(t, err)

	var decoded2 ValidApiKey
	err = json.Unmarshal(data2, &decoded2)
	assert.NoError(t, err)
	assert.Equal(t, "bad-key", decoded2.Key)
	assert.False(t, decoded2.IsValid)

	// Test with empty key
	empty := ValidApiKey{}
	data3, err := json.Marshal(empty)
	assert.NoError(t, err)

	var decoded3 ValidApiKey
	err = json.Unmarshal(data3, &decoded3)
	assert.NoError(t, err)
	assert.Equal(t, "", decoded3.Key)
	assert.False(t, decoded3.IsValid)
}

// ---------------------------------------------------------------------------
// 10. PromptProcessingInProgressStats round-trip JSON serialization
// ---------------------------------------------------------------------------

func TestPromptProcessingInProgressStats(t *testing.T) {
	t.Parallel()

	original := PromptProcessingInProgressStats{
		ThinkingTime: 2.5,
		EmitTime:     1.3,
	}

	data, err := json.Marshal(original)
	assert.NoError(t, err)
	assert.NotEmpty(t, data)

	var decoded PromptProcessingInProgressStats
	err = json.Unmarshal(data, &decoded)
	assert.NoError(t, err)

	assert.InDelta(t, original.ThinkingTime, decoded.ThinkingTime, 0.001)
	assert.InDelta(t, original.EmitTime, decoded.EmitTime, 0.001)

	// Test with zero values — fields should be omitted due to omitempty
	zero := PromptProcessingInProgressStats{}
	data2, err := json.Marshal(zero)
	assert.NoError(t, err)

	var raw map[string]interface{}
	err = json.Unmarshal(data2, &raw)
	assert.NoError(t, err)

	// Both fields should be omitted when zero (omitempty is set)
	_, thinkingExists := raw["thinkingTime"]
	_, emitExists := raw["emitTime"]
	assert.False(t, thinkingExists, "zero ThinkingTime should be omitted")
	assert.False(t, emitExists, "zero EmitTime should be omitted")

	// Test with only one field populated
	partial := PromptProcessingInProgressStats{
		ThinkingTime: 3.0,
	}

	data3, err := json.Marshal(partial)
	assert.NoError(t, err)

	var raw3 map[string]interface{}
	err = json.Unmarshal(data3, &raw3)
	assert.NoError(t, err)

	_, thinkingExists3 := raw3["thinkingTime"]
	_, emitExists3 := raw3["emitTime"]
	assert.True(t, thinkingExists3, "ThinkingTime should be present")
	assert.False(t, emitExists3, "zero EmitTime should be omitted")

	var decoded3 PromptProcessingInProgressStats
	err = json.Unmarshal(data3, &decoded3)
	assert.NoError(t, err)
	assert.InDelta(t, 3.0, decoded3.ThinkingTime, 0.001)
	assert.Equal(t, 0.0, decoded3.EmitTime)
}
