import express from "express";

import { login, signup } from "../controllers/auth.js";
import { getAllUsers, updateProfile, searchUsers, searchTags } from "../controllers/users.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/getAllUsers", getAllUsers);
router.get("/search", searchUsers); // Search with pagination support
router.get("/tags/search", searchTags); // Search tags from both questions and users
router.patch("/update/:id", auth, updateProfile);

export default router;
