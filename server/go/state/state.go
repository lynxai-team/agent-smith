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

func init() {
	IsVerbose.Store(true)
	IsDebug.Store(false)
}

// inference state
var IsInfering = false

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
	AbortController  atomic.Pointer[context.CancelFunc]
	ConfirmToolCalls map[string]chan bool
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
