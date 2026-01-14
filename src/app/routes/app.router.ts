import { Application } from "express";
import backdoorRouter from "./backdoor.routes";
import { rootUrl } from "./base.routes";
import djRouter from "./dj.routes";
import genreRouter from "./genre.routes";
import userRouter from "./user.routes";

/**
 * Central function to load all application routes.
 * @param app - The Express application instance.
 */
const routes = (app: Application) => {
    app.use(rootUrl, backdoorRouter);
    app.use(rootUrl + "/users", userRouter);
    app.use(rootUrl + "/profile", djRouter);
    app.use(rootUrl + "/genres", genreRouter);
};

export default routes;
