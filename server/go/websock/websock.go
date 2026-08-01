package websock

import (
	"golang.org/x/net/websocket"
)

// WSConn abstracts a WebSocket connection for testability.
// This interface allows mocking WebSocket connections in tests
// without depending on golang.org/x/net/websocket.
type WSConn interface {
	// Send writes JSON-encoded data to the connection.
	Send(data []byte) error
	// Receive reads JSON data from the connection into the provided pointer.
	Receive(data interface{}) error
}

// RealWSConn adapts a *websocket.Conn to satisfy the WSConn interface.
type RealWSConn struct {
	conn *websocket.Conn
}

// NewRealWSConn creates a RealWSConn from a *websocket.Conn.
func NewRealWSConn(conn *websocket.Conn) *RealWSConn {
	return &RealWSConn{conn: conn}
}

// Send writes data to the WebSocket connection.
func (r *RealWSConn) Send(data []byte) error {
	return websocket.Message.Send(r.conn, string(data))
}

// Receive reads data from the WebSocket connection.
func (r *RealWSConn) Receive(data interface{}) error {
	return websocket.Message.Receive(r.conn, data)
}
