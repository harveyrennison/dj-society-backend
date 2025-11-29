import Logger from "../../config/logger";

export const returnUserData = (user: User, isAuthenticated: boolean) => {
    try {
        return isAuthenticated ? user : "You cannot view someone else's user information.";
    } catch (error) {
        Logger.error(`Error returning user data: ${error.message}`);
        throw new Error(`Failed to return user data: ${error.message}`);
    }
};
