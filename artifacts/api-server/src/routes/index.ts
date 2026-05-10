import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import assignmentsRouter from "./assignments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(assignmentsRouter);

export default router;
