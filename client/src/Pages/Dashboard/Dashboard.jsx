import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import "./Dashboard.css";

const ReputationBadge = ({ level, count }) => {
  const colors = { bronze: "#CD7F32", silver: "#C0C0C0", gold: "#FFD700" };
  return (
    <div className="rep-badge">
      <span className="badge-dot" style={{ backgroundColor: colors[level] }}>●</span>
      <span className="badge-level">{level}</span>
      <span className="badge-count">{count}</span>
    </div>
  );
};

const Dashboard = ({ slideIn, handleSlideIn }) => {
  const currentUser = useSelector((state) => state.currentUserReducer);
  const users = useSelector((state) => state.usersReducer);
  const questions = useSelector((state) => state.questionsReducer);
  
  const userProfile = users.find((u) => u._id === currentUser?.result?._id);
  const reputation = userProfile?.reputation || 1;
  const badges = userProfile?.badges || { bronze: [], silver: [], gold: [] };
  const watchedTags = userProfile?.tags || [];

  // Get interesting questions based on watched tags
  const allQuestions = questions.data || [];
  const suggestedQuestions = watchedTags.length > 0
    ? allQuestions.filter((q) =>
        Array.isArray(q.questionTags) &&
        q.questionTags.some((tag) => watchedTags.includes(tag))
      )
    : allQuestions.slice(0, 10);

  // Get user's own questions and answers
  const myQuestions = allQuestions.filter(
    (q) => q.userId === currentUser?.result?._id
  );
  const myAnswers = allQuestions.filter(
    (q) =>
      Array.isArray(q.answer) &&
      q.answer.some((a) => a.userId === currentUser?.result?._id)
  );

  // Reputation level
  const getRepLevel = (rep) => {
    if (rep >= 200) return { level: "Expert", color: "#FFD700" };
    if (rep >= 50) return { level: "Veteran", color: "#C0C0C0" };
    if (rep >= 10) return { level: "Enthusiast", color: "#CD7F32" };
    return { level: "Newcomer", color: "#6a737c" };
  };
  const repLevel = getRepLevel(reputation);

  if (!currentUser) {
    return (
      <div className="home-container-1">
        <LeftSidebar slideIn={slideIn} handleSlideIn={handleSlideIn} />
        <div className="home-container-2">
          <div className="dashboard-login-prompt">
            <h2>Please log in to view your dashboard</h2>
            <Link to="/Auth" className="dashboard-login-btn">Log in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container-1">
      <LeftSidebar slideIn={slideIn} handleSlideIn={handleSlideIn} />
      <div className="home-container-2">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <h1>My Dashboard</h1>
          </div>

          <div className="dashboard-grid">
            {/* Left column */}
            <div className="dashboard-left">
              {/* Reputation card */}
              <div className="dashboard-card reputation-card">
                <h3>Reputation</h3>
                <div className="reputation-score">
                  <span className="rep-number">{reputation}</span>
                  <span className="rep-level" style={{ color: repLevel.color }}>
                    {repLevel.level}
                  </span>
                </div>
                <div className="rep-progress-section">
                  <p className="rep-hint">
                    {reputation < 10
                      ? `${10 - reputation} more to Enthusiast`
                      : reputation < 50
                      ? `${50 - reputation} more to Veteran`
                      : reputation < 200
                      ? `${200 - reputation} more to Expert`
                      : "Maximum level reached!"}
                  </p>
                  <div className="rep-progress-bar">
                    <div
                      className="rep-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          reputation < 10
                            ? (reputation / 10) * 100
                            : reputation < 50
                            ? ((reputation - 10) / 40) * 100
                            : reputation < 200
                            ? ((reputation - 50) / 150) * 100
                            : 100
                        )}%`,
                        backgroundColor: repLevel.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges card */}
              <div className="dashboard-card badges-card">
                <h3>Badges</h3>
                <div className="badges-container">
                  <ReputationBadge level="gold" count={badges.gold?.length || 0} />
                  <ReputationBadge level="silver" count={badges.silver?.length || 0} />
                  <ReputationBadge level="bronze" count={badges.bronze?.length || 0} />
                </div>
                {(badges.bronze?.length > 0 || badges.silver?.length > 0 || badges.gold?.length > 0) && (
                  <div className="badge-list">
                    {badges.gold?.map((b, i) => (
                      <span key={`g${i}`} className="badge-chip gold">{b}</span>
                    ))}
                    {badges.silver?.map((b, i) => (
                      <span key={`s${i}`} className="badge-chip silver">{b}</span>
                    ))}
                    {badges.bronze?.map((b, i) => (
                      <span key={`b${i}`} className="badge-chip bronze">{b}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="dashboard-card stats-card">
                <h3>Activity Summary</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{myQuestions.length}</span>
                    <span className="stat-label">Questions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{myAnswers.length}</span>
                    <span className="stat-label">Answers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{watchedTags.length}</span>
                    <span className="stat-label">Tags Watched</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{reputation}</span>
                    <span className="stat-label">Reputation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="dashboard-right">
              {/* Watched Tags */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Watched Tags</h3>
                  <Link to={`/Users/${currentUser?.result?._id}`} className="edit-link">Edit</Link>
                </div>
                {watchedTags.length === 0 ? (
                  <p className="empty-message">
                    No watched tags. <Link to={`/Users/${currentUser?.result?._id}`}>Add some tags</Link> to personalize your feed.
                  </p>
                ) : (
                  <div className="tags-display">
                    {watchedTags.map((tag) => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interesting/Suggested Questions */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>
                    {watchedTags.length > 0 ? "Questions for You" : "Latest Questions"}
                  </h3>
                </div>
                {suggestedQuestions.length === 0 ? (
                  <p className="empty-message">No questions found. Try watching some tags!</p>
                ) : (
                  <div className="suggested-questions">
                    {suggestedQuestions.slice(0, 10).map((q) => (
                      <div key={q._id} className="suggested-question-item">
                        <div className="sq-stats">
                          <span className={`sq-answers ${q.noOfAnswers > 0 ? (q.acceptedAnswer ? "sq-answered" : "sq-has-answers") : ""}`}>
                            {q.noOfAnswers} ans
                          </span>
                          <span className="sq-votes">
                            {(q.upVote?.length || 0) - (q.downVote?.length || 0)} votes
                          </span>
                        </div>
                        <div className="sq-content">
                          <Link to={`/Questions/${q._id}`} className="sq-title">
                            {q.questionTitle}
                          </Link>
                          <div className="sq-tags">
                            {(Array.isArray(q.questionTags) ? q.questionTags : []).slice(0, 3).map((tag) => (
                              <span key={tag} className="tag-badge">{tag}</span>
                            ))}
                          </div>
                          <span className="sq-time">asked {moment(q.askedOn).fromNow()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Recent Questions */}
              {myQuestions.length > 0 && (
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>My Recent Questions</h3>
                  </div>
                  <div className="suggested-questions">
                    {myQuestions.slice(0, 5).map((q) => (
                      <div key={q._id} className="suggested-question-item">
                        <div className="sq-stats">
                          <span className={`sq-answers ${q.noOfAnswers > 0 ? "sq-has-answers" : ""}`}>
                            {q.noOfAnswers} ans
                          </span>
                        </div>
                        <div className="sq-content">
                          <Link to={`/Questions/${q._id}`} className="sq-title">
                            {q.questionTitle}
                          </Link>
                          <span className="sq-time">{moment(q.askedOn).fromNow()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
