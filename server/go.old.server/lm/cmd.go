package lm

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/synw/agent-smith/server/state"
	"github.com/synw/agent-smith/server/types"
)

func RunCmd(
	cmdName string,
	params []string,
	c echo.Context,
	ch chan<- types.StreamedMessage,
	errCh chan<- types.StreamedMessage,
	ctx context.Context,
) {
	// Create the command with the arguments
	params = append([]string{cmdName}, params...)
	if state.IsDebug {
		fmt.Println("Cmd params:")
		for _, p := range params {
			fmt.Println("-", p)
		}
	}
	cmd := exec.CommandContext(ctx, "lm", params...)
	//cmd.Env = append(os.Environ(), "LANG=en_US.UTF-8")

	// Create a pipe to capture the command's output
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		msg := fmt.Errorf("Error creating stdout pipe: %v", err)
		errCh <- createErrorMsg(msg.Error())
		return
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		msg := fmt.Errorf("Error starting command: %v", err)
		errCh <- createErrorMsg(msg.Error())
		return
	}

	decoder := bufio.NewReader(stdout)
	scanner := bufio.NewScanner(decoder)
	scanner.Split(bufio.ScanRunes)

	enc := json.NewEncoder(c.Response())
	enc.SetEscapeHTML(false)
	i := 0
	buf := []string{}
	for scanner.Scan() {
		i++
		token := scanner.Text()
		buf = append(buf, token)
		if state.IsVerbose {
			fmt.Print(token)
		}
		StreamMsg(createMsg(token, i), c, enc)
	}

	// Check for errors during scanning
	if err := scanner.Err(); err != nil {
		msg := fmt.Errorf("Error reading output: %v", err)
		fmt.Println(msg)
		errCh <- createErrorMsg(msg.Error())
	}

	// Wait for the command to finish
	if err := cmd.Wait(); err != nil {
		if ctx.Err() == context.Canceled {
			fmt.Println("Command canceled by context")
			return
		}
		msg := fmt.Errorf("Command finished with error: %v", err)
		errCh <- createErrorMsg(msg.Error())
	} else {
		//fmt.Println("Command finished")
		res := make(map[string]interface{})
		res["text"] = strings.Join(buf, "")
		endmsg := types.StreamedMessage{
			Num:     0,
			Content: "result",
			MsgType: types.SystemMsgType,
			Data:    res,
		}
		StreamMsg(endmsg, c, enc)
		ch <- endmsg
	}
}
