import Questions from "../models/Questions.js";
import mongoose from "mongoose";

export const AskQuestion = async (req, res) => {
  const postQuestionData = req.body;
  const userId = req.userId;
  const postQuestion = new Questions({ ...postQuestionData, userId });
  try {
    await postQuestion.save();
    res.status(200).json("Posted a question successfully");
  } catch (error) {
    console.log(error);
    res.status(409).json("Couldn't post a new question");
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questionList = await Questions.find().sort({ askedOn: -1 });
    res.status(200).json(questionList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const searchQuestions = async (req, res) => {
  const { query, limit = 10, skip = 0 } = req.query;
  try {
    if (!query || query.trim() === "") {
      return res.status(200).json({ questions: [], total: 0 });
    }

    const searchQuery = query.trim();
    const skipNum = parseInt(skip) || 0;
    const limitNum = Math.min(parseInt(limit) || 10, 50); // Max 50 results

    const searchFilter = {
      $or: [
        { questionTitle: { $regex: searchQuery, $options: "i" } },
        { questionBody: { $regex: searchQuery, $options: "i" } },
        { questionTags: { $elemMatch: { $regex: searchQuery, $options: "i" } } },
      ],
    };

    const total = await Questions.countDocuments(searchFilter);
    const questionList = await Questions.find(searchFilter)
      .select("_id questionTitle questionBody questionTags noOfAnswers upVote downVote askedOn userPosted userId")
      .sort({ askedOn: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({ questions: questionList, total, limit: limitNum, skip: skipNum });
  } catch (error) {
    console.error("Search questions error:", error);
    res.status(500).json({ message: "Error searching questions", error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    await Questions.findByIdAndRemove(_id);
    res.status(200).json({ message: "successfully deleted..." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const voteQuestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    const question = await Questions.findById(_id);
    const upIndex = question.upVote.findIndex((id) => id === String(userId));
    const downIndex = question.downVote.findIndex(
      (id) => id === String(userId)
    );

    if (value === "upVote") {
      if (downIndex !== -1) {
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
      }
      if (upIndex === -1) {
        question.upVote.push(userId);
      } else {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
    } else if (value === "downVote") {
      if (upIndex !== -1) {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
      if (downIndex === -1) {
        question.downVote.push(userId);
      } else {
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
      }
    }
    await Questions.findByIdAndUpdate(_id, question);
    res.status(200).json({ message: "voted successfully..." });
  } catch (error) {
    res.status(404).json({ message: "id not found" });
  }
};
