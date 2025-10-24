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
    await state.pool.getConnection(); // Check connection
    Logger.info(`Successfully connected to database`);
    return;
};

// technically typed : () => mysql.Pool
const getPool = () => {
    return state.pool;
};

export {connect, getPool};
