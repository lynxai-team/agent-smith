import type { InferenceParams } from "./inference.js";
import type { LmProviderType } from "./lm.js";
import type { TaskDef, TaskVariables } from "./task.js";


interface FeatureSpec {
    id?: number;
    name: string;
    path: string;
    ext: FeatureExtension;
    variables?: TaskVariables | Record<string, any>;
    type?: string;
    category?: string;
}

interface Features {
    agent: Array<{ name: string, path: string, ext: AgentExtension }>;
    task: Array<{ name: string, path: string, ext: TaskExtension }>;
    cmd: Array<{
        name: string, path: string, ext: CmdExtension,
        variables?: { name: string, options?: Array<Array<string> | string>, description: string }
    }>;
    action: Array<{ name: string, path: string, ext: ActionExtension }>;
    workflow: Array<{ name: string, path: string, ext: WorkflowExtension }>;
    adaptater: Array<{ name: string, path: string, ext: AdaptaterExtension }>;
}

interface UserCmdDef {
    name: string;
    description: string;
    run: (args: any, options: Record<string, any>) => Promise<any>;
    options?: Array<Array<string> | string>;
}

interface Settings {
    name: string;
    inputmode: InputMode;
    outputmode: OutputMode;
    runmode: RunMode;
    formatmode: FormatMode;
    ischatMode: boolean;
    isdebug: boolean;
    isverbose: boolean;
    promptfile: string;
}

interface DbModelDef {
    id?: number;
    name: string;
    shortname: string;
    data: Record<string, any>;
}

interface LmTaskFileSpec extends TaskDef {
    ctx: number;
    mcp?: McpServerSpec;
}

interface BaseLmTaskConfig {
    inferParams: InferenceParams;
    debug?: boolean;
}

interface LmTaskConfig extends BaseLmTaskConfig {
    model?: string;
    quiet?: boolean;
}

interface WorkflowStep {
    name: string;
    type: string;
}

interface McpServerSpec {
    command: string;
    arguments: string[];
    tools: string[];
}

interface McpServerTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, { type: string; description: string }>;
        required: string[];
    };
}

type InputMode = "manual" | "promptfile" | "clipboard";
type OutputMode = "txt" | "clipboard";
type RunMode = "cli" | "cmd";
type FormatMode = "text" | "markdown";
type VerbosityMode = "quiet" | "verbose" | "debug";

type FeatureType = "task" | "agent" | "action" | "cmd" | "workflow" | "adaptater";
type ToolType = "task" | "agent" | "action" | "cmd" | "workflow";
type ActionExtension = "js" | "mjs" | "py" | "yml";
type TaskExtension = "yml";
type AgentExtension = "yml";
type AdaptaterExtension = "js";
type WorkflowExtension = "yml";
type CmdExtension = "js";
type FeatureExtension = TaskExtension | AgentExtension | CmdExtension | ActionExtension | WorkflowExtension;
type AliasType = "task" | "agent" | "action" | "workflow";

type FeatureExecutor<I = any, O = any> = (params: I, options: Record<string, any>) => Promise<O>;

export {
    InputMode,
    VerbosityMode,
    OutputMode,
    RunMode,
    FormatMode,
    ActionExtension,
    TaskExtension,
    AgentExtension,
    WorkflowExtension,
    AdaptaterExtension,
    CmdExtension,
    FeatureSpec,
    Features,
    FeatureExtension,
    AliasType,
    ToolType,
    Settings,
    DbModelDef,
    LmTaskFileSpec,
    LmTaskConfig,
    McpServerSpec,
    McpServerTool,
    FeatureExecutor,
    WorkflowStep,
    UserCmdDef,
    FeatureType,
}