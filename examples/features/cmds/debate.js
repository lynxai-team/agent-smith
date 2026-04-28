import { executeTask, init, extractBetweenTags, splitThinking } from "../../../packages/cli/dist/main.js";
import { confirm } from '@inquirer/prompts';
import { input } from '@inquirer/prompts';
import { exit } from "node:process";
import color from "ansi-colors";

const participants = [
    { name: "senior", model: "qwen4b", template: "chatml", role: "senior", nothink: true },
    { name: "ideas", model: "lfm8b", template: "lfm", role: "brainstorm ideas" },
    { name: "perspective", model: "lfm8b", template: "chatml", role: "take distance and provide a larger general dialectical and philosophical perspective about the debate while helping getting to a conclusion" },
    { name: "critic", model: "lfm8b", template: "lfm", role: "review and critic, check if clarifications are needed (we can ask the user), take a broader perspective and help you partners getting to a conclusion" },
    { name: "orientation", model: "qwen2b", template: "chatml", role: "evaluate the debate's progress and orientation to help leading to a conclusion", nothink: true },
];
const advisors = [
    {
        name: "review",
        model: "qwen4b",
        template: "chatml",
        role: "evaluate the debate's progress and how far we are from getting to a conclusion"
    },
];
const history = [];
let nTurn = 0;

async function answer(p, question, options, instructions, isAdvisor) {
    let t = p?.nothink ? "debate-talk-nothink" : "debate-talk";
    if (isAdvisor) {
        t = "debate-advisor";
    }
    const opts = {
        model: p?.model ? p.model : p.name,
        template: p.template,
        question: question,
        name: p.name,
        role: p.role,
        ...options
    };
    if (instructions) {
        opts.instructions = instructions;
    } else {
        opts.instructions = "nothing specific, continue the debate normaly";
    }
    const res = await executeTask(t, {
        prompt: history.length > 0 ? history.join("\n\n") : "Start the conversation",
    }, opts);
    const { finalAnswer } = splitThinking(res.answer.text.trim(), "<think>", "</think>");
    history.push("**" + p.name + "**: ", finalAnswer);
}

async function orchestrate(question, options, start = false) {
    nTurn++;
    console.log(nTurn, color.greenBright("orchestrator"));
    const ps = [];
    participants.forEach(p => {
        ps.push(p.name + " (role: " + p.role + ")");
    });
    const ad = [];
    advisors.forEach(p => {
        ps.push(p.name + " (" + p.role + ")");
    });
    const cres = await executeTask("debate-orchestrator", {
        prompt: start ? "The conversation has not started yet" : history.join("\n\n"),
    }, {
        question: question,
        participants: ps.join((", ")),
        advisors: ad.join((", ")),
        ...options
    });
    const txt = cres.answer.text;
    const action = extractBetweenTags(txt, "<action>", "</action>");
    if (action == "ask-user") {
        const q = extractBetweenTags(txt, "<content>", "</content>");
        console.log(color.bold.yellow(action), q);
        const answer = await input({ message: q });
        history.push("**user**: ", answer);
        await orchestrate(question, options);
    } else if (action == "discussion") {
        let ins = "";
        if (txt.includes("<content>")) {
            ins = extractBetweenTags(txt, "<content>", "</content>");
            history.push("**leader**: " + ins);
        }
        console.log(color.bold.yellow(action), color.dim(ins));
        return;
    } else if (action == "close") {
        console.log(color.bold.yellow(action));
        exit(0);
    } else if (action == "ask") {
        const p = extractBetweenTags(txt, "<to>", "</to>");
        let ins = extractBetweenTags(txt, "<content>", "</content>");
        console.log(color.bold.yellow(action), p, ":", color.dim(ins));
        let isAdvisor = false;
        let participant = participants.find(o => o.name === p);
        if (!participant) {
            participant = advisors.find(o => o.name === p);
            isAdvisor = true;
        }
        if (!participant) {
            throw new Error(`participant or advisor ${p} not found`);
        }
        ins = `question for ${participant.name}: ${ins}`;
        history.push("**leader**: " + ins);
        console.log(nTurn, ":", color.bold(participant.name));
        await answer(participant, question, options, ins, isAdvisor);
        await orchestrate(question, options);
    }
    else {
        const answer = await confirm({ message: 'Continue?' });
        if (!answer) { exit(0); }
    }
}

async function run(args, options) {
    await init();
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    const question = args[0];
    let continueDebate = true;
    await orchestrate(question, options, true);
    while (continueDebate) {
        let i = 0;
        for (const p of participants) {
            ++i;
            console.log(nTurn, "(" + i + ")", ":", color.bold(p.name));
            await answer(p, question, options);
        }
        await orchestrate(question, options);
    }
    return { prompt: args[0] };
}

const cmd = {
    name: "debate <args>",
    description: "Debate cmd",
    options: [
        "all",
    ],
    run: run
};

export { cmd };