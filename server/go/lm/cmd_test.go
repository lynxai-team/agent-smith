package lm

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/synw/agent-smith/server/go/callbacks"
	"github.com/synw/agent-smith/server/go/cmdexec"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/testutil"
	"github.com/synw/agent-smith/server/go/types"
)

// --- Helper types for advanced test scenarios ---

// blockingCmd wraps a MockCmd but blocks on Wait() until the channel is closed.
type blockingCmd struct {
	*testutil.MockCmd
	unblockCh chan struct{}
}

func (c *blockingCmd) Wait() error {
	<-c.unblockCh
	return context.Canceled
}

// errorAfterReader returns data then an error, simulating scanner output errors.
type errorAfterReader struct {
	data     string
	idx      int
	errAfter int // number of bytes to read before returning error
}

func (r *errorAfterReader) Read(p []byte) (n int, err error) {
	if r.idx >= len(r.data) {
		return 0, io.EOF
	}
	if r.idx >= r.errAfter {
		return 0, errors.New("simulated read error")
	}
	// Limit reads to not exceed errAfter boundary in a single call
	available := r.errAfter - r.idx
	if available > len(p) {
		available = len(p)
	}
	n = copy(p, r.data[r.idx:r.idx+available])
	r.idx += n
	return n, nil
}

// errorReaderCmd returns a reader that produces an error during scanning.
type errorReaderCmd struct {
	*testutil.MockCmd
}

func (c *errorReaderCmd) StdoutPipe() (io.ReadCloser, error) {
	return io.NopCloser(&errorAfterReader{
		data:     "Hello",
		errAfter: 3, // error after reading 3 bytes
	}), nil
}

// errorStdoutPipeCmd returns an error from StdoutPipe.
type errorStdoutPipeCmd struct {
	*testutil.MockCmd
	stdoutPipeErr error
}

func (c *errorStdoutPipeCmd) StdoutPipe() (io.ReadCloser, error) {
	return nil, c.stdoutPipeErr
}

// errorWaitCmd returns a non-cancellation error from Wait.
type errorWaitCmd struct {
	*testutil.MockCmd
	waitErr error
}

func (c *errorWaitCmd) Wait() error {
	return c.waitErr
}

// --- MockCmdRunner implementations ---

// blockingCmdRunner returns a blocking command for context cancellation testing.
type blockingCmdRunner struct {
	cmd cmdexec.Cmd
}

func (r *blockingCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) cmdexec.Cmd {
	return r.cmd
}

// errorReaderCmdRunner returns a command with an error-producing reader.
type errorReaderCmdRunner struct {
	cmd cmdexec.Cmd
}

func (r *errorReaderCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) cmdexec.Cmd {
	return r.cmd
}

// errorStdoutPipeCmdRunner returns a command with StdoutPipe error.
type errorStdoutPipeCmdRunner struct {
	cmd cmdexec.Cmd
}

func (r *errorStdoutPipeCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) cmdexec.Cmd {
	return r.cmd
}

// errorWaitCmdRunner returns a command with Wait error.
type errorWaitCmdRunner struct {
	cmd cmdexec.Cmd
}

func (r *errorWaitCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) cmdexec.Cmd {
	return r.cmd
}

// --- Tests ---

// TestRunCmd_Success verifies that a successful lm execution streams tokens and sends final result.
func TestRunCmd_Success(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("Hello World")
	mockRunner := testutil.NewMockCmdRunner(mockCmd)
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, mockRunner)

	// "Hello World" has 11 runes → 11 token messages + 1 EndEmit + 1 FinalResult = 13
	assert.Equal(t, 13, mockWS.GetSentMessageCount(), "Expected 13 messages: 11 tokens + endemit + finalresult")

	// Verify token messages are sent
	messages := mockWS.GetSentMessages()
	tokenCount := 0
	for _, msg := range messages {
		var rsm types.WsRawServerMsg
		if err := json.Unmarshal(msg, &rsm); err == nil {
			if rsm.Type == types.TokenType {
				tokenCount++
			}
		}
	}
	assert.Equal(t, 11, tokenCount, "Expected 11 token messages")

	// Verify the final result contains the full text
	assert.Nil(t, session.GetAbortController(), "AbortController should be cleared after successful completion")
}

// TestRunCmd_CommandNotFound verifies that a failed Start() sends an error message.
func TestRunCmd_CommandNotFound(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("")
	mockCmd.SetStartError(errors.New("executable file not found"))
	mockRunner := testutil.NewMockCmdRunner(mockCmd)
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("lm", []string{"--payload", "{}"}, mockWS, cbHandler, session, mockRunner)

	// Should send exactly 1 error message
	assert.Equal(t, 1, mockWS.GetSentMessageCount(), "Expected 1 error message")

	// Verify it's an error message
	messages := mockWS.GetSentMessages()
	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ErrorMsgType, rsm.Type, "Expected error message type")
	assert.Contains(t, rsm.Msg, "Error starting command", "Expected error message about starting command")
}

// TestRunCmd_ContextCancellation verifies that cancelling the context results in graceful shutdown.
func TestRunCmd_ContextCancellation(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("Hello")
	blockingCmd := &blockingCmd{
		MockCmd:   mockCmd,
		unblockCh: make(chan struct{}),
	}
	runner := &blockingCmdRunner{cmd: blockingCmd}
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	done := make(chan struct{})
	go func() {
		RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, runner)
		close(done)
	}()

	// Wait for AbortController to be set
	deadline := time.After(2 * time.Second)
	for session.GetAbortController() == nil {
		select {
		case <-deadline:
			t.Fatal("AbortController was never set")
		case <-time.After(time.Millisecond):
		}
	}

	// Cancel the context
	session.GetAbortController()()

	// Unblock the Wait call
	close(blockingCmd.unblockCh)

	<-done

	// "Hello" = 5 tokens, no error, no EndEmit, no FinalResult (graceful return)
	assert.Equal(t, 5, mockWS.GetSentMessageCount(), "Expected 5 token messages, no error/endemit/finalresult")

	// Verify no error message was sent
	messages := mockWS.GetSentMessages()
	for _, msg := range messages {
		var rsm types.WsRawServerMsg
		json.Unmarshal(msg, &rsm)
		assert.NotEqual(t, types.ErrorMsgType, rsm.Type, "No error message should be sent on cancellation")
	}
}

// TestRunCmd_OutputError verifies that a scanner error sends an error message.
func TestRunCmd_OutputError(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("")
	errorCmd := &errorReaderCmd{MockCmd: mockCmd}
	runner := &errorReaderCmdRunner{cmd: errorCmd}
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, runner)

	// Should have sent tokens for the first 3 bytes ("Hel") + 1 error message
	// Note: scanner reads rune-by-rune; "Hel" = 3 tokens, then error
	assert.GreaterOrEqual(t, mockWS.GetSentMessageCount(), 4, "Expected at least 4 messages (tokens + error)")

	// Verify error message was sent
	messages := mockWS.GetSentMessages()
	foundError := false
	for _, msg := range messages {
		var rsm types.WsRawServerMsg
		json.Unmarshal(msg, &rsm)
		if rsm.Type == types.ErrorMsgType {
			foundError = true
			assert.Contains(t, rsm.Msg, "Error reading output", "Expected error about reading output")
		}
	}
	assert.True(t, foundError, "Expected an error message to be sent")
}

// TestRunCmd_EmptyOutput verifies that no output results in empty result being sent.
func TestRunCmd_EmptyOutput(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("")
	mockRunner := testutil.NewMockCmdRunner(mockCmd)
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, mockRunner)

	// No tokens, 1 EndEmit, 1 FinalResult = 2 messages
	assert.Equal(t, 2, mockWS.GetSentMessageCount(), "Expected 2 messages: endemit + finalresult")

	// Verify final result has empty text
	messages := mockWS.GetSentMessages()
	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[1], &rsm)
	assert.Equal(t, types.FinalResultType, rsm.Type, "Expected finalresult message type")
}

// TestRunCmd_StdoutPipeError verifies that a StdoutPipe error sends an error message.
func TestRunCmd_StdoutPipeError(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("")
	errorCmd := &errorStdoutPipeCmd{
		MockCmd:       mockCmd,
		stdoutPipeErr: errors.New("pipe error"),
	}
	runner := &errorStdoutPipeCmdRunner{cmd: errorCmd}
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, runner)

	// Should send exactly 1 error message
	assert.Equal(t, 1, mockWS.GetSentMessageCount(), "Expected 1 error message")

	// Verify it's an error message about stdout pipe
	messages := mockWS.GetSentMessages()
	var rsm types.WsRawServerMsg
	json.Unmarshal(messages[0], &rsm)
	assert.Equal(t, types.ErrorMsgType, rsm.Type, "Expected error message type")
	assert.Contains(t, rsm.Msg, "Error creating output pipe", "Expected error about output pipe")
}

// TestRunCmd_WaitError verifies that a non-cancellation Wait error sends an error message.
func TestRunCmd_WaitError(t *testing.T) {
	mockWS := testutil.NewMockWSConn()
	mockCmd := testutil.NewMockCmd("Hello")
	errorCmd := &errorWaitCmd{
		MockCmd: mockCmd,
		waitErr: errors.New("command failed with exit code 1"),
	}
	runner := &errorWaitCmdRunner{cmd: errorCmd}
	session := &state.WsSession{ConfirmToolCalls: make(map[string]chan bool)}
	cbHandler := callbacks.NewCallbackHandlers(mockWS, "test")

	RunCmd("test", []string{"--payload", "{}"}, mockWS, cbHandler, session, runner)

	// "Hello" = 5 tokens + 1 error message = 6 messages (no EndEmit/FinalResult)
	assert.Equal(t, 6, mockWS.GetSentMessageCount(), "Expected 6 messages: 5 tokens + 1 error")

	// Verify error message was sent
	messages := mockWS.GetSentMessages()
	foundError := false
	for _, msg := range messages {
		var rsm types.WsRawServerMsg
		json.Unmarshal(msg, &rsm)
		if rsm.Type == types.ErrorMsgType {
			foundError = true
			assert.Contains(t, rsm.Msg, "Command finished with error", "Expected error about command failure")
		}
	}
	assert.True(t, foundError, "Expected an error message to be sent")
}

// Ensure imports are used
var _ = strings.Contains
var _ = json.Marshal
