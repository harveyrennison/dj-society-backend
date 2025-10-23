"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const user = __importStar(require("../controllers/user.controller"));
const userImages = __importStar(require("../controllers/user.image.controller"));
const base_routes_1 = require("./base.routes");
module.exports = (app) => {
    app.route(base_routes_1.rootUrl + "/users/register")
        .post(user.register);
    app.route(base_routes_1.rootUrl + "/users/login")
        .post(user.login);
    app.route(base_routes_1.rootUrl + "/users/logout")
        .post(user.logout);
    app.route(base_routes_1.rootUrl + "/users/:id")
        .get(user.view)
        .patch(user.update);
    app.route(base_routes_1.rootUrl + "/users/:id/image")
        .get(userImages.getImage)
        .put(userImages.setImage)
        .delete(userImages.deleteImage);
};
//# sourceMappingURL=user.routes.js.map