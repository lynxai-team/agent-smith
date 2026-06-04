// @ts-ignore
import DatabaseConstructor from "better-sqlite3";
import { schemas } from "./schemas.js";
import { createDirectoryIfNotExists } from "../utils/sys/dirs.js";
import { confDir, dbPath } from "../conf.js";

let db: any;
const debugDb = false;

function initDb(isVerbose: boolean, execSchema: boolean) {
    //console.log("DBP", dbPath);
    if (execSchema) {
        createDirectoryIfNotExists(confDir, true);
        db = new DatabaseConstructor(dbPath, { fileMustExist: false, verbose: debugDb ? console.log : undefined });
        schemas.forEach((s) => {
            db.exec(s);
            if (isVerbose) {
                console.log(`Schema executed: ${s}`)
            }
        });
    } else {
        db = new DatabaseConstructor(dbPath, { fileMustExist: true });
    }
}

export {
    db,
    initDb,
}