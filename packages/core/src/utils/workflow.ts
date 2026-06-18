import type { WorkflowStep } from "@agent-smith/types";


function readInlineWorkflow(wf: Array<Record<string, string>>): Array<WorkflowStep> {
    const wfs = new Array<WorkflowStep>();
    for (const step of wf) {
        //console.log("WFS", step);
        const ks = Object.keys(step);
        const t = ks[0];
        const n = step[t];
        wfs.push({
            type: t,
            name: n,
        })
    }
    return wfs
}

export {
    readInlineWorkflow,
}