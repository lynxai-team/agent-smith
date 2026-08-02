package cmdexec

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewRealCmdRunner(t *testing.T) {
	runner := NewRealCmdRunner()
	assert.NotNil(t, runner, "NewRealCmdRunner should return a non-nil *RealCmdRunner")
}

func TestRealCmdRunner_CommandContext(t *testing.T) {
	runner := NewRealCmdRunner()
	ctx := context.Background()

	cmd := runner.CommandContext(ctx, "echo", "hello")
	assert.NotNil(t, cmd, "CommandContext should return a non-nil Cmd")
}

func TestRealCmd_Start(t *testing.T) {
	runner := NewRealCmdRunner()
	ctx := context.Background()

	cmd := runner.CommandContext(ctx, "echo", "hello")
	assert.NotNil(t, cmd)

	err := cmd.Start()
	assert.NoError(t, err, "Start should not return an error for a valid command")

	// Clean up: wait for the process to finish
	defer func() {
		_ = cmd.Wait()
	}()
}

func TestRealCmd_Wait(t *testing.T) {
	runner := NewRealCmdRunner()
	ctx := context.Background()

	cmd := runner.CommandContext(ctx, "echo", "hello")
	assert.NotNil(t, cmd)

	err := cmd.Start()
	assert.NoError(t, err)

	// Wait for the command to complete
	err = cmd.Wait()
	assert.NoError(t, err, "Wait should not return an error after a successful echo command")
}

func TestRealCmd_StdoutPipe(t *testing.T) {
	runner := NewRealCmdRunner()
	ctx := context.Background()

	cmd := runner.CommandContext(ctx, "echo", "hello")
	assert.NotNil(t, cmd)

	// Get the stdout pipe before starting
	stdout, err := cmd.StdoutPipe()
	assert.NoError(t, err, "StdoutPipe should not return an error")

	err = cmd.Start()
	assert.NoError(t, err)

	// Read from the pipe
	var buf bytes.Buffer
	_, err = io.Copy(&buf, stdout)
	assert.NoError(t, err, "io.Copy should not return an error")

	// Wait for the command to complete
	err = cmd.Wait()
	assert.NoError(t, err)

	// Verify the output contains "hello"
	output := buf.String()
	assert.Contains(t, output, "hello", "stdout should contain 'hello'")
}
