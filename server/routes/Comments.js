import express from "express";

import {
  postQuestionComment,
  deleteQuestionComment,
  postAnswerComment,
  deleteAnswerComment,
} from "../controllers/Comments.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.patch("/question/:id/post", auth, postQuestionComment);
router.patch("/question/:id/delete", auth, deleteQuestionComment);
router.patch("/answer/:id/:answerId/post", auth, postAnswerComment);
router.patch("/answer/:id/:answerId/delete", auth, deleteAnswerComment);

export default router;
