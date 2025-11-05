import dotenv from "dotenv";
import * as fs from "fs";
import mysql from "mysql2/promise";
import Logger from "./logger";

dotenv.config();
// technically typed : {pool: mysql.Pool}
const state: any = {
    pool: null
};

const connect = async (): Promise<void> => {
    try {
        state.pool = mysql.createPool( {
            connectionLimit: 100,
            multipleStatements: true,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            database: process.env.DB_DATABASE,
            ssl: {
                ca: fs.readFileSync("./ca.pem").toString(),
                rejectUnauthorized: true
            }
        } );
        const conn = await state.pool.getConnection();
        conn.release();
        Logger.info(`Successfully connected to database`);
    } catch (err: any) {
        Logger.error(`DB connection failed: ${err?.code || ""} ${err?.message || err}`);
        throw err;
    }
};

// technically typed : () => mysql.Pool
const getPool = () => {
    return state.pool;
};

export {connect, getPool};
