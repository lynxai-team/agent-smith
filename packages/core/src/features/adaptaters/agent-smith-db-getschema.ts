import { dbPath } from "../../conf.js";
// @ts-ignore
import DatabaseConstructor from "better-sqlite3";

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("SCH ARGS", args);
    //console.log("SCH OPTS", options);

    if (args.length < 1) {
        throw new Error("agent-smith-db-getschema: provide a prompt argument");
    }
    const db = new DatabaseConstructor(dbPath, { fileMustExist: true, readonly: true });
    const prompt = args.prompt;

    // Get the schema information as SQL CREATE TABLE statements
    const schema = [];
    // Get all table names
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

    for (const table of tables) {
        const tableName = table.name;
        const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const indexes = db.prepare(`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${tableName}'`).all();

        // Generate CREATE TABLE statement
        let createTableSQL = `CREATE TABLE ${tableName} (\n`;
        // @ts-ignore
        const columns = tableInfo.map(col => {
            let columnDef = `  ${col.name} ${col.type}`;
            if (col.notnull) {
                columnDef += " NOT NULL";
            }
            if (col.dflt_value !== null) {
                columnDef += ` DEFAULT ${col.dflt_value}`;
            }
            if (col.pk) {
                columnDef += " PRIMARY KEY";
            }
            return columnDef;
        });
        createTableSQL += columns.join(",\n");
        createTableSQL += "\n);";

        // Add indexes
        //@ts-ignore
        const indexSQL = indexes.map(index => index.sql).join("\n");
        if (tableName != "sqlite_sequence") {
            schema.push({
                tableName,
                createTableSQL,
                indexes: indexSQL
            });
        }
    }

    db.close();

    // Return only the SQL schema string
    let sqlSchema = "";
    for (const table of schema) {
        sqlSchema += table.createTableSQL + "\n\n";
        if (table.indexes) {
            sqlSchema += table.indexes + ";\n\n";
        }
    }
    options.variables.schema = sqlSchema.trim();
    options.variables.dbpath = dbPath;
    return { prompt: prompt };
}

export {
    action,
};