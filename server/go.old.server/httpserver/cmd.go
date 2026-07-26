package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"sync"

	"github.com/labstack/echo/v4"
	"github.com/synw/agent-smith/server/lm"
	"github.com/synw/agent-smith/server/state"
	"github.com/synw/agent-smith/server/types"
)

func ExecuteCmdHandler(c echo.Context) error {
	m := echo.Map{}
	if err := c.Bind(&m); err != nil {
		return err
	}
	cmd, ok := m["cmd"].(string)
	if !ok {
		msg := "Provide a 'cmd' string parameter"
		return echo.NewHTTPError(http.StatusBadRequest, msg)
	}
	// Check if the command exists in any of the configured groups
	cmdExists := false
	apiKey := c.Get("apiKey").(string)

	// Check if it's the main command API key
	if apiKey == state.Conf.CmdApiKey.Key {
		cmdExists = true // Allow all commands for main API key
	} else {
		// Check if command exists in user's authorized groups
		authorizedCmds := state.Conf.Groups[types.GroupApiKey(apiKey)]
		if slices.Contains(authorizedCmds, cmd) {
			cmdExists = true
		}
	}

	if !cmdExists {
		return echo.NewHTTPError(http.StatusUnauthorized, "Command not found or not authorized")
	}

	apiKey = c.Get("apiKey").(string)
	authorizedCmds := state.Conf.Groups[types.GroupApiKey(apiKey)]
	isCmdAuthorized := false
	isCmdUnauthorized := false
	unauthorizedCmds := []string{"conf", "reset", "update"}
	if slices.Contains(unauthorizedCmds, cmd) {
		isCmdUnauthorized = true
	}
	if !isCmdUnauthorized {
		if apiKey == state.Conf.CmdApiKey.Key {
			isCmdAuthorized = true
		} else {
			if slices.Contains(authorizedCmds, cmd) {
				isCmdAuthorized = true
			}
		}
	}
	if !isCmdAuthorized {
		return c.NoContent(http.StatusUnauthorized)
	}
	params, ok := m["params"]
	if !ok {
		params = []string{}
	}
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c.Response().WriteHeader(http.StatusOK)
	ch := make(chan types.StreamedMessage)
	errCh := make(chan types.StreamedMessage)

	var wg sync.WaitGroup
	wg.Add(1)

	// Ensure cleanup happens regardless of execution path
	defer func() {
		close(ch)
		close(errCh)
		wg.Wait()
	}()

	go func() {
		defer wg.Done()
		rawParams := params.([]interface{})
		params := lm.InterfaceToStringArray(rawParams)
		lm.RunCmd(cmd, params, c, ch, errCh, c.Request().Context())
	}()

	select {
	case res, ok := <-ch:
		if ok {
			if state.IsDebug {
				fmt.Println("-------- result ----------")
				for key, value := range res.Data {
					fmt.Printf("%s: %v\n", key, value)
				}
				fmt.Println("--------------------------")
			}
		}
		return nil
	case err, ok := <-errCh:
		if ok {
			enc := json.NewEncoder(c.Response())
			err := lm.StreamMsg(err, c, enc)
			if err != nil {
				if state.IsDebug {
					fmt.Println("Streaming error", err)
				}
				return c.NoContent(http.StatusInternalServerError)
			}
		} else {
			return c.JSON(http.StatusInternalServerError, err)
		}
		return nil
	case <-c.Request().Context().Done():
		fmt.Println("\nRequest canceled")
		return c.NoContent(http.StatusNoContent)
	}
}
