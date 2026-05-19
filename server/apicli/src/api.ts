import { createParser, EventSourceMessage } from 'eventsource-parser';
import { ServerParams, type StreamedMessage } from './interfaces.js';

const useServer = (params: ServerParams) => {
    const url = params?.url ? params.url : "http://localhost:5184";
    const isVerbose = params?.isVerbose ? params.isVerbose : true;

    const _useOnParse = (result: any) => {
        return (event: EventSourceMessage) => {
            //console.log("Onparse", event);
            const msg: StreamedMessage = JSON.parse(event.data);
            //console.log("Onparse msg:", msg.type);
            switch (msg.type) {
                case "system":
                    if (msg.content == "start_emitting") {
                        if (isVerbose) {
                            if (msg?.data?.thinking_time_format) {
                                console.log("Thinking time:", msg.data.thinking_time_format)
                            }
                        }
                    } else if (msg.content == "result") {
                        result = msg.data;
                        if (isVerbose) {
                            if (msg.data?.stats) {
                                //console.log(msg.data.stats);
                                const tps = msg.data.stats.tokensPerSecond;
                                const tt = msg.data.stats.totalTokens;
                                const ti = msg.data.stats.totalTimeSeconds;
                                console.log("\nTotal tokens:", tt);
                                console.log("Total time:", ti);
                                console.log("Tokens per second:", tps);
                                //console.log(msg.data)
                            }
                        }
                    }
                    break;
                case "error":
                    throw new Error(msg.content)
                default:
                    params.onToken(msg.content);
                //default:
                //    throw new Error(`unknown message type |${msg.type}|`)
            }
        }
    }


    const executeTask = async (taskPath: string, prompt: string, variables: Record<string, any> = {}, abortSignal?: AbortSignal) => {
        let result: any = {};
        const parser = createParser({ onEvent: _useOnParse(result) });
        const payload = { name: taskPath, payload: { prompt: prompt }, options: variables };
        if (isVerbose) {
            console.log("Ingesting prompt ...")
        }
        //console.log("PL", payload, url);
        const response = await fetch(url + "/task", {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${params.apiKey}`,
            },
            signal: abortSignal, // Pass the abort signal
        });
        if (!response?.body) {
            throw new Error("No response")
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
            const result = await reader.read();
            //console.log("RESULT", result);
            if (result.done) {
                break;
            }
            const chunk = decoder.decode(result.value.buffer);
            //console.log("Chunk:", typeof chunk, "|" + chunk + "|")
            parser.feed(chunk)
        }
    };

    const executeWorkflow = async (name: string, upayload: any, options: Record<string, any> = {}, abortSignal?: AbortSignal) => {
        let result: any = {};
        const parser = createParser({ onEvent: _useOnParse(result) });
        const payload = { name: name, payload: upayload, options: options };
        //console.log("PL", payload, url);
        //console.log("SIG", abortSignal);
        const response = await fetch(url + "/workflow", {
            method: 'POST',
            body: typeof payload == "object" ? JSON.stringify(payload) : payload,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${params.apiKey}`,
            },
            signal: abortSignal, // Pass the abort signal
        });
        if (!response?.body) {
            throw new Error("No response")
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
            const _result = await reader.read();
            //console.log("RESULT", result);
            if (_result.done) {
                break;
            }
            const chunk = decoder.decode(_result.value.buffer);
            //console.log("Chunk:", typeof chunk, "|" + chunk + "|")
            parser.feed(chunk)
        }
        console.log("RESULT", result);
        return result
    };


    const executeCmd = async (cmdName: string, _params: Array<string> = [], abortSignal?: AbortSignal) => {
        let result: any = {};
        const parser = createParser({ onEvent: _useOnParse(result) });
        const payload = { cmd: cmdName, params: _params };
        if (isVerbose) {
            console.log("Executing command ...")
        }
        const response = await fetch(url + "/cmd/execute", {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${params.apiKey}`,
            },
            signal: abortSignal, // Pass the abort signal
        });
        if (!response?.body) {
            throw new Error("No response")
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const result = await reader.read();
            if (result.done) {
                break;
            }
            const chunk = decoder.decode(result.value);
            parser.feed(chunk)
        }
    };

    return {
        executeTask,
        executeWorkflow,
        executeCmd,
    }
}

export { useServer }