import mongoose from "mongoose";
import Users from "../models/auth.js";
import Questions from "../models/Questions.js";

// GET /bookmarks
export const getBookmarks = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await Users.findById(userId).select("bookmarks").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const bookmarkedQuestions = await Questions.find({
      _id: { $in: user.bookmarks },
    }).lean();

    res.status(200).json(bookmarkedQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /bookmarks/add  body: { questionId }
export const addBookmark = async (req, res) => {
  const userId = req.userId;
  const { questionId } = req.body;

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Valid questionId is required" });
  }

  try {
    const question = await Questions.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Users.findByIdAndUpdate(userId, {
      $addToSet: { bookmarks: questionId },
    });
    res.status(200).json({ message: "Bookmark added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /bookmarks/remove  body: { questionId }
export const removeBookmark = async (req, res) => {
  const userId = req.userId;
  const { questionId } = req.body;

  if (!questionId) {
    return res.status(400).json({ message: "questionId is required" });
  }

  try {
    await Users.findByIdAndUpdate(userId, {
      $pull: { bookmarks: questionId },
    });
    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
