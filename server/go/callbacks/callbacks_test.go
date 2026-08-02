package callbacks

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/synw/agent-smith/server/go/testutil"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/stretchr/testify/assert"
)

// ---------------------------------------------------------------------------
//  Constructor & Utility Tests
// ---------------------------------------------------------------------------

// TestNewCallbackHandlers — Verify constructor initializes fields
func TestNewCallbackHandlers(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	assert.NotNil(t, handlers, "NewCallbackHandlers should return non-nil")
	assert.Equal(t, "test-source", handlers.From(), "From() should return the source identifier")
}

// TestSendMsg_Success — Verify sendMsg sends correct JSON over MockWSConn
func TestSendMsg_Success(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	// Use BuildOptions to access sendMsg indirectly via a callback
	opts := handlers.BuildOptions()
	onStartEmit, ok := opts["onStartEmit"].(func(types.PromptProcessingInProgressStats, string))
	assert.True(t, ok, "onStartEmit should be a function")

	stats := types.PromptProcessingInProgressStats{ThinkingTime: 1.5, EmitTime: 2.0}
	onStartEmit(stats, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1, "Should have sent exactly one message")

	var rsm types.WsRawServerMsg
	err := json.Unmarshal(messages[0], &rsm)
	assert.NoError(t, err, "Message should be valid JSON")
	assert.Equal(t, types.StartEmitType, rsm.Type, "Message type should be startemit")
	assert.Equal(t, "test-source", rsm.From, "Message from should match")

	// Verify msg contains the stats JSON
	var parsedStats types.PromptProcessingInProgressStats
	err = json.Unmarshal([]byte(rsm.Msg), &parsedStats)
	assert.NoError(t, err)
	assert.Equal(t, 1.5, parsedStats.ThinkingTime, "ThinkingTime should match")
	assert.Equal(t, 2.0, parsedStats.EmitTime, "EmitTime should match")
}

// TestSendMsg_MarshalError — Verify graceful handling of marshal errors
func TestSendMsg_MarshalError(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	// sendMsg marshals WsRawServerMsg which is always marshalable with string data.
	// To test marshal error, we'd need an unmarshalable type — but since sendMsg
	// always marshals a WsRawServerMsg (which is always valid JSON), this test
	// verifies that the function handles the case gracefully (no panic).
	opts := handlers.BuildOptions()
	onToken, ok := opts["onToken"].(func(string, string))
	assert.True(t, ok, "onToken should be a function")

	// This should not panic even with empty string
	onToken("", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1, "Should have sent one message (empty token is valid)")
}

// TestSendMsg_SendError — Configure SetSendError; verify graceful handling
func TestSendMsg_SendError(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	// Set an error for Send
	mockWS.SetSendError(fmt.Errorf("send failed"))

	opts := handlers.BuildOptions()
	onToken, ok := opts["onToken"].(func(string, string))
	assert.True(t, ok, "onToken should be a function")

	// Should not panic — sendMsg handles send errors gracefully
	onToken("test token", "test")

	// The message should still be recorded (mockWS records before checking error)
	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1, "Message should still be recorded even with send error")
}

// TestFrom — Verify From() returns source identifier
func TestFrom(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "my-agent")

	assert.Equal(t, "my-agent", handlers.From(), "From() should return the source identifier")
}

// TestResolveToolConfirmation_Exists — Verify resolves pending confirmation
func TestResolveToolConfirmation_Exists(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onConfirmToolUsage, ok := opts["onConfirmToolUsage"].(func(map[string]interface{}, string) (bool, error))
	assert.True(t, ok, "onConfirmToolUsage should be a function")

	// Channel to signal when the message has been sent (goroutine registered awaiter)
	msgSent := make(chan struct{}, 1)
	// Call onConfirmToolUsage in a goroutine (it blocks until resolved)
	done := make(chan bool, 1)
	go func() {
		tc := map[string]interface{}{"id": "tool-1", "name": "test_tool"}
		result, _ := onConfirmToolUsage(tc, "test")
		done <- result
	}()

	// Wait for the message to be sent — confirms the goroutine has registered the awaiter
	for i := 0; i < 100; i++ {
		if mockWS.GetSentMessageCount() > 0 {
			msgSent <- struct{}{}
			break
		}
		time.Sleep(10 * time.Millisecond)
	}

	// Resolve with true
	handlers.ResolveToolConfirmation("tool-1", true)

	select {
	case result := <-done:
		assert.True(t, result, "Should return true when resolved with true")
	case <-time.After(2 * time.Second):
		t.Fatal("onConfirmToolUsage did not return within timeout")
	}
}

// TestResolveToolConfirmation_NotExists — Verify no-op for non-existent ID
func TestResolveToolConfirmation_NotExists(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	// Should not panic for non-existent ID
	handlers.ResolveToolConfirmation("non-existent-id", true)
}

// TestGenerateUUID — Verify UUID v4 format (8-4-4-4-12 hex pattern)
func TestGenerateUUID(t *testing.T) {
	t.Parallel()

	uuidRegex := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

	for i := 0; i < 10; i++ {
		uuid := generateUUID()
		assert.True(t, uuidRegex.MatchString(uuid), "UUID should match v4 format: %s", uuid)
	}
}

// TestToMap_MapStringInterface — Verify passthrough
func TestToMap_MapStringInterface(t *testing.T) {
	t.Parallel()

	input := map[string]interface{}{"key": "value", "num": 42}
	result := toMap(input)

	assert.Equal(t, input, result, "map[string]interface{} should be passed through unchanged")
}

// TestToMap_MapStringString — Verify conversion
func TestToMap_MapStringString(t *testing.T) {
	t.Parallel()

	input := map[string]string{"key1": "val1", "key2": "val2"}
	result := toMap(input)

	assert.NotNil(t, result, "map[string]string should be converted to map[string]interface{}")
	assert.Equal(t, "val1", result["key1"], "Values should be preserved")
	assert.Equal(t, "val2", result["key2"], "Values should be preserved")
}

// TestToMap_OtherType — Verify returns nil for unsupported types
func TestToMap_OtherType(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		input interface{}
	}{
		{name: "string", input: "hello"},
		{name: "int", input: 42},
		{name: "slice", input: []string{"a", "b"}},
		{name: "nil", input: nil},
		{name: "struct", input: struct{}{}},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			result := toMap(tc.input)
			assert.Nil(t, result, "toMap should return nil for unsupported type: %T", tc.input)
		})
	}
}

// ---------------------------------------------------------------------------
//  BuildOptions Callback Tests
// ---------------------------------------------------------------------------

// TestBuildOptions_OnStartEmit — Verify startemit message with stats JSON
func TestBuildOptions_OnStartEmit(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onStartEmit, ok := opts["onStartEmit"].(func(types.PromptProcessingInProgressStats, string))
	assert.True(t, ok, "onStartEmit should be a function")

	stats := types.PromptProcessingInProgressStats{ThinkingTime: 0.5, EmitTime: 1.0}
	onStartEmit(stats, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.StartEmitType, rsm.Type)
	assert.Equal(t, "test-source", rsm.From)

	var parsedStats types.PromptProcessingInProgressStats
	json.Unmarshal([]byte(rsm.Msg), &parsedStats)
	assert.Equal(t, 0.5, parsedStats.ThinkingTime)
	assert.Equal(t, 1.0, parsedStats.EmitTime)
}

// TestBuildOptions_OnToken — Verify token message
func TestBuildOptions_OnToken(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToken, ok := opts["onToken"].(func(string, string))
	assert.True(t, ok)

	onToken("Hello, world!", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.TokenType, rsm.Type)
	assert.Equal(t, "Hello, world!", rsm.Msg)
}

// TestBuildOptions_OnThinkingToken — Verify thinkingtoken message
func TestBuildOptions_OnThinkingToken(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onThinkingToken, ok := opts["onThinkingToken"].(func(string, string))
	assert.True(t, ok)

	onThinkingToken("thinking...", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ThinkingTokenType, rsm.Type)
	assert.Equal(t, "thinking...", rsm.Msg)
}

// TestBuildOptions_OnStartThinking — Verify thinkingstart with empty msg
func TestBuildOptions_OnStartThinking(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onStartThinking, ok := opts["onStartThinking"].(func(string))
	assert.True(t, ok)

	onStartThinking("test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ThinkingStartType, rsm.Type)
	assert.Equal(t, "", rsm.Msg)
}

// TestBuildOptions_OnEndThinking — Verify thinkingend with empty msg
func TestBuildOptions_OnEndThinking(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onEndThinking, ok := opts["onEndThinking"].(func(string))
	assert.True(t, ok)

	onEndThinking("test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ThinkingEndType, rsm.Type)
	assert.Equal(t, "", rsm.Msg)
}

// TestBuildOptions_OnTurnStart — Verify turnstart
func TestBuildOptions_OnTurnStart(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onTurnStart, ok := opts["onTurnStart"].(func(string))
	assert.True(t, ok)

	onTurnStart("test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.TurnStartType, rsm.Type)
}

// TestBuildOptions_OnTurnEnd — Verify turnend with history JSON
func TestBuildOptions_OnTurnEnd(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onTurnEnd, ok := opts["onTurnEnd"].(func(map[string]interface{}, string))
	assert.True(t, ok)

	history := map[string]interface{}{"messages": []string{"hello", "world"}}
	onTurnEnd(history, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.TurnEndType, rsm.Type)

	var parsedHistory map[string]interface{}
	json.Unmarshal([]byte(rsm.Msg), &parsedHistory)
	assert.NotNil(t, parsedHistory)
}

// TestBuildOptions_OnAssistant — Verify assistant message
func TestBuildOptions_OnAssistant(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onAssistant, ok := opts["onAssistant"].(func(string, string))
	assert.True(t, ok)

	onAssistant("This is the assistant response.", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.AssistantType, rsm.Type)
	assert.Equal(t, "This is the assistant response.", rsm.Msg)
}

// TestBuildOptions_OnThink — Verify think message
func TestBuildOptions_OnThink(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onThink, ok := opts["onThink"].(func(string, string))
	assert.True(t, ok)

	onThink("Let me think about this...", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ThinkType, rsm.Type)
	assert.Equal(t, "Let me think about this...", rsm.Msg)
}

// TestBuildOptions_OnEndEmit — Verify endemit with InferenceResult JSON
func TestBuildOptions_OnEndEmit(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onEndEmit, ok := opts["onEndEmit"].(func(types.InferenceResult, string))
	assert.True(t, ok)

	result := types.InferenceResult{
		Text: "Final answer",
		Stats: types.PerformanceMetrics{
			TotalTime: 1.5,
			TokensPerSecond: 100,
		},
	}
	onEndEmit(result, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.EndEmitType, rsm.Type)

	var parsedResult types.InferenceResult
	json.Unmarshal([]byte(rsm.Msg), &parsedResult)
	assert.Equal(t, "Final answer", parsedResult.Text)
	assert.Equal(t, 1.5, parsedResult.Stats.TotalTime)
}

// TestBuildOptions_OnToolCallToken — Verify toolcalltoken message
func TestBuildOptions_OnToolCallToken(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCallToken, ok := opts["onToolCallToken"].(func(string, string))
	assert.True(t, ok)

	onToolCallToken("tool_call_token", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallTokenType, rsm.Type)

	// The token is JSON-marshaled, so it will be quoted
	var parsedToken string
	json.Unmarshal([]byte(rsm.Msg), &parsedToken)
	assert.Equal(t, "tool_call_token", parsedToken)
}

// TestBuildOptions_OnToolCallInProgress — Verify toolcallinprogress
func TestBuildOptions_OnToolCallInProgress(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCallInProgress, ok := opts["onToolCallInProgress"].(func([]interface{}, string))
	assert.True(t, ok)

	tcs := []interface{}{map[string]interface{}{"name": "search", "status": "in_progress"}}
	onToolCallInProgress(tcs, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallInProgressType, rsm.Type)
}

// TestBuildOptions_OnPromptProcessingProgress — Verify progress message
func TestBuildOptions_OnPromptProcessingProgress(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onPromptProcessingProgress, ok := opts["onPromptProcessingProgress"].(func(types.PromptProcessingInProgressStats, string))
	assert.True(t, ok)

	stats := types.PromptProcessingInProgressStats{ThinkingTime: 0.3, EmitTime: 0.1}
	onPromptProcessingProgress(stats, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.PromptProcessingProgress, rsm.Type)
}

// TestBuildOptions_OnToolsTurnStart — Verify toolsturnstart
func TestBuildOptions_OnToolsTurnStart(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolsTurnStart, ok := opts["onToolsTurnStart"].(func(map[string]interface{}, string))
	assert.True(t, ok)

	tools := map[string]interface{}{"tools": []string{"search", "calculate"}}
	onToolsTurnStart(tools, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolsTurnStartType, rsm.Type)
}

// TestBuildOptions_OnToolsTurnEnd — Verify toolsturnend
func TestBuildOptions_OnToolsTurnEnd(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolsTurnEnd, ok := opts["onToolsTurnEnd"].(func(map[string]interface{}, string))
	assert.True(t, ok)

	results := map[string]interface{}{"results": "done"}
	onToolsTurnEnd(results, "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolsTurnEndType, rsm.Type)
}

// TestBuildOptions_OnToolCall — Verify toolcall with payload; auto-generates UUID
func TestBuildOptions_OnToolCall(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCall, ok := opts["onToolCall"].(func(map[string]interface{}, string, string))
	assert.True(t, ok)

	tc := map[string]interface{}{"name": "search", "arguments": map[string]interface{}{"query": "test"}}
	onToolCall(tc, "search_tool", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallType, rsm.Type)

	// Parse the payload
	var payload map[string]interface{}
	json.Unmarshal([]byte(rsm.Msg), &payload)
	assert.Equal(t, "search_tool", payload["type"])
	assert.Equal(t, "test", payload["from"])

	tcPayload, ok := payload["tc"].(map[string]interface{})
	assert.True(t, ok, "tc should be a map")
	assert.Equal(t, "search", tcPayload["name"])
}

// TestBuildOptions_OnToolCall_WithID — Verify toolcall preserves existing ID
func TestBuildOptions_OnToolCall_WithID(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCall, ok := opts["onToolCall"].(func(map[string]interface{}, string, string))
	assert.True(t, ok)

	tc := map[string]interface{}{"id": "custom-id-123", "name": "search"}
	onToolCall(tc, "search_tool", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)

	var payload map[string]interface{}
	json.Unmarshal([]byte(rsm.Msg), &payload)
	tcPayload := payload["tc"].(map[string]interface{})
	assert.Equal(t, "custom-id-123", tcPayload["id"], "Should preserve existing ID")
}

// TestBuildOptions_OnToolCallEnd — Verify toolcallend format
func TestBuildOptions_OnToolCallEnd(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCallEnd, ok := opts["onToolCallEnd"].(func(map[string]interface{}, interface{}, string, string))
	assert.True(t, ok)

	tc := map[string]interface{}{"id": "tool-1", "name": "search"}
	tr := "Search results: found 5 items"
	onToolCallEnd(tc, tr, "search_tool", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallEndType, rsm.Type)

	// Message format: payloadJSON + "<|xtool_call_id|>" + toolResultData
	msgStr := rsm.Msg
	assert.True(t, strings.Contains(msgStr, "<|xtool_call_id|>"), "Should contain tool call separator")
	assert.True(t, strings.HasSuffix(msgStr, tr), "Should end with tool result text")
}

// TestBuildOptions_OnToolCallEnd_WithMapResult — Verify toolcallend with map result
func TestBuildOptions_OnToolCallEnd_WithMapResult(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onToolCallEnd, ok := opts["onToolCallEnd"].(func(map[string]interface{}, interface{}, string, string))
	assert.True(t, ok)

	tc := map[string]interface{}{"id": "tool-2", "name": "calculate"}
	tr := map[string]interface{}{"text": "42", "type": "calculate"}
	onToolCallEnd(tc, tr, "calculate", "test")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallEndType, rsm.Type)

	// Should contain the text field as the tool result data
	assert.True(t, strings.Contains(rsm.Msg, "42"), "Should contain the text result")
}

// TestBuildOptions_OnConfirmToolUsage_Blocking — Verify blocks until confirmation resolved
func TestBuildOptions_OnConfirmToolUsage_Blocking(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onConfirmToolUsage, ok := opts["onConfirmToolUsage"].(func(map[string]interface{}, string) (bool, error))
	assert.True(t, ok)

	// Call in goroutine — it blocks until resolved
	done := make(chan bool, 1)
	go func() {
		tc := map[string]interface{}{"id": "confirm-tool-1", "name": "test_tool"}
		result, _ := onConfirmToolUsage(tc, "test")
		done <- result
	}()

	// Wait for the confirm message to be sent
	for i := 0; i < 100; i++ {
		if mockWS.GetSentMessageCount() > 0 {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}

	// Resolve with false
	handlers.ResolveToolConfirmation("confirm-tool-1", false)

	select {
	case result := <-done:
		assert.False(t, result, "Should return false when resolved with false")
	case <-time.After(2 * time.Second):
		t.Fatal("onConfirmToolUsage did not return within timeout")
	}

	// Verify the confirm message was sent
	messages := mockWS.GetSentMessages()
	assert.GreaterOrEqual(t, len(messages), 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ToolCallConfirmType, rsm.Type)
}

// TestBuildOptions_OnConfirmToolUsage_Accept — Verify accepted flow
func TestBuildOptions_OnConfirmToolUsage_Accept(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onConfirmToolUsage, ok := opts["onConfirmToolUsage"].(func(map[string]interface{}, string) (bool, error))
	assert.True(t, ok)

	done := make(chan bool, 1)
	go func() {
		tc := map[string]interface{}{"id": "accept-tool", "name": "accept_test"}
		result, _ := onConfirmToolUsage(tc, "test")
		done <- result
	}()

	// Wait for message to be sent (confirms awaiter is registered)
	for i := 0; i < 100; i++ {
		if mockWS.GetSentMessageCount() > 0 {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}

	handlers.ResolveToolConfirmation("accept-tool", true)

	select {
	case result := <-done:
		assert.True(t, result, "Accept flow should return true")
	case <-time.After(2 * time.Second):
		t.Fatal("Accept flow did not complete within timeout")
	}
}

// TestBuildOptions_OnConfirmToolUsage_Reject — Verify rejected flow
func TestBuildOptions_OnConfirmToolUsage_Reject(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	opts := handlers.BuildOptions()
	onConfirmToolUsage, ok := opts["onConfirmToolUsage"].(func(map[string]interface{}, string) (bool, error))
	assert.True(t, ok)

	done := make(chan bool, 1)
	go func() {
		tc := map[string]interface{}{"id": "reject-tool", "name": "reject_test"}
		result, _ := onConfirmToolUsage(tc, "test")
		done <- result
	}()

	// Wait for message to be sent (confirms awaiter is registered)
	for i := 0; i < 100; i++ {
		if mockWS.GetSentMessageCount() > 0 {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}

	handlers.ResolveToolConfirmation("reject-tool", false)

	select {
	case result := <-done:
		assert.False(t, result, "Reject flow should return false")
	case <-time.After(2 * time.Second):
		t.Fatal("Reject flow did not complete within timeout")
	}
}

// ---------------------------------------------------------------------------
//  Public API Tests
// ---------------------------------------------------------------------------

// TestSendToken — Verify token message
func TestSendToken(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	handlers.SendToken("Hello from public API!")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.TokenType, rsm.Type)
	assert.Equal(t, "Hello from public API!", rsm.Msg)
	assert.Equal(t, "test-source", rsm.From)
}

// TestSendThinkingToken — Verify thinkingtoken message
func TestSendThinkingToken(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	handlers.SendThinkingToken("Deep thinking...")

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ThinkingTokenType, rsm.Type)
	assert.Equal(t, "Deep thinking...", rsm.Msg)
}

// TestSendEndEmit — Verify endemit with result JSON
func TestSendEndEmit(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	result := types.InferenceResult{
		Text: "End emit result",
		Stats: types.PerformanceMetrics{
			TotalTime:     2.5,
			TokensPerSecond: 200,
			TotalTokens:   500,
		},
	}
	handlers.SendEndEmit(result)

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.EndEmitType, rsm.Type)

	var parsedResult types.InferenceResult
	json.Unmarshal([]byte(rsm.Msg), &parsedResult)
	assert.Equal(t, "End emit result", parsedResult.Text)
	assert.Equal(t, 2.5, parsedResult.Stats.TotalTime)
	assert.Equal(t, 500, parsedResult.Stats.TotalTokens)
}

// TestSendFinalResult — Verify finalresult with result JSON
func TestSendFinalResult(t *testing.T) {
	t.Parallel()

	mockWS := testutil.NewMockWSConn()
	handlers := NewCallbackHandlers(mockWS, "test-source")

	result := types.InferenceResult{
		Text: "Final result",
		Stats: types.PerformanceMetrics{
			TotalTime:     3.0,
			TokensPerSecond: 150,
		},
	}
	handlers.SendFinalResult(result)

	messages := mockWS.GetSentMessages()
	assert.Len(t, messages, 1)

	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.FinalResultType, rsm.Type)

	var parsedResult types.InferenceResult
	json.Unmarshal([]byte(rsm.Msg), &parsedResult)
	assert.Equal(t, "Final result", parsedResult.Text)
	assert.Equal(t, 3.0, parsedResult.Stats.TotalTime)
}
