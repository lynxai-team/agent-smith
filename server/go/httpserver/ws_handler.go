package httpserver

import (
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"slices"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/synw/agent-smith/server/go/callbacks"
	"github.com/synw/agent-smith/server/go/cmdexec"
	"github.com/synw/agent-smith/server/go/lm"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/synw/agent-smith/server/go/websock"
	"golang.org/x/net/websocket"
)

// maskApiKey masks an API key for safe logging.
// Returns "****" for keys <= 8 chars, otherwise shows first 4 and last 4 characters with "****" in between.
func maskApiKey(key string) string {
	if len(key) <= 8 {
		return "****"
	}
	return key[:4] + "****" + key[len(key)-4:]
}

// validateApiKey checks if the provided key matches the main API key or any group API key.
func validateApiKey(key string) bool {
	conf := state.GetConf()
	if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(key), []byte(conf.CmdApiKey.Key)) == 1 {
		return true
	}
	for _, apiKey := range conf.ApiKeys {
		if subtle.ConstantTimeCompare([]byte(string(apiKey)), []byte(key)) == 1 {
			return true
		}
	}
	return false
}

// WsHandler handles WebSocket connections.
func WsHandler(c echo.Context) error {
	// Check concurrent connection limit (max 100)
	if state.ActiveWsConnections.Load() >= 100 {
		return c.JSON(http.StatusTooManyRequests, map[string]string{"error": "too many concurrent connections"})
	}
	state.ActiveWsConnections.Add(1)
	defer state.ActiveWsConnections.Add(-1)

	websocket.Handler(func(ws *websocket.Conn) {
		// Wrap the real WebSocket connection with our interface
		wsConn := websock.NewRealWSConn(ws)

		// Authentication handshake: require auth message within 5 seconds
		ws.SetReadDeadline(time.Now().Add(5 * time.Second))

		var authRaw []byte
		err := wsConn.Receive(&authRaw)
		if err != nil {
			if state.IsVerbose.Load() {
				fmt.Printf("WebSocket auth timeout or error: %v\n", err)
			}
			ws.Close()
			return
		}

		var authMsg types.WsAuthMsg
		if err := json.Unmarshal(authRaw, &authMsg); err != nil {
			if state.IsVerbose.Load() {
				fmt.Printf("Failed to parse auth message: %v\n", err)
			}
			sendWsError(wsConn, "Failed to parse authentication message")
			ws.Close()
			return
		}

		// Validate auth message
		if authMsg.Type != types.AuthMsgType || !validateApiKey(authMsg.Key) {
			sendWsError(wsConn, "Authentication failed: invalid or missing auth message")
			ws.Close()
			return
		}

		// Auth successful — clear read deadline
		ws.SetReadDeadline(time.Time{})

		apiKey := authMsg.Key

		if state.IsVerbose.Load() {
			fmt.Printf("WebSocket authenticated with key: %s\n", maskApiKey(apiKey))
		}

		// Per-session state
		session := &state.WsSession{
			ConfirmToolCalls: make(map[string]chan bool),
			ApiKey:           apiKey,
		}

		if state.IsVerbose.Load() {
			fmt.Printf("WebSocket connection established\n")
		}

		// Per-connection message rate limiting (50 msg/s)
		var msgCount int
		var msgWindow time.Time

		// Message receive loop
		for {
			var rawMsg []byte
			err := wsConn.Receive(&rawMsg)
			if err != nil {
				if state.IsVerbose.Load() {
					fmt.Printf("WebSocket disconnect: %v\n", err)
					fmt.Println("Msg:", &rawMsg)
				}
				break
			}

			var msg types.WsClientMsg
			if err := json.Unmarshal(rawMsg, &msg); err != nil {
				if state.IsVerbose.Load() {
					fmt.Printf("Failed to parse message: %v\n", err)
				}
				sendWsError(wsConn, "Failed to parse message")
				continue
			}

			// Per-connection message rate limiting (50 msg/s)
			now := time.Now()
			if now.Sub(msgWindow).Seconds() >= 1.0 {
				msgCount = 0
				msgWindow = now
			}
			msgCount++
			if msgCount > 50 {
				sendWsError(wsConn, "Rate limit exceeded: too many messages per second")
				ws.Close()
				return
			}

			//fmt.Println("WS MSG", msg)

			switch msg.Type {
			case types.SystemMsgType:
				handleSystemMessage(wsConn, session, msg)
			case types.CommandMsgType:
				handleCommandMessage(wsConn, session, msg)
			default:
				if state.IsVerbose.Load() {
					fmt.Printf("Unknown message type: %s\n", msg.Type)
				}
				sendWsError(wsConn, "Unknown message type")
			}
		}

		if state.IsVerbose.Load() {
			fmt.Printf("WebSocket connection closed\n")
		}
	}).ServeHTTP(c.Response(), c.Request())

	return nil
}

// handleSystemMessage processes system-level commands.
func handleSystemMessage(ws websock.WSConn, session *state.WsSession, msg types.WsClientMsg) {
	switch msg.Command {
	case "stop":
		if state.IsVerbose.Load() {
			fmt.Printf("Stop command received\n")
		}
		// TODO: Implement abort logic via context cancellation
		sendWsError(ws, "Stop command received (abort not yet implemented)")

	case "confirmtool":
		// Extract payload.id and payload.confirm
		payload := msg.Payload
		if payload == nil {
			sendWsError(ws, "confirmtool requires payload with 'id' and 'confirm' fields")
			return
		}
		id, ok := payload["id"].(string)
		if !ok || id == "" {
			sendWsError(ws, "confirmtool requires a valid 'id' in payload")
			return
		}
		confirmVal, ok := payload["confirm"].(bool)
		if !ok {
			sendWsError(ws, "confirmtool requires a 'confirm' boolean in payload")
			return
		}

		// Resolve the awaiter for this tool call ID
		if ch, exists := session.GetConfirmChannel(id); exists {
			ch <- confirmVal
			session.DeleteConfirmChannel(id)
			if state.IsVerbose.Load() {
				fmt.Printf("Tool confirmation resolved: %s = %v\n", id, confirmVal)
			}
		} else {
			if state.IsVerbose.Load() {
				fmt.Printf("No pending confirmation for tool call ID: %s\n", id)
			}
			sendWsError(ws, "No pending confirmation found")
		}

	default:
		if state.IsVerbose.Load() {
			fmt.Printf("Unknown system command: %s\n", msg.Command)
		}
		sendWsError(ws, "Unknown system command")
	}
}

// handleCommandMessage routes command messages to appropriate executors.
func handleCommandMessage(ws websock.WSConn, session *state.WsSession, msg types.WsClientMsg) {
	if msg.Payload == nil {
		sendWsError(ws, "Command message requires a payload")
		return
	}

	// Initialize options if nil
	if msg.Options == nil {
		msg.Options = make(map[string]interface{})
	}

	switch msg.Feature {
	case "agent":
		executeAgent(ws, session, msg, session.ApiKey)
	case "workflow":
		sendWsError(ws, "Workflow execution not yet implemented")
	default:
		if state.IsVerbose.Load() {
			fmt.Printf("Unsupported feature type: %s\n", msg.Feature)
		}
		sendWsError(ws, "Unsupported feature type")
	}
}

// executeAgent runs an agent via the lm binary with callback handlers.
func executeAgent(ws websock.WSConn, session *state.WsSession, msg types.WsClientMsg, apiKey string) {
	//fmt.Println("MSG:", msg)
	cmdName := msg.Command
	payload := msg.Payload
	//fmt.Println("Payload:", payload)

	// Validate prompt is present and is a string (CWE-476: prevent type assertion panics)
	promptVal, ok := payload["prompt"].(string)
	if !ok || promptVal == "" {
		sendWsError(ws, "Invalid or missing 'prompt' in payload")
		return
	}

	// Create callback handlers
	cbHandler := callbacks.NewCallbackHandlers(ws, cmdName)

	// Build options map
	options := cbHandler.BuildOptions()
	//fmt.Println("Opts:", options)

	// Merge client-provided options (non-callback fields)
	for k, v := range msg.Options {
		// Skip callback function keys — they're already in options
		if _, exists := options[k]; !exists || k == "nocli" {
			options[k] = v
		}
	}

	// Validate API key authorization
	if !isCommandAuthorized(apiKey, cmdName) {
		if state.IsVerbose.Load() {
			fmt.Printf("Command '%s' is not authorized for key\n", cmdName)
		}
		sendWsError(ws, "Command not authorized")
		return
	}

	// Serialize payload and options to JSON
	/*payloadJSON, err := json.Marshal(payload)
	if err != nil {
		sendWsError(ws, fmt.Sprintf("Failed to marshal payload: %v", err))
		return
	}*/

	// Create serializable options (exclude callback functions which can't be JSON-encoded)
	serializableOptions := make(map[string]interface{})
	for k, v := range options {
		// Skip function values (callbacks) — they're used internally in Go
		if reflect.TypeOf(v).Kind() == reflect.Func {
			continue
		}
		serializableOptions[k] = v
	}
	/*optsJSON, err := json.Marshal(serializableOptions)
	if err != nil {
		sendWsError(ws, fmt.Sprintf("Failed to marshal options: %v", err))
		return
	}*/

	// Use default command runner for production
	cmdRunner := cmdexec.NewRealCmdRunner()

	// Call lm.RunCmd with params
	cmdOpts := []string{promptVal, "-v", "--nocli"}
	for k, v := range serializableOptions {
		switch val := v.(type) {
		case string:
			cmdOpts = append(cmdOpts, "--"+k)
			cmdOpts = append(cmdOpts, val)
		case bool:
			if val == true {
				cmdOpts = append(cmdOpts, "--"+k)
			}
		default:
			fmt.Printf("OPT Not a string or bool, it's: %T\n", val)
		}
	}
	fmt.Println("Run cmd:", cmdName, []string{promptVal}, cmdOpts)
	lm.RunCmd(cmdName, cmdOpts, ws, cbHandler, session, cmdRunner)
}

// isCommandAuthorized checks if an API key is authorized to run a command.
func isCommandAuthorized(apiKey, cmd string) bool {
	conf := state.GetConf()

	// Main key allows all commands
	if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(apiKey), []byte(conf.CmdApiKey.Key)) == 1 {
		return true
	}

	// If no main key, check group authorization
	if apiKey != "" {
		authorizedCmds := conf.Groups[types.GroupApiKey(apiKey)]
		return slices.Contains(authorizedCmds, cmd)
	}

	// No API key provided — reject in all cases. No dev bypass allowed.
	return false
}

// sendWsError sends an error message over WebSocket.
func sendWsError(ws websock.WSConn, errMsg string) {
	msg := types.WsRawServerMsg{
		Type: types.ErrorMsgType,
		From: "server",
		Msg:  errMsg,
	}
	data, err := json.Marshal(msg)
	if err != nil {
		if state.IsDebug.Load() {
			fmt.Printf("Failed to marshal error message: %v\n", err)
		}
		return
	}
	if err := ws.Send(data); err != nil {
		if state.IsDebug.Load() {
			fmt.Printf("Failed to send error message: %v\n", err)
		}
	}
}
