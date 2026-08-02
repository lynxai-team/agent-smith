package websock

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"golang.org/x/net/websocket"
)

// setupEchoServer creates an httptest server that echoes WebSocket messages back.
func setupEchoServer(t *testing.T) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		websocket.Handler(func(ws *websocket.Conn) {
			defer ws.Close()
			var msg string
			if err := websocket.Message.Receive(ws, &msg); err != nil {
				return
			}
			_ = websocket.Message.Send(ws, msg)
		}).ServeHTTP(w, r)
	}))
	return server
}

func TestNewRealWSConn(t *testing.T) {
	server := setupEchoServer(t)
	defer server.Close()

	// Dial the WebSocket server to get a real *websocket.Conn
	wsURL := "ws" + server.URL[len("http"):] // http -> ws
	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	assert.NoError(t, err, "should successfully dial the WebSocket server")
	defer conn.Close()

	// Wrap it with NewRealWSConn
	realConn := NewRealWSConn(conn)
	assert.NotNil(t, realConn, "NewRealWSConn should return a non-nil *RealWSConn")
	assert.NotNil(t, realConn.conn, "RealWSConn should wrap the underlying *websocket.Conn")
}

func TestRealWSConn_Send_Success(t *testing.T) {
	server := setupEchoServer(t)
	defer server.Close()

	wsURL := "ws" + server.URL[len("http"):]
	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	assert.NoError(t, err)
	defer conn.Close()

	realConn := NewRealWSConn(conn)

	// Send data
	err = realConn.Send([]byte("hello"))
	assert.NoError(t, err, "Send should not return an error on a healthy connection")
}

func TestRealWSConn_Receive_Success(t *testing.T) {
	server := setupEchoServer(t)
	defer server.Close()

	wsURL := "ws" + server.URL[len("http"):]
	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	assert.NoError(t, err)
	defer conn.Close()

	realConn := NewRealWSConn(conn)

	// Send a message from client side first so the server echoes it back
	err = realConn.Send([]byte("ping"))
	assert.NoError(t, err)

	// Receive the echoed response
	var response string
	err = realConn.Receive(&response)
	assert.NoError(t, err, "Receive should not return an error when data is available")
	assert.Equal(t, "ping", response, "received message should match what was sent")
}

func TestRealWSConn_Send_Error(t *testing.T) {
	// Create a RealWSConn with a closed connection to verify error propagation
	server := setupEchoServer(t)
	defer server.Close()

	wsURL := "ws" + server.URL[len("http"):]
	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	assert.NoError(t, err)

	realConn := NewRealWSConn(conn)

	// Close the connection to simulate a broken state
	conn.Close()

	// Give a moment for close to propagate
	time.Sleep(50 * time.Millisecond)

	err = realConn.Send([]byte("should fail"))
	assert.Error(t, err, "Send should return an error on a closed connection")
}

func TestRealWSConn_Receive_Error(t *testing.T) {
	// Create a RealWSConn with a closed connection to verify error propagation
	server := setupEchoServer(t)
	defer server.Close()

	wsURL := "ws" + server.URL[len("http"):]
	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	assert.NoError(t, err)

	realConn := NewRealWSConn(conn)

	// Close the connection to simulate a broken state
	conn.Close()

	// Give a moment for close to propagate
	time.Sleep(50 * time.Millisecond)

	var response string
	err = realConn.Receive(&response)
	assert.Error(t, err, "Receive should return an error on a closed connection")
}
