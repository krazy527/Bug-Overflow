import mongoose from "mongoose";
import Questions from "../models/Questions.js";

export const postQuestionComment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentBody, userCommented } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    const updatedQuestion = await Questions.findByIdAndUpdate(
      _id,
      { $push: { comments: { commentBody, userCommented, userId } } },
      { new: true }
    );
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuestionComment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question unavailable...");
  }

  try {
    await Questions.updateOne({ _id }, { $pull: { comments: { _id: commentId } } });
    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};

export const postAnswerComment = async (req, res) => {
  const { id: _id, answerId } = req.params;
  const { commentBody, userCommented } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  try {
    const updatedQuestion = await Questions.findOneAndUpdate(
      { _id, "answer._id": answerId },
      { $push: { "answer.$.comments": { commentBody, userCommented, userId } } },
      { new: true }
    );
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAnswerComment = async (req, res) => {
  const { id: _id, answerId } = req.params;
  const { commentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question unavailable...");
  }

  try {
    await Questions.updateOne(
      { _id, "answer._id": answerId },
      { $pull: { "answer.$.comments": { _id: commentId } } }
    );
    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};
