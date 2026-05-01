function createAwaiter<T = boolean>() {
    let resolveFn: (value: T) => void;
    let rejectFn: (reason?: any) => void;

    const promise = new Promise<T>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });

    return {
        awaiter: promise,
        unblock: resolveFn!,
        reject: rejectFn!
    };
}

export {
    createAwaiter,
}