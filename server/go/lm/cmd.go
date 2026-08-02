package lm

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/synw/agent-smith/server/go/callbacks"
	"github.com/synw/agent-smith/server/go/cmdexec"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/synw/agent-smith/server/go/websock"
)

// RunCmd executes the external lm binary and streams results via WebSocket callbacks.
func RunCmd(cmdName string, params []string, ws websock.WSConn, cbHandler *callbacks.CallbackHandlers, session *state.WsSession, runner cmdexec.CmdRunner) {
	// Create the command with the arguments
	fullParams := append([]string{cmdName}, params...)
	if state.IsDebug.Load() {
		fmt.Println("Cmd params:")
		for _, p := range fullParams {
			fmt.Println("-", p)
		}
	}

	// Create a context that can be cancelled
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Store session's AbortController (atomic)
	session.SetAbortController(cancel)

	cmd := runner.CommandContext(ctx, "lm", fullParams...)

	// Create a pipe to capture the command's output
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		sendWsError(ws, fmt.Sprintf("Error creating stdout pipe: %v", err))
		return
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		sendWsError(ws, fmt.Sprintf("Error starting command: %v", err))
		return
	}

	// Scan output rune-by-rune for token streaming
	decoder := bufio.NewReader(stdout)
	scanner := bufio.NewScanner(decoder)
	scanner.Split(bufio.ScanRunes)

	var buf []string
	i := 0
	for scanner.Scan() {
		i++
		token := scanner.Text()
		buf = append(buf, token)

		if state.IsVerbose.Load() {
			fmt.Print(token)
		}

		// Send token via callback handler
		cbHandler.SendToken(token)
	}

	// Check for errors during scanning
	if err := scanner.Err(); err != nil {
		msg := fmt.Sprintf("Error reading output: %v", err)
		fmt.Println(msg)
		sendWsError(ws, msg)
	}

	// Wait for the command to finish
	if err := cmd.Wait(); err != nil {
		if ctx.Err() == context.Canceled {
			if state.IsVerbose.Load() {
				fmt.Println("Command canceled by context")
			}
			return
		}
		sendWsError(ws, fmt.Sprintf("Command finished with error: %v", err))
		return
	}

	// Command finished successfully — send final result
	result := types.InferenceResult{
		Text: strings.Join(buf, ""),
	}

	// Send endemit
	cbHandler.SendEndEmit(result)

	// Send finalresult
	cbHandler.SendFinalResult(result)

	// Clear abort controller
	session.ClearAbortController()
}

// sendWsError sends an error message directly over WebSocket.
func sendWsError(ws websock.WSConn, errMsg string) {
	rawMsg := types.WsRawServerMsg{
		Type: types.ErrorMsgType,
		From: "server",
		Msg:  errMsg,
	}
	data, _ := json.Marshal(rawMsg)
	ws.Send(data)
}
