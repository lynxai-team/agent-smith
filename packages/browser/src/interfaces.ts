interface LmBrowserProviderParams {
    name: string;
    onToken?: (t: string) => void;
    onStartEmit?: (data?: any) => void;
    onError?: (err: string) => void;
}

export {
    LmBrowserProviderParams,
}