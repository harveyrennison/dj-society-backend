"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnUserData = exports.authenticatedUser = exports.publicUser = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const publicUser = (user) => {
    try {
        if (!user || !user.first_name || !user.last_name) {
            throw new Error("Invalid user data");
        }
        return {
            firstName: user.first_name,
            lastName: user.last_name
        };
    }
    catch (error) {
        logger_1.default.error(`Error transforming user to public format: ${error.message}`);
        throw new Error(`Failed to transform user to public format: ${error.message}`);
    }
};
exports.publicUser = publicUser;
const authenticatedUser = (user) => {
    try {
        if (!user || !user.first_name || !user.last_name || !user.email) {
            throw new Error("Invalid user data");
        }
        return Object.assign(Object.assign({}, (0, exports.publicUser)(user)), { email: user.email });
    }
    catch (error) {
        logger_1.default.error(`Error transforming user to authenticated format: ${error.message}`);
        throw new Error(`Failed to transform user to authenticated format: ${error.message}`);
    }
};
exports.authenticatedUser = authenticatedUser;
const returnUserData = (user, isAuthenticated) => {
    try {
        return isAuthenticated ? (0, exports.authenticatedUser)(user) : (0, exports.publicUser)(user);
    }
    catch (error) {
        logger_1.default.error(`Error returning user data: ${error.message}`);
        throw new Error(`Failed to return user data: ${error.message}`);
    }
};
exports.returnUserData = returnUserData;
//# sourceMappingURL=user.transformer.js.map