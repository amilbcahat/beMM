import express from "express";
import authRoutes from "./auth.routes.js";
import ConversationRoutes from "./conversation.routes.js";
import MessageRoutes from "./message.routes.js";
import UserRoutes from "./user.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/conversation", ConversationRoutes);
router.use("/message", MessageRoutes);
router.use("/user", UserRoutes);
export default router;
