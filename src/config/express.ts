import bodyParser from "body-parser";
import express, { Application } from "express";
import corsMiddleware from "../app/middleware/cors.middleware"; // Use only one CORS import
import routes from "../app/routes/app.router"; // <-- NEW: Import the centralized router function
import { rootUrl } from "../app/routes/base.routes";
import Logger from "./logger";

export default () => {
    const app: Application = express();

    // Middleware
    // Removed the duplicate corsMiddleware line found in the compiled JS
    app.use(corsMiddleware);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: "text/plain" }));
    app.use(bodyParser.raw({ type: ["image/*"], limit: "5mb" }));

    // Debug
    app.use((req, res, next) => {
        if (req.path !== "/") {
            Logger.http(`##### ${req.method} ${req.path} #####`);
        }
        next();
    });

    app.get("/heartbeat", (req, res) => {
        res.send({ message: "I'm alive!" });
    });

    app.get(rootUrl + "/heartbeat", (req, res) => {
        res.send({ message: "I'm alive!" });
    });

    routes(app);

    return app;
};
