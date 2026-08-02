package testutil

import (
	"errors"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestNewMockWSConn verifies constructor initializes empty sent/queued slices.
func TestNewMockWSConn(t *testing.T) {
	m := NewMockWSConn()
	assert.NotNil(t, m)
	assert.Empty(t, m.GetSentMessages())
	assert.Equal(t, 0, m.GetSentMessageCount())

	// Receive on empty queue should return nil (no error, no data).
	var data []byte
	err := m.Receive(&data)
	assert.NoError(t, err)
}

// TestMockWSConn_Send verifies Send() records messages in the sent slice.
func TestMockWSConn_Send(t *testing.T) {
	m := NewMockWSConn()

	err := m.Send([]byte("hello"))
	assert.NoError(t, err)

	err = m.Send([]byte("world"))
	assert.NoError(t, err)

	msgs := m.GetSentMessages()
	assert.Len(t, msgs, 2)
	assert.Equal(t, []byte("hello"), msgs[0])
	assert.Equal(t, []byte("world"), msgs[1])
}

// TestMockWSConn_Send_Error verifies Send() returns configured sendErr.
func TestMockWSConn_Send_Error(t *testing.T) {
	m := NewMockWSConn()
	expectedErr := errors.New("send failed")
	m.SetSendError(expectedErr)

	err := m.Send([]byte("data"))
	assert.ErrorIs(t, err, expectedErr)
}

// TestMockWSConn_GetSentMessages verifies it returns a copy of all sent messages.
func TestMockWSConn_GetSentMessages(t *testing.T) {
	m := NewMockWSConn()
	m.Send([]byte("alpha"))
	m.Send([]byte("beta"))

	got := m.GetSentMessages()
	assert.Len(t, got, 2)
	assert.Equal(t, []byte("alpha"), got[0])
	assert.Equal(t, []byte("beta"), got[1])

	// Mutating the returned slice should NOT affect internal state.
	got[0] = []byte("modified")
	got[1] = []byte("also modified")

	original := m.GetSentMessages()
	assert.Equal(t, []byte("alpha"), original[0])
	assert.Equal(t, []byte("beta"), original[1])
}

// TestMockWSConn_GetSentMessageCount verifies it returns the correct count.
func TestMockWSConn_GetSentMessageCount(t *testing.T) {
	m := NewMockWSConn()
	assert.Equal(t, 0, m.GetSentMessageCount())

	m.Send([]byte("one"))
	assert.Equal(t, 1, m.GetSentMessageCount())

	m.Send([]byte("two"))
	m.Send([]byte("three"))
	assert.Equal(t, 3, m.GetSentMessageCount())
}

// TestMockWSConn_QueueMessage verifies message is queued for Receive.
func TestMockWSConn_QueueMessage(t *testing.T) {
	m := NewMockWSConn()
	m.QueueMessage([]byte("queued-hello"))

	var data []byte
	err := m.Receive(&data)
	assert.NoError(t, err)
	assert.Equal(t, []byte("queued-hello"), data)
}

// TestMockWSConn_Receive verifies Receive() returns queued messages in order.
func TestMockWSConn_Receive(t *testing.T) {
	m := NewMockWSConn()
	m.QueueMessage([]byte("first"))
	m.QueueMessage([]byte("second"))
	m.QueueMessage([]byte("third"))

	var data []byte

	err := m.Receive(&data)
	assert.NoError(t, err)
	assert.Equal(t, []byte("first"), data)

	err = m.Receive(&data)
	assert.NoError(t, err)
	assert.Equal(t, []byte("second"), data)

	err = m.Receive(&data)
	assert.NoError(t, err)
	assert.Equal(t, []byte("third"), data)
}

// TestMockWSConn_Receive_Exhausted verifies nil is returned when no messages queued.
func TestMockWSConn_Receive_Exhausted(t *testing.T) {
	m := NewMockWSConn()

	var data []byte
	err := m.Receive(&data)
	assert.NoError(t, err)
	assert.Nil(t, data)

	// Queue one message and drain it.
	m.QueueMessage([]byte("only"))
	err = m.Receive(&data)
	assert.NoError(t, err)
	assert.Equal(t, []byte("only"), data)

	// Now queue is exhausted.
	err = m.Receive(&data)
	assert.NoError(t, err)
	assert.Nil(t, data)
}

// TestMockWSConn_SetSendError verifies subsequent Send() returns configured error.
func TestMockWSConn_SetSendError(t *testing.T) {
	m := NewMockWSConn()

	// Initially no error.
	err := m.Send([]byte("ok"))
	assert.NoError(t, err)

	// Set an error.
	testErr := errors.New("connection reset")
	m.SetSendError(testErr)

	err = m.Send([]byte("fail"))
	assert.ErrorIs(t, err, testErr)

	// Error persists for subsequent calls.
	err = m.Send([]byte("still fail"))
	assert.ErrorIs(t, err, testErr)
}

// TestMockWSConn_Reset verifies all state is cleared after reset.
func TestMockWSConn_Reset(t *testing.T) {
	m := NewMockWSConn()

	// Populate state.
	m.Send([]byte("msg1"))
	m.QueueMessage([]byte("q1"))
	m.SetSendError(errors.New("boom"))

	assert.Equal(t, 1, m.GetSentMessageCount())

	// Reset.
	m.Reset()

	assert.Empty(t, m.GetSentMessages())
	assert.Equal(t, 0, m.GetSentMessageCount())

	// Receive on empty queue returns nil.
	var data []byte
	err := m.Receive(&data)
	assert.NoError(t, err)
	assert.Nil(t, data)

	// Send error is cleared.
	err = m.Send([]byte("after-reset"))
	assert.NoError(t, err)
}

// TestMockWSConn_Concurrent_Safe tests concurrent Send/Receive for race conditions.
func TestMockWSConn_Concurrent_Safe(t *testing.T) {
	m := NewMockWSConn()
	const numGoroutines = 50
	const msgsPerGoroutine = 20

	var wg sync.WaitGroup

	// Concurrent Send.
	wg.Add(numGoroutines)
	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			defer wg.Done()
			for j := 0; j < msgsPerGoroutine; j++ {
				msg := append([]byte("goroutine-"), byte(id))
				err := m.Send(msg)
				assert.NoError(t, err)
			}
		}(i)
	}
	wg.Wait()

	expectedTotal := numGoroutines * msgsPerGoroutine
	assert.Equal(t, expectedTotal, m.GetSentMessageCount())

	// Concurrent QueueMessage + Receive.
	wg.Add(numGoroutines)
	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			defer wg.Done()
			for j := 0; j < msgsPerGoroutine; j++ {
				m.QueueMessage([]byte("q-"))
			}
		}(i)
	}
	wg.Wait()

	assert.Equal(t, expectedTotal, len(m.queued))

	// Drain all queued messages concurrently.
	var mu sync.Mutex
	var received int
	wg.Add(numGoroutines)
	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			var data []byte
			for {
				err := m.Receive(&data)
				if err != nil {
					return
				}
				if data == nil {
					return
				}
				mu.Lock()
				received++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()

	assert.Equal(t, expectedTotal, received)
}
