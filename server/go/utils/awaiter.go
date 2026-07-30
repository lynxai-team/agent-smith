package utils

// Awaiter implements a channel-based promise pattern for async operations.
type Awaiter struct {
	ch chan bool
}

// CreateAwaiter returns a new Awaiter with a buffered channel.
func CreateAwaiter() *Awaiter {
	return &Awaiter{
		ch: make(chan bool, 1),
	}
}

// Wait blocks until Resolve is called.
func (a *Awaiter) Wait() bool {
	return <-a.ch
}

// Resolve sends a value to the channel, unblocking Wait().
func (a *Awaiter) Resolve(value bool) {
	a.ch <- value
}
