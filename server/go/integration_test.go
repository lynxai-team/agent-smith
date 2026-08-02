package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/synw/agent-smith/server/go/conf"
	"github.com/synw/agent-smith/server/go/httpserver"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/synw/agent-smith/server/go/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/websocket"
)

// testConfigYAML is a known test configuration used across all integration tests.
const testConfigYAML = `
origins:
    - http://localhost:5173
    - http://localhost:8080
api_key: test-api-key-12345
`

// testAPIKey is the API key set in testConfigYAML.
const testAPIKey = "test-api-key-12345"

// stateMu protects concurrent access to state globals across tests.
// Integration tests are sequential (no t.Parallel), but we still need this
// to prevent a data race between the current test writing to state and a
// previous test's lingering goroutine reading from state.
var stateMu sync.Mutex

// testServer holds the resources for a running test server.
type testServer struct {
	echo   *echo.Echo
	server *httptest.Server
	port   int
}

// startTestServer boots an Echo server mirroring httpserver.RunServer on a
// httptest server, configures state.Conf, and returns the server and a
// cleanup function. NOT safe for t.Parallel() — state.Conf is global.
func startTestServer(t *testing.T) *testServer {
	t.Helper()

	stateMu.Lock()
	defer stateMu.Unlock()

	// 1. Initialise global config.
	state.SetConf(conf.InitConfFromReader([]byte(testConfigYAML)))
	state.IsVerbose.Store(false)
	state.IsDebug.Store(false)

	// 2. Build Echo app mirroring httpserver.RunServer exactly.
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	// CORS — same config as production.
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     state.GetConf().Origins,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowMethods:     []string{http.MethodGet, http.MethodOptions, http.MethodPost},
		AllowCredentials: true,
	}))

	// WebSocket route.
	e.GET("/ws", httpserver.WsHandler)

	// Health check.
	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// /api group with KeyAuth middleware (same logic as production).
	cmds := e.Group("/api")
	cmds.Use(middleware.KeyAuth(func(key string, c echo.Context) (bool, error) {
		conf := state.GetConf()
		if conf.CmdApiKey.IsValid && key == conf.CmdApiKey.Key {
			c.Set("apiKey", key)
			return true, nil
		}
		for _, apiKey := range conf.ApiKeys {
			if string(apiKey) == key {
				c.Set("apiKey", key)
				return true, nil
			}
		}
		return false, nil
	}))

	// 3. Start httptest server (handles lifecycle properly).
	ts := httptest.NewServer(e)

	return &testServer{
		echo:   e,
		server: ts,
		port:   ts.Listener.Addr().(*net.TCPAddr).Port,
	}
}

func (ts *testServer) close() {
	stateMu.Lock()
	defer stateMu.Unlock()
	ts.server.Close() // httptest.Server.Close properly shuts down and waits
}

// addStubToPATH prepends the testutil directory (containing the lm symlink)
// to PATH so that exec.CommandContext("lm", …) resolves to our stub.
func addStubToPATH(t *testing.T) string {
	t.Helper()
	testutilAbs, err := filepath.Abs("testutil")
	require.NoError(t, err)
	oldPath := os.Getenv("PATH")
	os.Setenv("PATH", testutilAbs+string(os.PathListSeparator)+oldPath)
	return oldPath
}

// sendWsJSON sends a JSON-encoded message over a *websocket.Conn.
func sendWsJSON(ws *websocket.Conn, v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return websocket.Message.Send(ws, string(data))
}

// receiveWsRaw reads one JSON message from the WebSocket as a string.
// Uses *string because golang.org/x/net/websocket Message.Receive only
// accepts *string or *[]byte (not *json.RawMessage).
func receiveWsRaw(ws *websocket.Conn) (string, error) {
	var raw string
	err := websocket.Message.Receive(ws, &raw)
	return raw, err
}

// parseServerMsg unmarshals a JSON string into WsRawServerMsg.
func parseServerMsg(raw string) (types.WsRawServerMsg, error) {
	var msg types.WsRawServerMsg
	if err := json.Unmarshal([]byte(raw), &msg); err != nil {
		return types.WsRawServerMsg{}, err
	}
	return msg, nil
}

// ---------------------------------------------------------------------------
// Test 1: Ping / Health Check
// ---------------------------------------------------------------------------

func TestIntegration_PingHealthCheck(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	url := fmt.Sprintf("%s/ping", ts.server.URL)
	resp, err := http.Get(url)
	require.NoError(t, err, "GET /ping should not error")
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode, "/ping should return 200")

	var body map[string]string
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.Equal(t, "ok", body["status"], "/ping body should contain status=ok")
}

// ---------------------------------------------------------------------------
// Test 2: WebSocket Connection
// ---------------------------------------------------------------------------

func TestIntegration_WebSocketConnection(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	wsURL := "ws" + ts.server.URL[4:] + "/ws" // http -> ws
	ws, err := websocket.Dial(wsURL, "", "http://localhost")
	require.NoError(t, err, "WebSocket dial should succeed")
	defer ws.Close()

	// Verify we can send and receive on the connection.
	err = websocket.Message.Send(ws, `{"type":"system","command":"stop"}`)
	require.NoError(t, err, "send should not error")

	var raw []byte
	err = websocket.Message.Receive(ws, &raw)
	require.NoError(t, err, "receive should not error")

	msg, err := parseServerMsg(string(raw))
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, msg.Type, "stop command returns error (not yet implemented)")
}

// ---------------------------------------------------------------------------
// Test 3: Command Message Flow (end-to-end with stub lm)
// ---------------------------------------------------------------------------

func TestIntegration_CommandMessage_Flow(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	// Make sure the stub lm is discoverable.
	addStubToPATH(t)

	wsURL := "ws" + ts.server.URL[4:] + "/ws" // http -> ws
	ws, err := websocket.Dial(wsURL, "", "http://localhost")
	require.NoError(t, err)
	defer ws.Close()

	// Send a command message.
	cmdMsg := types.WsClientMsg{
		Type:    types.CommandMsgType,
		Feature: "agent",
		Command: "test-cmd",
		Payload: map[string]interface{}{"prompt": "hello"},
	}
	require.NoError(t, sendWsJSON(ws, cmdMsg))

	// Collect messages until we see endemit or finalresult.
	deadline := time.After(5 * time.Second)
	var allMsgs []types.WsRawServerMsg
	foundTerminator := false

	for !foundTerminator {
		select {
		case <-deadline:
			t.Fatalf("Timeout waiting for command response. Received %d messages.", len(allMsgs))
		default:
		}

		raw, err := receiveWsRaw(ws)
		require.NoError(t, err, "should receive a server message")

		msg, err := parseServerMsg(raw)
		require.NoError(t, err)
		allMsgs = append(allMsgs, msg)

		if msg.Type == types.FinalResultType {
			foundTerminator = true
		}
	}

	// Verify the expected flow: tokens → endemit → finalresult.
	hasToken := false
	hasEndEmit := false
	hasFinalResult := false
	for _, m := range allMsgs {
		switch m.Type {
		case types.TokenType:
			hasToken = true
		case types.EndEmitType:
			hasEndEmit = true
		case types.FinalResultType:
			hasFinalResult = true
		}
	}

	assert.True(t, hasToken, "expected at least one token message from stub lm")
	assert.True(t, hasEndEmit, "expected endemit message after command completes")
	assert.True(t, hasFinalResult, "expected finalresult message after endemit")

	// Verify the final result text contains the stub output.
	var lastFinal types.WsRawServerMsg
	for _, m := range allMsgs {
		if m.Type == types.FinalResultType {
			lastFinal = m
		}
	}
	assert.NotEmpty(t, lastFinal.Msg, "finalresult should have non-empty msg")

	// Verify token messages contain expected stub output characters.
	var collectedTokens string
	for _, m := range allMsgs {
		if m.Type == types.TokenType {
			collectedTokens += m.Msg
		}
	}
	assert.Contains(t, collectedTokens, "Hello", "tokens should include 'Hello' from stub")
	assert.Contains(t, collectedTokens, "World", "tokens should include 'World' from stub")
}

// ---------------------------------------------------------------------------
// Test 4: System Message — ConfirmTool flow
// ---------------------------------------------------------------------------

func TestIntegration_SystemMessage_ConfirmTool(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	addStubToPATH(t)

	wsURL := "ws" + ts.server.URL[4:] + "/ws" // http -> ws
	ws, err := websocket.Dial(wsURL, "", "http://localhost")
	require.NoError(t, err)
	defer ws.Close()

	// --- 4a: confirmtool with missing payload → server error ---
	badMsg1 := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
	}
	require.NoError(t, sendWsJSON(ws, badMsg1))

	raw, err := receiveWsRaw(ws)
	require.NoError(t, err)
	msg, err := parseServerMsg(raw)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, msg.Type)
	assert.Contains(t, msg.Msg, "payload", "error should mention missing payload")

	// --- 4b: confirmtool with missing id → server error ---
	badMsg2 := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"confirm": true,
		},
	}
	require.NoError(t, sendWsJSON(ws, badMsg2))

	raw, err = receiveWsRaw(ws)
	require.NoError(t, err)
	msg, err = parseServerMsg(raw)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, msg.Type)
	assert.Contains(t, msg.Msg, "id", "error should mention missing id")

	// --- 4c: confirmtool with no pending confirmation → server error ---
	goodMsg := types.WsClientMsg{
		Type:    types.SystemMsgType,
		Command: "confirmtool",
		Payload: map[string]interface{}{
			"id":      "nonexistent-tool-id",
			"confirm": true,
		},
	}
	require.NoError(t, sendWsJSON(ws, goodMsg))

	raw, err = receiveWsRaw(ws)
	require.NoError(t, err)
	msg, err = parseServerMsg(raw)
	require.NoError(t, err)
	assert.Equal(t, types.ErrorMsgType, msg.Type)
	assert.Contains(t, msg.Msg, "No pending confirmation",
		"error should indicate no pending confirmation for the given ID")
}

// ---------------------------------------------------------------------------
// Test 5: CORS Origin Validation
// ---------------------------------------------------------------------------

func TestIntegration_CORS_OriginValidation(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	baseURL := ts.server.URL

	// --- 5a: Allowed origin should receive matching Access-Control-Allow-Origin ---
	allowedOrigin := "http://localhost:5173"
	req, err := http.NewRequest("GET", baseURL+"/ping", nil)
	require.NoError(t, err)
	req.Header.Set("Origin", allowedOrigin)

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	respACAO := resp.Header.Get("Access-Control-Allow-Origin")
	resp.Body.Close()

	assert.Equal(t, allowedOrigin, respACAO,
		"allowed origin should be reflected in Access-Control-Allow-Origin")

	// --- 5b: Second allowed origin ---
	allowedOrigin2 := "http://localhost:8080"
	req2, err := http.NewRequest("GET", baseURL+"/ping", nil)
	require.NoError(t, err)
	req2.Header.Set("Origin", allowedOrigin2)

	resp2, err := http.DefaultClient.Do(req2)
	require.NoError(t, err)
	respACAO2 := resp2.Header.Get("Access-Control-Allow-Origin")
	resp2.Body.Close()

	assert.Equal(t, allowedOrigin2, respACAO2,
		"second allowed origin should also be reflected")

	// --- 5c: Disallowed origin should NOT receive that origin in the header ---
	badOrigin := "http://evil.example.com"
	req3, err := http.NewRequest("GET", baseURL+"/ping", nil)
	require.NoError(t, err)
	req3.Header.Set("Origin", badOrigin)

	resp3, err := http.DefaultClient.Do(req3)
	require.NoError(t, err)
	respACAO3 := resp3.Header.Get("Access-Control-Allow-Origin")
	resp3.Body.Close()

	assert.NotEqual(t, badOrigin, respACAO3,
		"disallowed origin should not be reflected in CORS header")
}

// ---------------------------------------------------------------------------
// Test 6: API Key Authentication on /api/* routes
// ---------------------------------------------------------------------------

func TestIntegration_APIKeyAuth(t *testing.T) {
	ts := startTestServer(t)
	defer ts.close()

	baseURL := ts.server.URL

	// --- 6a: No Authorization header → 400 Bad Request (missing key) ---
	req, err := http.NewRequest("GET", baseURL+"/api/test-endpoint", nil)
	require.NoError(t, err)

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode,
		"request without API key header should be rejected (400 missing key)")

	// --- 6b: Valid API key → KeyAuth passes (Echo returns 404 because no route) ---
	req2, err := http.NewRequest("GET", baseURL+"/api/test-endpoint", nil)
	require.NoError(t, err)
	req2.Header.Set("Authorization", "Bearer "+testAPIKey)

	resp2, err := http.DefaultClient.Do(req2)
	require.NoError(t, err)
	resp2.Body.Close()
	// KeyAuth middleware passes the request through; Echo returns 404 since no route matches.
	assert.Equal(t, http.StatusNotFound, resp2.StatusCode,
		"valid API key should pass KeyAuth; 404 is from missing route")

	// --- 6c: Invalid API key → 401 Unauthorized ---
	req3, err := http.NewRequest("GET", baseURL+"/api/test-endpoint", nil)
	require.NoError(t, err)
	req3.Header.Set("Authorization", "Bearer wrong-secret-key")

	resp3, err := http.DefaultClient.Do(req3)
	require.NoError(t, err)
	resp3.Body.Close()
	assert.Equal(t, http.StatusUnauthorized, resp3.StatusCode,
		"invalid API key should be rejected with 401")

	// --- 6d: OPTIONS preflight with valid origin → 204 No Content (CORS handles it) ---
	req4, err := http.NewRequest("OPTIONS", baseURL+"/api/test-endpoint", nil)
	require.NoError(t, err)
	req4.Header.Set("Origin", "http://localhost:5173")

	resp4, err := http.DefaultClient.Do(req4)
	require.NoError(t, err)
	resp4.Body.Close()
	// Echo CORS middleware handles OPTIONS with allowed origins before KeyAuth.
	assert.Equal(t, http.StatusNoContent, resp4.StatusCode,
		"OPTIONS preflight with allowed origin should return 204")
}
