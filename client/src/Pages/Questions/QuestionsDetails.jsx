import React, { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import copy from "copy-to-clipboard";

import upvote from "../../assets/sort-up.svg";
import downvote from "../../assets/sort-down.svg";
import "./Questions.css";
import Avatar from "../../components/Avatar/Avatar";
import DisplayAnswer from "./DisplayAnswer";
import TextEditor from "../../components/TextEditor/TextEditor";
import {
  postAnswer,
  deleteQuestion,
  voteQuestion,
  postQuestionComment,
  deleteQuestionComment,
} from "../../actions/question";

const CommentSection = ({ comments, onAddComment, onDeleteComment, currentUser }) => {
  const [commentText, setCommentText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText("");
      setShowForm(false);
    }
  };

  return (
    <div className="comment-section">
      {comments && comments.length > 0 && (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <span className="comment-body">{comment.commentBody}</span>
              <span className="comment-meta">
                {" – "}
                <Link to={`/Users/${comment.userId}`} className="comment-user">
                  {comment.userCommented}
                </Link>
                {" "}
                <span className="comment-time">{moment(comment.commentedOn).fromNow()}</span>
                {currentUser?.result?._id === comment.userId && (
                  <button
                    type="button"
                    className="comment-delete-btn"
                    onClick={() => onDeleteComment(comment._id)}
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      {showForm ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
            maxLength={600}
          />
          <button type="submit" className="comment-submit-btn">Add Comment</button>
          <button type="button" className="comment-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      ) : (
        currentUser && (
          <button type="button" className="add-comment-btn" onClick={() => setShowForm(true)}>
            Add a comment
          </button>
        )
      )}
    </div>
  );
};

const QuestionsDetails = () => {
  const { id } = useParams();
  const questionsList = useSelector((state) => state.questionsReducer);

  const [Answer, setAnswer] = useState("");
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const User = useSelector((state) => state.currentUserReducer);
  const location = useLocation();
  const url = "http://localhost:3000";

  const handlePostAns = (e, answerLength) => {
    e.preventDefault();
    if (User === null) {
      alert("Login or Signup to answer a question");
      Navigate("/Auth");
    } else {
      const plainTextAnswer = Answer.replace(/<[^>]*>/g, "");
      if (plainTextAnswer.trim() === "") {
        alert("Enter an answer before submitting");
      } else {
        dispatch(
          postAnswer({
            id,
            noOfAnswers: answerLength + 1,
            answerBody: Answer,
            userAnswered: User.result.name,
          })
        );
        setAnswer("");
      }
    }
  };

  const handleShare = () => {
    copy(url + location.pathname);
    alert("Copied url : " + url + location.pathname);
  };

  const handleDelete = () => {
    dispatch(deleteQuestion(id, Navigate));
  };

  const handleUpVote = () => {
    if (User === null) {
      alert("Login or Signup to up vote a question");
      Navigate("/Auth");
    } else {
      dispatch(voteQuestion(id, "upVote"));
    }
  };

  const handleDownVote = () => {
    if (User === null) {
      alert("Login or Signup to down vote a question");
      Navigate("/Auth");
    } else {
      dispatch(voteQuestion(id, "downVote"));
    }
  };

  const handleAddQuestionComment = (commentBody, question) => {
    if (User === null) {
      alert("Login or Signup to comment");
      Navigate("/Auth");
      return;
    }
    dispatch(postQuestionComment({ id: question._id, commentBody, userCommented: User.result.name }));
  };

  const handleDeleteQuestionComment = (question, commentId) => {
    dispatch(deleteQuestionComment(question._id, commentId));
  };

  return (
    <div className="question-details-page">
      {questionsList.data === null ? (
        <h1>Loading...</h1>
      ) : (
        <>
          {questionsList.data
            .filter((question) => question._id === id)
            .map((question) => (
              <div key={question._id}>
                <section className="question-details-container">
                  <h1>{question.questionTitle}</h1>
                  <div className="question-details-container-2">
                    <div className="question-votes">
                      <img
                        src={upvote}
                        alt=""
                        width="18"
                        className="votes-icon"
                        onClick={handleUpVote}
                      />
                      <p>{question.upVote.length - question.downVote.length}</p>
                      <img
                        src={downvote}
                        alt=""
                        width="18"
                        className="votes-icon"
                        onClick={handleDownVote}
                      />
                    </div>
                    <div style={{ width: "100%" }}>
                      <div
                        className="question-body"
                        dangerouslySetInnerHTML={{ __html: question.questionBody }}
                      ></div>
                      <div className="question-details-tags">
                        {(Array.isArray(question.questionTags)
                          ? question.questionTags
                          : question.questionTags
                              .toString()
                              .split(" ")
                        ).map((tag) => (
                          <span key={tag} className="tag-badge">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="question-actions-user">
                        <div>
                          <button type="button" onClick={handleShare}>
                            Share
                          </button>
                          {User?.result?._id === question?.userId && (
                            <button type="button" onClick={handleDelete}>
                              Delete
                            </button>
                          )}
                        </div>
                        <div>
                          <p>asked {moment(question.askedOn).fromNow()}</p>
                          <Link
                            to={`/Users/${question.userId}`}
                            className="user-link"
                            style={{ color: "#0086d8" }}
                          >
                            <Avatar
                              backgroundColor="orange"
                              px="8px"
                              py="5px"
                              borderRadius="4px"
                            >
                              {question.userPosted.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>{question.userPosted}</div>
                          </Link>
                        </div>
                      </div>
                      <CommentSection
                        comments={question.comments || []}
                        onAddComment={(commentBody) => handleAddQuestionComment(commentBody, question)}
                        onDeleteComment={(commentId) => handleDeleteQuestionComment(question, commentId)}
                        currentUser={User}
                      />
                    </div>
                  </div>
                </section>
                {question.noOfAnswers !== 0 && (
                  <section>
                    <h3>{question.noOfAnswers} Answers</h3>
                    <DisplayAnswer
                      key={question._id}
                      question={question}
                      handleShare={handleShare}
                    />
                  </section>
                )}
                <section className="post-ans-container">
                  <h3>Your Answer</h3>
                  <form
                    onSubmit={(e) => {
                      handlePostAns(e, question.answer.length);
                    }}
                  >
                    <TextEditor
                      value={Answer}
                      onChange={setAnswer}
                      placeholder="Write your answer here. Include relevant code snippets, explanations, and any helpful resources..."
                    />
                    <input
                      type="submit"
                      className="post-ans-btn"
                      value="Post Your Answer"
                    />
                  </form>
                  <p>
                    Browse other Question tagged
                    {(Array.isArray(question.questionTags)
                      ? question.questionTags
                      : question.questionTags.toString().split(" ")
                    ).map((tag) => (
                      <Link to="/Tags" key={tag} className="ans-tags tag-badge">
                        {tag}
                      </Link>
                    ))}
                    or
                    <Link
                      to="/AskQuestion"
                      style={{ textDecoration: "none", color: "#009dff" }}
                    >
                      ask your own question.
                    </Link>
                  </p>
                </section>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default QuestionsDetails;
