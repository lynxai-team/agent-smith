import { Lm } from "@agent-smith/agent";
import { ref } from "@vue/reactivity";
import colors from "ansi-colors";
import { readBackends } from "../db/read.js";
import { setDefaultBackend } from "../db/write.js";
import { runtimeDataError } from "../utils/user_msgs.js";

const backend = ref<Lm>();
const backends: Record<string, Lm> = {};
const isBackendUp = ref(false);

async function initBackends() {
    const rmb = readBackends();
    //console.log("Backends:", rmb)
    let defaultBackendName: string | null = null;
    for (const bk of Object.values(rmb)) {
        //console.log("BK", bk.name);
        let name = bk.name;
        let apiKey = "";
        if (bk?.apiKey) {
            if (bk.apiKey.startsWith("$")) {
                const apk = process.env[bk.apiKey.slice(1)];
                if (apk === undefined) {
                    runtimeDataError(`No ${bk.apiKey} environment variable found, required for `, name)
                    return
                }
                apiKey = apk
            } else {
                apiKey = bk.apiKey
            }
        };
        const lm = new Lm({
            name: name,
            serverUrl: bk.url,
            apiKey: apiKey.length > 0 ? apiKey : undefined,
        });
        lm.name = bk.name;
        //console.log("ADD BK", lm);
        backends[name] = lm;
        if (bk.isDefault) {
            defaultBackendName = bk.name
        }
    }
    if (defaultBackendName !== null) {
        backend.value = backends[defaultBackendName];
        //console.log("Setting default backend", defaultBackendName, "/", backend.value.name)
        /*isBackendUp.value = await probeBackend(backend.value, isVerbose);

        if (isBackendUp.value && backend.value.providerType == "ollama") {
            await backend.value.modelsInfo();
        }*/
    }
}

async function setBackend(name: string, isVerbose = false) {
    if (!(Object.keys(backends).includes(name))) {
        runtimeDataError(`Backend ${name} not found. Available backends: ${Object.keys(backends)}`);
        return false
    }
    backend.value = backends[name];
    setDefaultBackend(name);
    console.log("Default backend set to", name);
    isBackendUp.value = await probeBackend(backend.value, isVerbose);
    return isBackendUp.value
}

async function listBackends(printResult = true): Promise<string> {
    //console.log("DEFB", backend.value?.name);
    const allBk = new Array<string>();
    for (const [name, lm] of Object.entries(backends)) {
        const bcn = (name == backend.value?.name) ? colors.bold(name) : name;
        //const isUp = await probeBackend(lm, false);
        const buf = new Array<string>("-", bcn, colors.dim(lm.serverUrl), /*isUp ? "🟢" : ""*/);
        const str = buf.join(" ");
        if (printResult) {
            console.log(str)
        }
        allBk.push(str)
    }
    return allBk.join(" ");
}

const probeBackend = async (lm: Lm, isVerbose: boolean): Promise<boolean> => {
    let isUp = false;
    try {
        await lm.modelsInfo();
        if (isVerbose) {
            console.log(`Provider ${lm.name} up`)
        }
        isUp = true;
    } catch (e) {
        if (isVerbose) {
            console.log(`Provider ${lm.name} down`, e)
        }
    }
    return isUp
}

export {
    backend, backends, initBackends, listBackends, setBackend
};
