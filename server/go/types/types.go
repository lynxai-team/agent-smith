package types

// Config types

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

// WebSocket protocol types — client messages

type WsClientMsgType string

const (
	CommandMsgType WsClientMsgType = "command"
	SystemMsgType  WsClientMsgType = "system"
)

type WsClientMsg struct {
	Command  string                 `json:"command"`
	Type     WsClientMsgType        `json:"type"`
	Feature  string                 `json:"feature,omitempty"`
	Payload  map[string]interface{} `json:"payload,omitempty"`
	Options  map[string]interface{} `json:"options,omitempty"`
}

// WebSocket protocol types — server messages

type WsServerMsgType string

const (
	ErrorMsgType              WsServerMsgType = "error"
	StartEmitType             WsServerMsgType = "startemit"
	TokenType                 WsServerMsgType = "token"
	ThinkingTokenType         WsServerMsgType = "thinkingtoken"
	TurnStartType             WsServerMsgType = "turnstart"
	TurnEndType               WsServerMsgType = "turnend"
	AssistantType             WsServerMsgType = "assistant"
	ThinkingStartType         WsServerMsgType = "thinkingstart"
	ThinkingEndType           WsServerMsgType = "thinkingend"
	ToolCallInProgressType    WsServerMsgType = "toolcallinprogress"
	PromptProcessingProgress  WsServerMsgType = "promptprocessingprogress"
	ToolCallTokenType         WsServerMsgType = "toolcalltoken"
	ToolsTurnStartType        WsServerMsgType = "toolsturnstart"
	ToolsTurnEndType          WsServerMsgType = "toolsturnend"
	ToolCallType              WsServerMsgType = "toolcall"
	ToolCallEndType           WsServerMsgType = "toolcallend"
	ToolCallConfirmType       WsServerMsgType = "toolcallconfirm"
	FinalResultType           WsServerMsgType = "finalresult"
	ThinkType                 WsServerMsgType = "think"
	EndEmitType               WsServerMsgType = "endemit"
)

type WsRawServerMsg struct {
	Type WsServerMsgType `json:"type"`
	From string          `json:"from"`
	Msg  string          `json:"msg"`
}

// Tool call types

type ToolCallSpec struct {
	ID        string                 `json:"id,omitempty"`
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments"`
}

type PerformanceMetrics struct {
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
	Text  string            `json:"text"`
	Stats PerformanceMetrics `json:"stats"`
}

type PromptProcessingInProgressStats struct {
	ThinkingTime float64 `json:"thinkingTime,omitempty"`
	EmitTime     float64 `json:"emitTime,omitempty"`
}
