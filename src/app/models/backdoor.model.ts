import fs from "mz/fs";
import { getPool } from "../../config/db";
import { admin } from "../../config/firebase-admin";
import * as defaultUsers from "../resources/default_users.json";
import * as passwords from "../services/passwords";

const defaultPhotoDirectory = "./storage/default/";

import { ResultSetHeader, RowDataPacket } from "mysql2";
import Logger from "../../config/logger";
import { PROFILE_PICTURE_FOLDER } from "../types/constants";

const resetDb = async (): Promise<any> => {
    const promises = [];

    const sql = await fs.readFile(
        "src/app/resources/create_database.sql",
        "utf8",
    );
    Logger.info("Resetting Database...");
    promises.push(getPool().query(sql)); // sync call to recreate DB

    // Delete all files from Firebase Storage profile-pictures folder
    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({
            prefix: PROFILE_PICTURE_FOLDER,
        });
        const deletePromises = files.map((file) => file.delete());
        promises.push(...deletePromises);
        Logger.info(`Deleting ${files.length} files from Firebase Storage`);
    } catch (err) {
        Logger.error(`Error deleting files from Firebase Storage: ${err}`);
    }

    return Promise.all(promises); // async wait for DB recreation and images to be deleted
};

const loadData = async (): Promise<any> => {
    await populateDefaultUsers();
    try {
        const sql = await fs.readFile(
            "src/app/resources/resample_database.sql",
            "utf8",
        );
        await getPool().query(sql);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }

    // Upload default photos to Firebase Storage
    const defaultPhotos = await fs.readdir(defaultPhotoDirectory);
    const bucket = admin.storage().bucket();
    const promises = defaultPhotos.map(async (file: string) => {
        const localPath = defaultPhotoDirectory + file;
        const remotePath = `${PROFILE_PICTURE_FOLDER}/${file}`;

        const fileBuffer = await fs.readFile(localPath);
        const firebaseFile = bucket.file(remotePath);

        await firebaseFile.save(fileBuffer, {
            metadata: {
                contentType: file.endsWith(".png") ? "image/png" : "image/jpeg",
            },
        });

        // Make the file publicly accessible
        await firebaseFile.makePublic();

        Logger.info(`Uploaded ${file} to Firebase Storage`);
    });

    return Promise.all(promises);
};

/**
 * Populates the User table in the database with the given data. Must be done here instead of within the
 * `resample_database.sql` script because passwords must be hashed according to the particular implementation.
 * @returns {Promise<void>}
 */
const populateDefaultUsers = async (): Promise<void> => {
    const createSQL =
        "INSERT INTO `Users` (`userId`, `email`, `password`, `firebaseUid`, `firstName`, `lastName`, `dateOfBirth`) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)";

    const properties = defaultUsers.properties;
    let usersData = defaultUsers.usersData;

    // Shallow copy all the user arrays within the main data array
    // Ensures that the user arrays with hashed passwords won't persist across multiple calls to this function
    usersData = usersData.map((user: any) => [...user]);

    const passwordIndex = properties.indexOf("password");
    await Promise.all(
        usersData.map((user: any) => changePasswordToHash(user, passwordIndex)),
    );

    // Insert each user individually
    for (const user of usersData) {
        const values = [
            user[0], // userId (string UUID)
            user[1], // email
            user[2], // password (hashed)
            null, // firebaseUid
            null, // firstName
            null, // lastName
            null, // dateOfBirth
        ];
        try {
            await getPool().query(createSQL, values);
        } catch (err) {
            Logger.error(`Error inserting user ${user[1]}: ${err.sql}`);
            throw err;
        }
    }
};

async function changePasswordToHash(user: any, passwordIndex: number) {
    user[passwordIndex] = await passwords.hash(user[passwordIndex]);
}

const executeSql = async (
    sql: string,
): Promise<RowDataPacket[][] | RowDataPacket[] | ResultSetHeader> => {
    try {
        const [rows] = await getPool().query(sql);
        return rows;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export { executeSql, loadData, resetDb };
