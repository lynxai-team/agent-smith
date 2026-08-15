package state

import (
	"context"
	"sync"
	"sync/atomic"

	"github.com/synw/agent-smith/server/go/types"
)

// app state
var IsVerbose atomic.Bool
var IsDebug atomic.Bool
var ActiveWsConnections atomic.Int64

func init() {
	IsVerbose.Store(false)
	IsDebug.Store(false)
}

var Conf types.Conf

// confMu protects concurrent access to Conf.
var confMu sync.RWMutex

// GetConf returns a thread-safe copy of the global configuration.
func GetConf() types.Conf {
	confMu.RLock()
	defer confMu.RUnlock()
	return Conf
}

// SetConf sets the global configuration in a thread-safe manner.
func SetConf(c types.Conf) {
	confMu.Lock()
	defer confMu.Unlock()
	Conf = c
}

// WsSession holds per-session WebSocket state
type WsSession struct {
	AbortController    atomic.Pointer[context.CancelFunc]
	ConfirmToolCalls   map[string]chan bool
	confirmMu          sync.Mutex // protects ConfirmToolCalls map
	ApiKey             string
}

// SetAbortController sets the abort controller for this session.
func (s *WsSession) SetAbortController(cancel context.CancelFunc) {
	s.AbortController.Store(&cancel)
}

// GetAbortController returns the current abort controller, or nil if not set.
func (s *WsSession) GetAbortController() context.CancelFunc {
	p := s.AbortController.Load()
	if p == nil {
		return nil
	}
	return *p
}

// ClearAbortController clears the abort controller for this session.
func (s *WsSession) ClearAbortController() {
	var nilCancel context.CancelFunc
	s.AbortController.Store(&nilCancel)
}

// GetConfirmChannel returns the confirmation channel for a tool call ID, or false if not found.
func (s *WsSession) GetConfirmChannel(id string) (chan bool, bool) {
	s.confirmMu.Lock()
	defer s.confirmMu.Unlock()
	ch, ok := s.ConfirmToolCalls[id]
	return ch, ok
}

// SetConfirmChannel adds or updates a confirmation channel for a tool call ID.
func (s *WsSession) SetConfirmChannel(id string, ch chan bool) {
	s.confirmMu.Lock()
	defer s.confirmMu.Unlock()
	s.ConfirmToolCalls[id] = ch
}

// DeleteConfirmChannel removes a confirmation channel entry for a tool call ID.
func (s *WsSession) DeleteConfirmChannel(id string) {
	s.confirmMu.Lock()
	defer s.confirmMu.Unlock()
	delete(s.ConfirmToolCalls, id)
}
