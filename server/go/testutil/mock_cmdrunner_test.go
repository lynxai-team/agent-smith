package testutil

import (
	"context"
	"errors"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestNewMockCmd verifies constructor sets stdout data.
func TestNewMockCmd(t *testing.T) {
	cmd := NewMockCmd("hello world")
	assert.NotNil(t, cmd)

	reader, err := cmd.StdoutPipe()
	assert.NoError(t, err)
	defer reader.Close()

	data, err := io.ReadAll(reader)
	assert.NoError(t, err)
	assert.Equal(t, "hello world", string(data))
}

// TestMockCmd_Start_Success verifies Start() sets started=true and returns nil.
func TestMockCmd_Start_Success(t *testing.T) {
	cmd := NewMockCmd("output")
	err := cmd.Start()
	assert.NoError(t, err)
	assert.True(t, cmd.WasStarted())
}

// TestMockCmd_Start_Error verifies Start() returns configured startErr.
func TestMockCmd_Start_Error(t *testing.T) {
	cmd := NewMockCmd("output")
	expectedErr := errors.New("start failed")
	cmd.SetStartError(expectedErr)

	err := cmd.Start()
	assert.ErrorIs(t, err, expectedErr)
	// started should still be set to true even when there's an error.
	assert.True(t, cmd.WasStarted())
}

// TestMockCmd_Wait_Success verifies Wait() returns nil when no error configured.
func TestMockCmd_Wait_Success(t *testing.T) {
	cmd := NewMockCmd("output")
	err := cmd.Wait()
	assert.NoError(t, err)
}

// TestMockCmd_Wait_Error verifies Wait() returns configured waitErr.
func TestMockCmd_Wait_Error(t *testing.T) {
	cmd := NewMockCmd("output")
	expectedErr := errors.New("wait failed")
	cmd.SetWaitError(expectedErr)

	err := cmd.Wait()
	assert.ErrorIs(t, err, expectedErr)
}

// TestMockCmd_StdoutPipe verifies StdoutPipe() returns a reader with stdout data.
func TestMockCmd_StdoutPipe(t *testing.T) {
	cmd := NewMockCmd("test output data")
	reader, err := cmd.StdoutPipe()
	assert.NoError(t, err)
	assert.NotNil(t, reader)

	data, err := io.ReadAll(reader)
	assert.NoError(t, err)
	assert.Equal(t, "test output data", string(data))
}

// TestMockCmd_StdoutPipe_Error verifies StdoutPipe() returns configured error.
func TestMockCmd_StdoutPipe_Error(t *testing.T) {
	cmd := NewMockCmd("output")
	expectedErr := errors.New("pipe error")
	cmd.stdoutPipeErr = expectedErr

	reader, err := cmd.StdoutPipe()
	assert.ErrorIs(t, err, expectedErr)
	assert.Nil(t, reader)
}

// TestMockCmd_WasStarted verifies returns correct started state.
func TestMockCmd_WasStarted(t *testing.T) {
	cmd := NewMockCmd("output")
	assert.False(t, cmd.WasStarted())

	cmd.Start()
	assert.True(t, cmd.WasStarted())
}

// TestNewMockCmdRunner verifies constructor holds reference to MockCmd.
func TestNewMockCmdRunner(t *testing.T) {
	mockCmd := NewMockCmd("runner-output")
	runner := NewMockCmdRunner(mockCmd)
	assert.NotNil(t, runner)

	ctx := context.Background()
	cmd := runner.CommandContext(ctx, "test-cmd", "--flag")
	assert.Equal(t, mockCmd, cmd)
}

// TestMockCmdRunner_CommandContext verifies returns configured mock command.
func TestMockCmdRunner_CommandContext(t *testing.T) {
	mockCmd := NewMockCmd("command-output")
	runner := NewMockCmdRunner(mockCmd)

	ctx := context.Background()

	// Multiple calls should return the same MockCmd.
	cmd1 := runner.CommandContext(ctx, "echo", "hello")
	cmd2 := runner.CommandContext(ctx, "ls", "-la")

	assert.Equal(t, mockCmd, cmd1)
	assert.Equal(t, mockCmd, cmd2)

	// The returned command should work correctly.
	reader, err := cmd1.StdoutPipe()
	assert.NoError(t, err)

	data, err := io.ReadAll(reader)
	assert.NoError(t, err)
	assert.Equal(t, "command-output", string(data))
}

// TestNewMockCmdRunnerWithOutput verifies convenience constructor.
func TestNewMockCmdRunnerWithOutput(t *testing.T) {
	runner := NewMockCmdRunnerWithOutput("convenience output")
	assert.NotNil(t, runner)

	ctx := context.Background()
	cmd := runner.CommandContext(ctx, "any-cmd")
	assert.NotNil(t, cmd)

	reader, err := cmd.StdoutPipe()
	assert.NoError(t, err)

	data, err := io.ReadAll(reader)
	assert.NoError(t, err)
	assert.Equal(t, "convenience output", string(data))
}
