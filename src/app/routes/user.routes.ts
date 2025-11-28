import {Express} from "express";
import * as userController from "../controllers/user.controller";
// import * as userImages from "../controllers/user.image.controller";
import {rootUrl} from "./base.routes";

module.exports = (app: Express) => {
    app.route(rootUrl + "/users/register")
        .post(userController.register);

    app.route(rootUrl + "/users/login")
        .post(userController.login);

    app.route(rootUrl + "/users/logout")
        .post(userController.logout);

    app.route(rootUrl + "/users/:id")
        .get(userController.view);
    //     // .patch(user.update);

    // app.route(rootUrl + "/users/:id/image")
    //     .get(userImages.getProfileImage)
    //     .put(userImages.setProfileImage)
    //     .delete(userImages.deleteProfileImage);
};
