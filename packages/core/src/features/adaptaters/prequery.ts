async function action(params: Array<any>, options: Record<string, any>) {
    const res = { prompt: params.join(" ") };
    return res;
}

export { action }