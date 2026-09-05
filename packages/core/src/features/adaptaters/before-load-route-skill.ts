async function action(args: any, options: any) {
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    const pr = args[0];
    return { prompt: pr }
}

export { action };