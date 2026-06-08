import 'localforage';
interface Tmem<S extends Record<string, any>> {
    db: LocalForage;
    init: () => Promise<void>;
    set: <T extends keyof S>(k: T, v: S[T]) => Promise<void>;
    get: <T extends keyof S>(k: T) => Promise<S[T]>;
    del: <T extends keyof S>(k: T) => Promise<void>;
    keys: () => Promise<Array<string>>;
    all: <T = any>() => Promise<Record<string, T>>;
}

export {
    Tmem,
};