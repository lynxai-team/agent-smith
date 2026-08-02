package utils

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// ---------------------------------------------------------------------------
// 1. TestCreateAwaiter — verify non-nil with initialized channel
// ---------------------------------------------------------------------------
func TestCreateAwaiter(t *testing.T) {
	t.Parallel()

	awaiter := CreateAwaiter()

	assert.NotNil(t, awaiter, "CreateAwaiter should return a non-nil *Awaiter")
	assert.NotNil(t, awaiter.ch, "The internal channel must be initialized (non-nil)")
}

// ---------------------------------------------------------------------------
// 2. TestAwaiter_Resolve_True & 3. TestAwaiter_Resolve_False
//    Table-driven test for both boolean values
// ---------------------------------------------------------------------------
func TestAwaiter_Resolve(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		value bool
	}{
		{name: "resolve_true",  value: true},
		{name: "resolve_false", value: false},
	}

	for _, tc := range tests {
		tc := tc // capture range variable
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			awaiter := CreateAwaiter()
			awaiter.Resolve(tc.value)
			result := awaiter.Wait()

			assert.Equal(t, tc.value, result, "Wait() should return the value passed to Resolve()")
		})
	}
}

// ---------------------------------------------------------------------------
// 4. TestAwaiter_Wait_Blocks_Until_Resolve
//    Verify that Wait() blocks until Resolve is called (using timeout)
// ---------------------------------------------------------------------------
func TestAwaiter_Wait_Blocks_Until_Resolve(t *testing.T) {
	t.Parallel()

	awaiter := CreateAwaiter()

	// Launch Wait in a goroutine
	done := make(chan bool, 1)
	go func() {
		result := awaiter.Wait()
		done <- result
	}()

	// Give the goroutine time to actually block
	time.Sleep(50 * time.Millisecond)

	// Verify that Wait has NOT returned yet by attempting a non-blocking read on done
	select {
	case result := <-done:
		t.Fatalf("Wait() returned prematurely with value %v — it should have blocked", result)
	default:
		// Expected: no value available yet, meaning Wait is still blocked ✓
	}

	// Now resolve and verify the goroutine completes promptly
	awaiter.Resolve(true)

	select {
	case result := <-done:
		assert.True(t, result, "Wait() should return true after Resolve(true)")
	case <-time.After(2 * time.Second):
		t.Fatal("Wait() did not return within 2s after Resolve — possible deadlock")
	}
}

// ---------------------------------------------------------------------------
// 5. TestAwaiter_Concurrent_Resolve_Wait
//    Stress-test concurrent resolve/wait for race conditions
// ---------------------------------------------------------------------------
func TestAwaiter_Concurrent_Resolve_Wait(t *testing.T) {
	t.Parallel()

	const goroutines = 50
	var wg sync.WaitGroup
	wg.Add(goroutines)

	for i := 0; i < goroutines; i++ {
		go func(idx int) {
			defer wg.Done()

			awaiter := CreateAwaiter()
			expected := idx%2 == 0 // alternate true/false

			// Resolve from one goroutine, wait from another
			go awaiter.Resolve(expected)

			result := awaiter.Wait()
			assert.Equal(t, expected, result, "Concurrent resolve/wait should match expected value")
		}(i)
	}

	wg.Wait()
}

// ---------------------------------------------------------------------------
// 6. TestAwaiter_Buffered_Channel
//    Verify buffer size 1 — Resolve before Wait must NOT block
// ---------------------------------------------------------------------------
func TestAwaiter_Buffered_Channel(t *testing.T) {
	t.Parallel()

	awaiter := CreateAwaiter()

	// Resolve BEFORE waiting — should not block because channel is buffered (cap=1)
	done := make(chan struct{})
	go func() {
		awaiter.Resolve(true)
		close(done)
	}()

	select {
	case <-done:
		// ✓ Resolve completed without blocking — buffer works
	case <-time.After(2 * time.Second):
		t.Fatal("Resolve blocked even though channel is buffered — buffer size may be wrong")
	}

	// Now Wait should pick up the already-sent value immediately
	result := awaiter.Wait()
	assert.True(t, result, "Wait should return the pre-buffered value")
}
