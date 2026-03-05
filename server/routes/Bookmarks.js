import express from "express";
import { getBookmarks, addBookmark, removeBookmark } from "../controllers/Bookmarks.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getBookmarks);
router.post("/add", auth, addBookmark);
router.delete("/remove", auth, removeBookmark);

export default router;
