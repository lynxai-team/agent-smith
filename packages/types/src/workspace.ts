interface Workspace {
    name: string;
    path: string;
    props: Record<string, any>;
    isDefault: boolean;
}

export {
    Workspace,
}