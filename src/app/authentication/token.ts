import crypto from "crypto";

const createToken = (): string => {
    return crypto.randomBytes(32).toString("base64");
};

export {createToken};
