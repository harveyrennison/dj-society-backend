import { Router } from "express";
import * as backdoor from "../controllers/backdoor.controller";

const router = Router();

router.post("/reset", backdoor.resetDb);
router.post("/resample", backdoor.resample);
router.post("/reload", backdoor.reload);
router.post("/executeSql", backdoor.executeSql);

export default router;
