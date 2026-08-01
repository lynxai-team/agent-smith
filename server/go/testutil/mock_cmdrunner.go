package testutil

import (
	"bytes"
	"context"
	"io"

	"github.com/synw/agent-smith/server/go/cmdexec"
)

// MockCmd is a mock implementation of cmdexec.Cmd for testing.
type MockCmd struct {
	stdoutData    string        // data to return on stdout
	startErr      error         // error to return from Start()
	waitErr       error         // error to return from Wait()
	stdoutPipeErr error         // error to return from StdoutPipe()
	started       bool          // whether Start() was called
}

// NewMockCmd creates a new MockCmd with the given stdout data.
func NewMockCmd(stdoutData string) *MockCmd {
	return &MockCmd{
		stdoutData: stdoutData,
	}
}

// Start simulates starting the command.
func (c *MockCmd) Start() error {
	c.started = true
	return c.startErr
}

// Wait simulates waiting for the command to complete.
func (c *MockCmd) Wait() error {
	return c.waitErr
}

// StdoutPipe returns a reader that produces the stdout data.
func (c *MockCmd) StdoutPipe() (io.ReadCloser, error) {
	if c.stdoutPipeErr != nil {
		return nil, c.stdoutPipeErr
	}
	return io.NopCloser(bytes.NewReader([]byte(c.stdoutData))), nil
}

// WasStarted returns whether Start() was called.
func (c *MockCmd) WasStarted() bool {
	return c.started
}

// SetStartError sets the error to return from Start().
func (c *MockCmd) SetStartError(err error) {
	c.startErr = err
}

// SetWaitError sets the error to return from Wait().
func (c *MockCmd) SetWaitError(err error) {
	c.waitErr = err
}

// MockCmdRunner is a mock implementation of cmdexec.CmdRunner for testing.
type MockCmdRunner struct {
	cmd *MockCmd // the command to return from CommandContext
}

// NewMockCmdRunner creates a new MockCmdRunner with the given mock command.
func NewMockCmdRunner(cmd *MockCmd) *MockCmdRunner {
	return &MockCmdRunner{cmd: cmd}
}

// NewMockCmdRunnerWithOutput creates a MockCmdRunner with a command that produces the given output.
func NewMockCmdRunnerWithOutput(stdoutData string) *MockCmdRunner {
	return &MockCmdRunner{cmd: NewMockCmd(stdoutData)}
}

// CommandContext returns the mock command.
func (r *MockCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) cmdexec.Cmd {
	return r.cmd
}
