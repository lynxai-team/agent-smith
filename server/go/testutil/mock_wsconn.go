package testutil

import (
	"sync"
)

// MockWSConn is a mock implementation of websock.WSConn for testing.
type MockWSConn struct {
	mu       sync.Mutex
	sent     [][]byte       // messages sent via Send()
	queued   [][]byte       // messages queued for Receive()
	sendErr  error          // error to return from Send()
	receiveIdx int          // index of next message to return from Receive()
}

// NewMockWSConn creates a new MockWSConn.
func NewMockWSConn() *MockWSConn {
	return &MockWSConn{
		sent:   make([][]byte, 0),
		queued: make([][]byte, 0),
	}
}

// Send records the data sent to the connection.
func (m *MockWSConn) Send(data []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	// Copy the data to avoid mutations
	copied := make([]byte, len(data))
	copy(copied, data)
	m.sent = append(m.sent, copied)
	return m.sendErr
}

// GetSentMessages returns all messages that were sent.
func (m *MockWSConn) GetSentMessages() [][]byte {
	m.mu.Lock()
	defer m.mu.Unlock()
	result := make([][]byte, len(m.sent))
	for i, msg := range m.sent {
		copied := make([]byte, len(msg))
		copy(copied, msg)
		result[i] = copied
	}
	return result
}

// GetSentMessageCount returns the number of messages sent.
func (m *MockWSConn) GetSentMessageCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.sent)
}

// QueueMessage adds a message to be returned by the next Receive() call.
func (m *MockWSConn) QueueMessage(data []byte) {
	m.mu.Lock()
	defer m.mu.Unlock()
	copied := make([]byte, len(data))
	copy(copied, data)
	m.queued = append(m.queued, copied)
}

// Receive returns the next queued message.
func (m *MockWSConn) Receive(data interface{}) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.receiveIdx >= len(m.queued) {
		// Set data to nil to indicate exhaustion
		if dst, ok := data.(*[]byte); ok {
			*dst = nil
		}
		return nil // EOF-like behavior
	}

	// The data parameter should be a pointer to json.RawMessage or similar
	// We set the value directly
	switch dst := data.(type) {
	case *[]byte:
		*dst = m.queued[m.receiveIdx]
	case *string:
		*dst = string(m.queued[m.receiveIdx])
	default:
		// For json.RawMessage (*json.RawMessage is *[]byte)
		if raw, ok := data.(*[]byte); ok {
			*raw = m.queued[m.receiveIdx]
		}
	}
	m.receiveIdx++
	return nil
}

// SetSendError sets the error to return from Send().
func (m *MockWSConn) SetSendError(err error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sendErr = err
}

// Reset clears all state.
func (m *MockWSConn) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sent = make([][]byte, 0)
	m.queued = make([][]byte, 0)
	m.receiveIdx = 0
	m.sendErr = nil
}
