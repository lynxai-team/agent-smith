interface ServerParams {
    apiKey: string;
    onToken: (token: string) => void;
    url?: string;
    isVerbose?: boolean;
}

interface StreamedMessage {
    content: string;
    type: MsgType;
    num: number;
    data?: Record<string, any>;
}

type MsgType = "token" | "system" | "error";

export {
    ServerParams,
    StreamedMessage,
}