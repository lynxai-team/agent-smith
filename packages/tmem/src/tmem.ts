import localforage from "localforage";
import { Tmem } from "./tmeminterfaces.js";

const localForage = localforage;
const useTmem = <S extends Record<string, any> = Record<string, any>>(
    name: string, initial: S, verbose = false
): Tmem<S> => {
    const db = localForage.createInstance({
        name: "tmem",
        driver: localForage.INDEXEDDB,
        storeName: name,
    });

    const init = async () => {
        await db.ready();
        // fill initial data
        if ((await keys()).length == 0) {
            if (verbose) {
                console.log(`Tmem: setting initial data for store ${name}`)
            }
            for (const [k, v] of Object.entries(initial)) {
                set(k, v)
            }
        }
    };

    const set = async <T extends keyof S>(k: T, v: S[T]) => {
        await db.ready();
        await db.setItem<S[T]>(k as string, v);
    };

    const get = async <T extends keyof S>(k: T): Promise<S[T]> => {
        await db.ready();
        const v = await db.getItem<T>(k as string);
        if (v === null) {
            throw new Error(`Key ${k as string} not found`)
        }
        return v as S[T]
    };

    const del = async <T extends keyof S>(k: T) => {
        await db.ready();
        await db.removeItem(k as string);
    };

    const keys = async (): Promise<Array<string>> => {
        await db.ready();
        return await db.keys();
    };

    const all = async <T = any>(): Promise<Record<string, T>> => {
        await db.ready();
        const _t: Record<string, any> = {};
        await db.iterate((v, k, i) => {
            _t[k] = v
        });
        return _t as Record<string, T>
    }

    return {
        db,
        init,
        set,
        get,
        del,
        keys,
        all,
    } as Tmem<S>
}

export { useTmem }