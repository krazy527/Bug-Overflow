import express from "express";

import { login, signup } from "../controllers/auth.js";
import { getAllUsers, updateProfile, searchUsers, searchTags, getReputation } from "../controllers/users.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/getAllUsers", getAllUsers);
router.get("/search", searchUsers);
router.get("/tags/search", searchTags);
router.get("/reputation/:id", getReputation);
router.patch("/update/:id", auth, updateProfile);

export default router;
