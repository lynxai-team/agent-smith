package state

import (
	"context"

	"github.com/synw/agent-smith/server/go/types"
)

// app state
var IsVerbose = true
var IsDebug = false

// inference state
var IsInfering = false

var Conf types.Conf

// WsSession holds per-session WebSocket state
type WsSession struct {
	AbortController  context.CancelFunc
	ConfirmToolCalls map[string]chan bool
}
