import express from "express";

import {
  AskQuestion,
  getAllQuestions,
  deleteQuestion,
  voteQuestion,
  voteAnswer,
  acceptAnswer,
  searchQuestions,
} from "../controllers/Questions.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/Ask", auth, AskQuestion);
router.get("/get", getAllQuestions);
router.get("/search", searchQuestions);
router.delete("/delete/:id", auth, deleteQuestion);
router.patch("/vote/:id", auth, voteQuestion);
router.patch("/vote/:id/:answerId", auth, voteAnswer);
router.patch("/accept/:id/:answerId", auth, acceptAnswer);

export default router;
