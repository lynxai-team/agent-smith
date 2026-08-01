package cmdexec

import (
	"context"
	"io"
)

// Cmd represents an external command that can be started and waited on.
// This mirrors the key methods of *os/exec.Cmd for testability.
type Cmd interface {
	// Start starts the process.
	Start() error
	// Wait waits for the command to complete.
	Wait() error
	// StdoutPipe returns a pipe that will be connected to the command's stdout.
	StdoutPipe() (io.ReadCloser, error)
}

// CmdRunner creates and configures commands for execution.
type CmdRunner interface {
	// CommandContext creates a new Cmd for the given binary and arguments.
	CommandContext(ctx context.Context, name string, arg ...string) Cmd
}

// RealCmdRunner is the production implementation using os/exec.
type RealCmdRunner struct{}

// NewRealCmdRunner creates a new RealCmdRunner.
func NewRealCmdRunner() *RealCmdRunner {
	return &RealCmdRunner{}
}

// CommandContext delegates to os/exec.CommandContext.
func (r *RealCmdRunner) CommandContext(ctx context.Context, name string, arg ...string) Cmd {
	// Import os/exec at call site to avoid circular dependencies
	return newRealCmd(ctx, name, arg...)
}
