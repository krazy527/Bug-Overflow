import React, { useState, useEffect, useRef } from "react";
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
  incrementView,
  addQuestionComment,
  deleteQuestionComment,
} from "../../actions/question";
import { toggleBookmark, fetchBookmarks } from "../../actions/bookmarks";

const QuestionsDetails = () => {
  const { id } = useParams();
  const questionsList = useSelector((state) => state.questionsReducer);

  const [Answer, setAnswer] = useState("");
  const [questionCommentText, setQuestionCommentText] = useState("");
  const [showQuestionCommentForm, setShowQuestionCommentForm] = useState(false);
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const User = useSelector((state) => state.currentUserReducer);
  const bookmarks = useSelector((state) => state.bookmarksReducer);
  const location = useLocation();
  const url = "http://localhost:3000";
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      dispatch(incrementView(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (User?.token) {
      dispatch(fetchBookmarks());
    }
  }, [User, dispatch]);

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

  const handleAddQuestionComment = (e, question) => {
    e.preventDefault();
    if (!User) {
      alert("Login to comment");
      return;
    }
    if (questionCommentText.trim()) {
      dispatch(addQuestionComment(id, questionCommentText.trim(), User.result.name));
      setQuestionCommentText("");
      setShowQuestionCommentForm(false);
    }
  };

  const handleDeleteQuestionComment = (commentId) => {
    dispatch(deleteQuestionComment(id, commentId));
  };

  const handleBookmark = (question) => {
    if (!User) {
      alert("Login to bookmark questions");
      return;
    }
    const isBookmarked = bookmarks.data.some((q) => q._id === question._id);
    dispatch(toggleBookmark(question._id, isBookmarked));
  };

  return (
    <div className="question-details-page">
      {questionsList.data === null ? (
        <h1>Loading...</h1>
      ) : (
        <>
          {questionsList.data
            .filter((question) => question._id === id)
            .map((question) => {
              const isBookmarked = bookmarks.data.some((q) => q._id === question._id);
              return (
                <div key={question._id}>
                  <section className="question-details-container">
                    <div className="question-meta-stats">
                      <span>Asked {moment(question.askedOn).fromNow()}</span>
                      <span>Views {question.views || 0}</span>
                      <span>
                        Votes {question.upVote.length - question.downVote.length}
                      </span>
                      <span>Answers {question.noOfAnswers}</span>
                    </div>
                    <h1>
                      {question.questionTitle}
                      {question.acceptedAnswer && (
                        <span className="question-status-badge status-answered">Answered</span>
                      )}
                    </h1>
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
                            <button
                              type="button"
                              onClick={() => handleBookmark(question)}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                            >
                              {isBookmarked ? "🔖 Bookmarked" : "🔖 Bookmark"}
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
                        {/* Comments on question */}
                        {question.comments && question.comments.length > 0 && (
                          <div className="comments-section">
                            {question.comments.map((comment) => (
                              <div key={comment._id} className="comment-item">
                                <span className="comment-body">{comment.commentBody}</span>
                                <span className="comment-meta">
                                  – <Link to={`/Users/${comment.userId}`} style={{color:"#0086d8"}}>{comment.userCommented}</Link>{" "}
                                  {moment(comment.commentedOn).fromNow()}
                                </span>
                                {User?.result?._id === comment.userId && (
                                  <button
                                    type="button"
                                    className="comment-delete-btn"
                                    onClick={() => handleDeleteQuestionComment(comment._id)}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="add-comment-section">
                          {showQuestionCommentForm ? (
                            <form onSubmit={(e) => handleAddQuestionComment(e, question)} className="comment-form">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={questionCommentText}
                                onChange={(e) => setQuestionCommentText(e.target.value)}
                                className="comment-input"
                                maxLength={600}
                              />
                              <button type="submit" className="comment-submit-btn">Add Comment</button>
                              <button type="button" className="comment-cancel-btn" onClick={() => setShowQuestionCommentForm(false)}>Cancel</button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              className="add-comment-btn"
                              onClick={() => setShowQuestionCommentForm(true)}
                            >
                              Add a comment
                            </button>
                          )}
                        </div>
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
              );
            })}
        </>
      )}
    </div>
  );
};

export default QuestionsDetails;
