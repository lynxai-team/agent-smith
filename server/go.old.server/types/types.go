package types

type Conf struct {
	Origins   []string
	CmdApiKey ValidApiKey
	Groups    map[GroupApiKey]AuthorizedCmds
	ApiKeys   []GroupApiKey
}

type ValidApiKey struct {
	Key     string
	IsValid bool
}

type ApiKeys []string
type GroupApiKey string
type AuthorizedCmds []string

type MsgType string

const (
	TokenMsgType  MsgType = "token"
	SystemMsgType MsgType = "system"
	ErrorMsgType  MsgType = "error"
)

type StreamedMessage struct {
	Content string                 `json:"content"`
	Num     int                    `json:"num"`
	MsgType MsgType                `json:"type"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

type InferenceStats struct {
	ThinkingTime       float64 `json:"thinkingTime"`
	ThinkingTimeFormat string  `json:"thinkingTimeFormat"`
	EmitTime           float64 `json:"emitTime"`
	EmitTimeFormat     string  `json:"emitTimeFormat"`
	TotalTime          float64 `json:"totalTime"`
	TotalTimeFormat    string  `json:"totalTimeFormat"`
	TokensPerSecond    float64 `json:"tokensPerSecond"`
	TotalTokens        int     `json:"totalTokens"`
}

type InferenceResult struct {
	Text  string         `json:"text"`
	Stats InferenceStats `json:"stats"`
}
