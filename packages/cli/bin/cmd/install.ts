import { conf, utils, state } from "@agent-smith/core";
import { confirm } from '@inquirer/prompts';
import path from "path";

async function installPlugin(args: Array<string>, options: Record<string, any>) {
    const { confDir } = conf.getConfigPath("agent-smith", "config.db");
    const confPath = path.join(confDir, "config.yml");
    await state.init(true);
    let name = args[0];
    if (name.endsWith("@latest")) {
        name = name.split("@latest")[0];
    }
    console.log(`Installing the ${name} plugin`);
    await utils.execute("npm", ["install", "-g", name]);
    const { data } = conf.readConf(confPath);
    if (!data?.plugins) {
        data.plugins = [];
    }
    if (!data.plugins.includes(name)) {
        data.plugins = [
            ...data.plugins,
            name
        ];
        console.log("Updating config file ...")
        conf.updateConfigFile(data);
        //console.log("CONF", data)
    }
    if (!options.noUpdateConf) {
        await conf.updateConfCmd(["conf"]);
    }
}

async function updateAll(args: Array<string>, options: Record<string, any>) {
    options.updateInstall = true;
    await installAll(args, options);
}

async function installAll(args: Array<string>, options: Record<string, any>) {
    const { confDir } = conf.getConfigPath("agent-smith", "config.db");
    const confPath = path.join(confDir, "config.yml");
    conf.createConfigFileIfNotExists(confPath);
    await state.init(true);
    //await conf.updateConfCmd(["conf"]);
    options.noUpdateConf = true;
    console.log("Installing plugins ...");
    const pls = [
        "@agent-smith/feat-fs@latest",
        "@agent-smith/feat-shell@latest",
        "@agent-smith/feat-agents@latest",
        "@agent-smith/feat-search@latest"
    ];
    for (const p of pls) {
        await installPlugin([p], options)
    }
    await conf.updateConfCmd(["conf"]);
    // ui
    if (options.updateInstall === true) {
        return
    }
    const installUi = await confirm({ message: "Clone and install the graphical user interface?" });
    if (!installUi) {
        return
    }
    await utils.execute("git", ["clone", "https://github.com/lynxai-team/agent-smith-ui"]);
    const uiDir = path.join(process.cwd(), "agent-smith-ui");
    console.log("Installing the ui ...");
    await utils.execute("npm", ["install"], uiDir);
    console.log("Building the ui ...");
    await utils.execute("npm", ["run", "build"], uiDir);
    console.log("Run 'npm run local' from the agent-smith-ui folder to start the ui");
    console.log(`A Llama.cpp local backend is configured by default. To add or remove backends edit ${confPath}/config.yml`)
}

export {
    installAll,
    updateAll,
    installPlugin,
}