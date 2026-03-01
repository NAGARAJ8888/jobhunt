import express from "express";
import {
  createChat,
  getChatsByUser,
  getMessagesByChat,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", createChat);
router.get("/user/:userId", getChatsByUser);
router.get("/:chatId/messages", getMessagesByChat);
router.post("/:chatId/messages", sendMessage);

export default router;
