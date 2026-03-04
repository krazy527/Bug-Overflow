import React, { useState } from "react";
import moment from "moment";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import upvote from "../../assets/sort-up.svg";
import downvote from "../../assets/sort-down.svg";
import Avatar from "../../components/Avatar/Avatar";
import { deleteAnswer, voteAnswer, acceptAnswer, postAnswerComment, deleteAnswerComment } from "../../actions/question";

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

const DisplayAnswer = ({ question, handleShare }) => {
  const User = useSelector((state) => state.currentUserReducer);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = (answerId, noOfAnswers) => {
    dispatch(deleteAnswer(id, answerId, noOfAnswers - 1));
  };

  const handleUpVote = (answerId) => {
    if (!User) {
      alert("Login or Signup to vote");
      navigate("/Auth");
    } else {
      dispatch(voteAnswer(id, answerId, "upVote"));
    }
  };

  const handleDownVote = (answerId) => {
    if (!User) {
      alert("Login or Signup to vote");
      navigate("/Auth");
    } else {
      dispatch(voteAnswer(id, answerId, "downVote"));
    }
  };

  const handleAcceptAnswer = (answerId) => {
    dispatch(acceptAnswer(id, answerId));
  };

  const handleAddAnswerComment = (answerId, commentBody) => {
    if (!User) {
      alert("Login or Signup to comment");
      navigate("/Auth");
      return;
    }
    dispatch(postAnswerComment({ id, answerId, commentBody, userCommented: User.result.name }));
  };

  const handleDeleteAnswerComment = (answerId, commentId) => {
    dispatch(deleteAnswerComment(id, answerId, commentId));
  };

  return (
    <div>
      {question.answer.map((ans) => (
        <div className="display-ans" key={ans._id}>
          <div className="ans-votes-container">
            <div className="answer-votes">
              <img
                src={upvote}
                alt="upvote"
                width="18"
                className="votes-icon"
                onClick={() => handleUpVote(ans._id)}
              />
              <p>{(ans.upVote?.length || 0) - (ans.downVote?.length || 0)}</p>
              <img
                src={downvote}
                alt="downvote"
                width="18"
                className="votes-icon"
                onClick={() => handleDownVote(ans._id)}
              />
              {User?.result?._id === question?.userId && (
                <button
                  type="button"
                  className={`accept-btn ${ans.isAccepted ? "accepted" : ""}`}
                  onClick={() => handleAcceptAnswer(ans._id)}
                  title={ans.isAccepted ? "Accepted answer" : "Accept this answer"}
                >
                  ✓
                </button>
              )}
              {ans.isAccepted && User?.result?._id !== question?.userId && (
                <span className="accepted-badge" title="Accepted answer">✓</span>
              )}
            </div>
          </div>
          <div style={{ width: "100%" }}>
            <div
              className="answer-body"
              dangerouslySetInnerHTML={{ __html: ans.answerBody }}
            ></div>
            <div className="question-actions-user">
              <div>
                <button type="button" onClick={handleShare}>
                  Share
                </button>
                {User?.result?._id === ans?.userId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(ans._id, question.noOfAnswers)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div>
                <p>answered {moment(ans.answeredOn).fromNow()}</p>
                <Link
                  to={`/Users/${ans.userId}`}
                  className="user-link"
                  style={{ color: "#0086d8" }}
                >
                  <Avatar
                    backgroundColor="lightgreen"
                    px="8px"
                    py="5px"
                    borderRadius="4px"
                  >
                    {ans.userAnswered.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>{ans.userAnswered}</div>
                </Link>
              </div>
            </div>
            <CommentSection
              comments={ans.comments || []}
              onAddComment={(commentBody) => handleAddAnswerComment(ans._id, commentBody)}
              onDeleteComment={(commentId) => handleDeleteAnswerComment(ans._id, commentId)}
              currentUser={User}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayAnswer;
