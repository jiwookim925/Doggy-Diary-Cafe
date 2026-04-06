import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import timelineRouter from "./timeline";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(commentsRouter);
router.use(timelineRouter);
router.use(profileRouter);

export default router;
