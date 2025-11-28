import crypto from "crypto";

export const createToken = (): string => {
    return crypto.randomBytes(32).toString("base64");
};
