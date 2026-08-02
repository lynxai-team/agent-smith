package state

import (
	"context"
	"testing"
)

// TestWsSession_New verifies a new WsSession has nil AbortController and empty ConfirmToolCalls map.
func TestWsSession_New(t *testing.T) {
	s := &WsSession{}

	// GetAbortController should return nil for a fresh session
	if got := s.GetAbortController(); got != nil {
		t.Errorf("GetAbortController() = %v, want nil", got)
	}

	// ConfirmToolCalls should be empty (nil or zero-length map)
	if s.ConfirmToolCalls != nil && len(s.ConfirmToolCalls) != 0 {
		t.Errorf("ConfirmToolCalls length = %d, want 0", len(s.ConfirmToolCalls))
	}
}

// TestWsSession_SetAbortController verifies SetAbortController stores a cancel func correctly.
func TestWsSession_SetAbortController(t *testing.T) {
	s := &WsSession{}

	ctx, cancel := context.WithCancel(context.Background())
	s.SetAbortController(cancel)

	// GetAbortController should return the stored cancel func
	got := s.GetAbortController()
	if got == nil {
		t.Fatal("GetAbortController() returned nil after SetAbortController")
	}

	// Calling the retrieved cancel func should cancel the context
	got()
	select {
	case <-ctx.Done():
		// expected: context was cancelled
	default:
		t.Error("context was not cancelled after calling GetAbortController()")
	}
}

// TestWsSession_GetAbortController verifies GetAbortController returns nil when not set,
// and the correct cancel func when set.
func TestWsSession_GetAbortController(t *testing.T) {
	s := &WsSession{}

	// Before setting, should return nil
	if got := s.GetAbortController(); got != nil {
		t.Errorf("GetAbortController() before Set = %v, want nil", got)
	}

	// Set and retrieve
	ctx, cancel := context.WithCancel(context.Background())
	s.SetAbortController(cancel)

	got := s.GetAbortController()
	if got == nil {
		t.Fatal("GetAbortController() returned nil after SetAbortController")
	}

	// Verify it's the same cancel func by cancelling and checking context
	got()
	select {
	case <-ctx.Done():
		// expected
	default:
		t.Error("context not cancelled via retrieved cancel func")
	}
}

// TestWsSession_ClearAbortController verifies ClearAbortController clears the controller
// so subsequent GetAbortController() returns nil.
func TestWsSession_ClearAbortController(t *testing.T) {
	s := &WsSession{}

	_, cancel := context.WithCancel(context.Background())
	s.SetAbortController(cancel)

	// Verify it's set
	if s.GetAbortController() == nil {
		t.Fatal("GetAbortController() returned nil before ClearAbortController")
	}

	// Clear it
	s.ClearAbortController()

	// Now GetAbortController should return nil
	if got := s.GetAbortController(); got != nil {
		t.Errorf("GetAbortController() after Clear = %v, want nil", got)
	}
}

// TestWsSession_ConfirmToolCalls verifies map operations (add, get, delete).
func TestWsSession_ConfirmToolCalls(t *testing.T) {
	s := &WsSession{}

	// Initialize the map
	s.ConfirmToolCalls = make(map[string]chan bool)

	// Add an entry
	ch := make(chan bool, 1)
	s.ConfirmToolCalls["tool-1"] = ch

	// Get the entry
	gotCh, ok := s.ConfirmToolCalls["tool-1"]
	if !ok {
		t.Fatal("ConfirmToolCalls[\"tool-1\"] not found after add")
	}
	if gotCh != ch {
		t.Error("ConfirmToolCalls[\"tool-1\"] returned wrong channel")
	}

	// Send a value through the channel to verify it works
	gotCh <- true
	val := <-ch
	if !val {
		t.Error("channel did not receive expected true value")
	}

	// Delete the entry
	delete(s.ConfirmToolCalls, "tool-1")

	// Verify it's gone
	if _, ok := s.ConfirmToolCalls["tool-1"]; ok {
		t.Error("ConfirmToolCalls[\"tool-1\"] still exists after delete")
	}

	// Verify map is empty
	if len(s.ConfirmToolCalls) != 0 {
		t.Errorf("ConfirmToolCalls length = %d, want 0", len(s.ConfirmToolCalls))
	}
}

// TestGlobalState_Defaults verifies default values of IsVerbose, IsDebug, IsInfering.
func TestGlobalState_Defaults(t *testing.T) {
	if !IsVerbose.Load() {
		t.Error("IsVerbose = false, want true")
	}
	if IsDebug.Load() {
		t.Error("IsDebug = true, want false")
	}
	if IsInfering {
		t.Error("IsInfering = true, want false")
	}
}
