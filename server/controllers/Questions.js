import Questions from "../models/Questions.js";
import Users from "../models/auth.js";
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

const updateReputation = async (userId, delta) => {
  if (!userId || delta === 0) return;
  try {
    await Users.findByIdAndUpdate(userId, { $inc: { reputation: delta } });
  } catch (error) {
    console.error("Reputation update error:", error);
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
    if (!question) {
      return res.status(404).json({ message: "question not found" });
    }

    question.upVote = Array.isArray(question.upVote) ? question.upVote : [];
    question.downVote = Array.isArray(question.downVote) ? question.downVote : [];

    const normalizedValue = String(value || "").toLowerCase();
    if (!["upvote", "downvote"].includes(normalizedValue)) {
      return res.status(400).json({ message: "invalid vote value" });
    }

    const upIndex = question.upVote.findIndex((id) => id === String(userId));
    const downIndex = question.downVote.findIndex(
      (id) => id === String(userId)
    );

    let repDelta = 0;

    if (normalizedValue === "upvote") {
      if (downIndex !== -1) {
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
        repDelta += 2; // undo downvote penalty
      }
      if (upIndex === -1) {
        question.upVote.push(userId);
        repDelta += 5; // question upvote
      } else {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
        repDelta -= 5; // undo upvote
      }
    } else if (normalizedValue === "downvote") {
      if (upIndex !== -1) {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
        repDelta -= 5; // undo upvote
      }
      if (downIndex === -1) {
        question.downVote.push(userId);
        repDelta -= 2; // downvote penalty
      } else {
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
        repDelta += 2; // undo downvote
      }
    }

    await question.save();
    await updateReputation(question.userId, repDelta);
    res.status(200).json({
      message: "voted successfully...",
      upVoteCount: question.upVote.length,
      downVoteCount: question.downVote.length,
    });
  } catch (error) {
    res.status(404).json({ message: "id not found" });
  }
};

export const voteAnswer = async (req, res) => {
  const { id: _id, answerId } = req.params;
  const { value } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    const question = await Questions.findById(_id);
    if (!question) {
      return res.status(404).json({ message: "question not found" });
    }

    const normalizedValue = String(value || "").toLowerCase();
    if (!["upvote", "downvote"].includes(normalizedValue)) {
      return res.status(400).json({ message: "invalid vote value" });
    }

    const answerIndex = question.answer.findIndex(
      (a) => a._id.toString() === answerId
    );

    if (answerIndex === -1) {
      return res.status(404).json({ message: "answer not found" });
    }

    const answer = question.answer[answerIndex];
    answer.upVote = Array.isArray(answer.upVote) ? answer.upVote : [];
    answer.downVote = Array.isArray(answer.downVote) ? answer.downVote : [];
    const upIndex = answer.upVote.findIndex((id) => id === String(userId));
    const downIndex = answer.downVote.findIndex((id) => id === String(userId));

    let repDelta = 0;

    if (normalizedValue === "upvote") {
      if (downIndex !== -1) {
        answer.downVote = answer.downVote.filter((id) => id !== String(userId));
        repDelta += 2;
      }
      if (upIndex === -1) {
        answer.upVote.push(userId);
        repDelta += 10; // answer upvote
      } else {
        answer.upVote = answer.upVote.filter((id) => id !== String(userId));
        repDelta -= 10;
      }
    } else if (normalizedValue === "downvote") {
      if (upIndex !== -1) {
        answer.upVote = answer.upVote.filter((id) => id !== String(userId));
        repDelta -= 10;
      }
      if (downIndex === -1) {
        answer.downVote.push(userId);
        repDelta -= 2;
      } else {
        answer.downVote = answer.downVote.filter((id) => id !== String(userId));
        repDelta += 2;
      }
    }

    question.answer[answerIndex] = answer;
    await question.save();
    await updateReputation(answer.userId, repDelta);
    res.status(200).json({
      message: "voted successfully...",
      upVoteCount: answer.upVote.length,
      downVoteCount: answer.downVote.length,
    });
  } catch (error) {
    res.status(404).json({ message: "id not found" });
  }
};

export const acceptAnswer = async (req, res) => {
  const { id: _id, answerId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    const question = await Questions.findById(_id);

    if (question.userId !== String(userId)) {
      return res.status(403).json({ message: "Only question owner can accept an answer" });
    }

    const answerIndex = question.answer.findIndex(
      (a) => a._id.toString() === answerId
    );

    if (answerIndex === -1) {
      return res.status(404).json({ message: "answer not found" });
    }

    const wasAccepted = question.answer[answerIndex].isAccepted;

    // Toggle acceptance and clear others
    question.answer.forEach((a, i) => {
      a.isAccepted = i === answerIndex ? !wasAccepted : false;
    });

    await question.save();

    // +15 reputation for accepted answer, -15 for unaccepted
    const answerAuthorId = question.answer[answerIndex].userId;
    await updateReputation(answerAuthorId, wasAccepted ? -15 : 15);

    res.status(200).json({ message: "answer acceptance updated" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
