import { FeatureExecutor } from "@agent-smith/types";

function createJsAction(action: CallableFunction): FeatureExecutor {
    const run: FeatureExecutor = async (args, options) => {
        //console.log("JS ACTION PARAMS", args);
        try {
            const res = await action(args, options);
            return res
        }
        catch (e: any) {
            /*if (e?.text) {
                throw new Error(`executing action:${e.text()}. Args: ${args}`);
            }*/
            const msg = `executing js action:${e}`;
            console.error(msg);
            throw new Error(msg);
        }
    };
    return run
}

export { createJsAction }