package cmdexec

import (
	"context"
	"io"
	"os/exec"
)

// realCmd wraps *exec.Cmd to satisfy the Cmd interface.
type realCmd struct {
	*exec.Cmd
}

func newRealCmd(ctx context.Context, name string, arg ...string) Cmd {
	return &realCmd{Cmd: exec.CommandContext(ctx, name, arg...)}
}

// StdoutPipe returns a pipe connected to the command's stdout.
func (c *realCmd) StdoutPipe() (io.ReadCloser, error) {
	return c.Cmd.StdoutPipe()
}
