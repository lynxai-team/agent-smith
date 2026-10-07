async function action(args: any, options: any) {
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    options.variables.executors = options.executors;
    return { prompt: args[0], ...options }
}

export { action };