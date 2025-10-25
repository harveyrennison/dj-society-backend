import Logger from "../../config/logger";

interface PublicUser {
    firstName: string;
    lastName: string;
    username: string;
}

interface AuthenticatedUser extends PublicUser {
    email: string;
}

export const publicUser = (user: User): PublicUser => {
    try {
        if (!user || !user.first_name || !user.last_name || !user.username) {
            throw new Error("Invalid user data");
        }

        return {
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username
        };
    } catch (error) {
        Logger.error(`Error transforming user to public format: ${error.message}`);
        throw new Error(`Failed to transform user to public format: ${error.message}`);
    }
};

export const authenticatedUser = (user: User): AuthenticatedUser => {
    try {
        if (!user || !user.first_name || !user.last_name || !user.email) {
            throw new Error("Invalid user data");
        }

        return {
            ...publicUser(user),
            email: user.email
        };
    } catch (error) {
        Logger.error(`Error transforming user to authenticated format: ${error.message}`);
        throw new Error(`Failed to transform user to authenticated format: ${error.message}`);
    }
};

export const returnUserData = (user: User, isAuthenticated: boolean): PublicUser | AuthenticatedUser => {
    try {
        return isAuthenticated ? authenticatedUser(user) : publicUser(user);
    } catch (error) {
        Logger.error(`Error returning user data: ${error.message}`);
        throw new Error(`Failed to return user data: ${error.message}`);
    }
};
