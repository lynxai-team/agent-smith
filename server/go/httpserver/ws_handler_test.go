package httpserver

import (
	"encoding/json"
	"testing"

	"github.com/synw/agent-smith/server/go/conf"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/testutil"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/synw/agent-smith/server/go/websock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupWSConf initializes state.Conf with a test configuration (with main key and groups).
func setupWSConf(t *testing.T) {
	t.Helper()
	yamlData := []byte(`
api_key: "test-main-key-12345"
origins:
  - "http://localhost:5173"
groups:
  editor:
    - "read"
    - "write"
`)
	state.SetConf(conf.InitConfFromReader(yamlData))
}

// setupWSConfNoMainKey initializes state.Conf without a main API key.
func setupWSConfNoMainKey(t *testing.T) {
	t.Helper()
	yamlData := []byte(`
api_key: ""
origins:
  - "http://localhost:5173"
groups:
  editor:
    - "read"
    - "write"
`)
	state.SetConf(conf.InitConfFromReader(yamlData))
}

// ---------------------------------------------------------------------------
// System Message Tests
// ---------------------------------------------------------------------------

// TestHandleSystemMessage_Stop verifies stop command sends error message.
func TestHandleSystemMessage_Stop(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "stop",
	}

	handleSystemMessage(ws, session, msg)

	// Verify error message was sent
	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1, "Should send exactly one error message")

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "Stop command received")
}

// TestHandleSystemMessage_ConfirmTool_Valid verifies valid confirmtool resolves session channel.
func TestHandleSystemMessage_ConfirmTool_Valid(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	// Set up a pending confirmation using helper method
	toolID := "tc-123"
	confirmCh := make(chan bool, 1)
	session.SetConfirmChannel(toolID, confirmCh)

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"id":      toolID,
			"confirm": true,
		},
	}

	handleSystemMessage(ws, session, msg)

	// Verify no error message was sent (success case)
	msgs := ws.GetSentMessages()
	assert.Empty(t, msgs, "Valid confirmtool should not send error")

	// Verify the channel was resolved
	select {
	case val := <-confirmCh:
		assert.True(t, val, "Channel should be resolved with true")
	default:
		t.Fatal("Channel was not resolved")
	}

	// Verify the confirmation was removed from session using helper method
	_, exists := session.GetConfirmChannel(toolID)
	assert.False(t, exists, "Confirmation should be removed after resolution")
}

// TestHandleSystemMessage_ConfirmTool_NoPayload verifies error when payload is nil.
func TestHandleSystemMessage_ConfirmTool_NoPayload(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: nil,
	}

	handleSystemMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "payload")
}

// TestHandleSystemMessage_ConfirmTool_InvalidId verifies error when ID missing/invalid.
func TestHandleSystemMessage_ConfirmTool_InvalidId(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"confirm": true,
		},
	}

	handleSystemMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "id")
}

// TestHandleSystemMessage_ConfirmTool_InvalidConfirm verifies error when confirm not boolean.
func TestHandleSystemMessage_ConfirmTool_InvalidConfirm(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"id":      "tc-123",
			"confirm": "yes", // not a boolean
		},
	}

	handleSystemMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "confirm")
}

// TestHandleSystemMessage_ConfirmTool_NoPending verifies error when no pending confirmation.
func TestHandleSystemMessage_ConfirmTool_NoPending(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"id":      "nonexistent-tc",
			"confirm": true,
		},
	}

	handleSystemMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "No pending confirmation")
}

// TestHandleSystemMessage_UnknownCommand verifies error for unknown system command.
func TestHandleSystemMessage_UnknownCommand(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "unknown_cmd",
	}

	handleSystemMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "Unknown system command")
}

// ---------------------------------------------------------------------------
// Command Message Tests
// ---------------------------------------------------------------------------

// TestHandleCommandMessage_NoPayload verifies error when payload is nil.
func TestHandleCommandMessage_NoPayload(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "agent",
		Command: "test-cmd",
		Payload: nil,
	}

	handleCommandMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "payload")
}

// TestHandleCommandMessage_AgentFeature verifies routes to executeAgent.
func TestHandleCommandMessage_AgentFeature(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "agent",
		Command: "test-agent-cmd",
		Payload: map[string]interface{}{
			"key":    "value",
			"prompt": "test prompt",
		},
	}

	handleCommandMessage(ws, session, msg)

	msgs := ws.GetSentMessages()

	// The function should proceed to executeAgent (not return "Unsupported feature" error)
	// Since executeAgent will try to run lm binary which doesn't exist,
	// we expect an error message from lm.RunCmd
	require.NotEmpty(t, msgs, "Should send at least one message (from executeAgent flow)")

	// Verify it's not the "Unsupported feature" error
	for _, m := range msgs {
		var rawMsg types.WsRawServerMsg
		err := json.Unmarshal(m, &rawMsg)
		require.NoError(t, err)
		assert.NotContains(t, rawMsg.Msg, "Unsupported feature",
			"Should not return 'Unsupported feature' error for agent feature")
	}
}

// TestHandleCommandMessage_WorkflowFeature verifies error (not yet implemented).
func TestHandleCommandMessage_WorkflowFeature(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "workflow",
		Command: "test-workflow-cmd",
		Payload: map[string]interface{}{
			"key": "value",
		},
	}

	handleCommandMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "not yet implemented")
}

// TestHandleCommandMessage_UnknownFeature verifies error for unsupported feature.
func TestHandleCommandMessage_UnknownFeature(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "unknown-feature",
		Command: "test-cmd",
		Payload: map[string]interface{}{
			"key": "value",
		},
	}

	handleCommandMessage(ws, session, msg)

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "Unsupported feature")
}

// ---------------------------------------------------------------------------
// Authorization Tests
// ---------------------------------------------------------------------------

// TestExecuteAgent_Unauthorized verifies error when command not authorized.
func TestExecuteAgent_Unauthorized(t *testing.T) {
	// Use config without main key — empty apiKey should not be authorized
	setupWSConfNoMainKey(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	// No API key provided, no main key → not authorized
	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "agent",
		Command: "test-cmd",
		Payload: map[string]interface{}{
			"key":    "value",
			"prompt": "test prompt",
		},
	}

	executeAgent(ws, session, msg, "")

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Contains(t, rawMsg.Msg, "not authorized")
}

// TestExecuteAgent_Success verifies the agent execution flow proceeds past authorization
// when main key is set (local dev mode).
//
// Note: executeAgent creates its own cmdexec.NewRealCmdRunner() internally.
// Since production code cannot be modified, this test verifies authorization behavior
// rather than full lm binary execution. A future refactor to inject CmdRunner would
// allow use of testutil.MockCmdRunner per the phase-8 spec.
func TestExecuteAgent_Success(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()
	session := &state.WsSession{
		ConfirmToolCalls: make(map[string]chan bool),
	}

	msg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "agent",
		Command: "test-cmd",
		Payload: map[string]interface{}{
			"key":    "value",
			"prompt": "test prompt",
		},
	}

	executeAgent(ws, session, msg, "test-main-key-12345")

	msgs := ws.GetSentMessages()

	// The function should proceed past authorization (main key matches)
	// It will try to run lm.RunCmd which will fail (no lm binary)
	// We verify that messages were sent (from the execution attempt)
	require.NotEmpty(t, msgs, "Should send messages when authorized (execution flow proceeds)")

	// Verify no "not authorized" error
	for _, m := range msgs {
		var rawMsg types.WsRawServerMsg
		err := json.Unmarshal(m, &rawMsg)
		require.NoError(t, err)
		assert.NotContains(t, rawMsg.Msg, "not authorized",
			"Should not return 'not authorized' when main key is set")
	}
}

// TestIsCommandAuthorized_MainKey verifies main API key → all commands authorized.
func TestIsCommandAuthorized_MainKey(t *testing.T) {
	setupWSConf(t)

	// Main key should authorize all commands
	assert.True(t, isCommandAuthorized("test-main-key-12345", "any-command"),
		"Main key should authorize all commands")
	assert.True(t, isCommandAuthorized("test-main-key-12345", "another-command"),
		"Main key should authorize any command")
}

// TestIsCommandAuthorized_GroupKey verifies group key → only authorized commands.
func TestIsCommandAuthorized_GroupKey(t *testing.T) {
	setupWSConf(t)

	// Group key "editor" should authorize "read" and "write" but not "delete"
	assert.True(t, isCommandAuthorized("editor", "read"),
		"Editor group key should authorize 'read'")
	assert.True(t, isCommandAuthorized("editor", "write"),
		"Editor group key should authorize 'write'")
	assert.False(t, isCommandAuthorized("editor", "delete"),
		"Editor group key should NOT authorize 'delete'")
	assert.False(t, isCommandAuthorized("editor", "unknown-cmd"),
		"Editor group key should NOT authorize unknown commands")
}

// TestIsCommandAuthorized_NoKey_NoMainKey verifies not authorized when no key and no main key.
func TestIsCommandAuthorized_NoKey_NoMainKey(t *testing.T) {
	setupWSConfNoMainKey(t)

	// No API key, no main key → not authorized
	assert.False(t, isCommandAuthorized("", "any-command"),
		"Empty key with no main key should not be authorized")
}

// TestIsCommandAuthorized_NoKey_Rejected verifies that empty keys are always rejected,
// even when a main API key is configured. The dev bypass has been removed.
func TestIsCommandAuthorized_NoKey_Rejected(t *testing.T) {
	setupWSConf(t)

	// No API key but main key is set → still rejected (no dev bypass)
	assert.False(t, isCommandAuthorized("", "any-command"),
		"Empty key should always be rejected (no dev bypass)")
}

// ---------------------------------------------------------------------------
// Validate API Key Tests
// ---------------------------------------------------------------------------

// TestValidateApiKey verifies the validateApiKey function accepts valid keys
// and rejects invalid/missing ones.
func TestValidateApiKey(t *testing.T) {
	setupWSConf(t)

	// Main API key should be accepted
	assert.True(t, validateApiKey("test-main-key-12345"),
		"Main API key should be accepted")

	// Group API keys should be accepted (group "editor" is in conf.ApiKeys)
	assert.True(t, validateApiKey("editor"),
		"Group API key 'editor' should be accepted")

	// Empty key should be rejected
	assert.False(t, validateApiKey(""),
		"Empty key should be rejected")

	// Invalid/unknown key should be rejected
	assert.False(t, validateApiKey("completely-wrong-key-xyz"),
		"Invalid key should be rejected")
}

// ---------------------------------------------------------------------------
// Utility Tests
// ---------------------------------------------------------------------------

// TestSendWsError verifies error message format sent over MockWSConn.
func TestSendWsError(t *testing.T) {
	setupWSConf(t)

	ws := testutil.NewMockWSConn()

	sendWsError(ws, "test error message")

	msgs := ws.GetSentMessages()
	require.Len(t, msgs, 1)

	var rawMsg types.WsRawServerMsg
	err := json.Unmarshal(msgs[0], &rawMsg)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, rawMsg.Type)
	assert.Equal(t, "server", rawMsg.From)
	assert.Equal(t, "test error message", rawMsg.Msg)
}

// TestMaskApiKey verifies the maskApiKey function masks keys correctly.
func TestMaskApiKey(t *testing.T) {
	// Short key (<=8 chars) returns "****"
	assert.Equal(t, "****", maskApiKey("short"))
	assert.Equal(t, "****", maskApiKey("12345678"))

	// Normal key (e.g., 16 chars) returns first 4 + "****" + last 4
	assert.Equal(t, "abcd****mnop", maskApiKey("abcdefghijklmnop"))

	// Empty string returns "****"
	assert.Equal(t, "****", maskApiKey(""))
}

// Verify MockWSConn implements websock.WSConn interface.
var _ websock.WSConn = (*testutil.MockWSConn)(nil)
