import bcrypt from "bcrypt";

const hash = async (password: string): Promise<string> => {
    // todo: password hashing and comparing are left to you
    if (!password) { throw new Error("Password is required for hashing"); }
    return await bcrypt.hash(password, 10);
};

const compare = async (password: string, comp: string): Promise<boolean> => {
    // todo: password hashing and comparing are left to you
    if (!password) { throw new Error("Password is required for hashing"); }
    return await bcrypt.compare(password, comp);
};

export {hash, compare};
