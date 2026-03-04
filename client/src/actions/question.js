import * as api from "../api/index";

export const askQuestion = (questionData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.postQuestion(questionData);
    dispatch({ type: "POST_QUESTION", payload: data });
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllQuestions = () => async (disptach) => {
  try {
    const { data } = await api.getAllQuestions();
    disptach({ type: "FETCH_ALL_QUESTIONS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuestion = (id, navigate) => async (dispatch) => {
  try {
    await api.deleteQuestion(id);
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const voteQuestion = (id, value) => async (dispatch) => {
  try {
    await api.voteQuestion(id, value);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postAnswer = (answerData) => async (dispatch) => {
  try {
    const { id, noOfAnswers, answerBody, userAnswered } = answerData;
    const { data } = await api.postAnswer(
      id,
      noOfAnswers,
      answerBody,
      userAnswered
    );
    dispatch({ type: "POST_ANSWER", payload: data });
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = (id, answerId, noOfAnswers) => async (dispatch) => {
  try {
    await api.deleteAnswer(id, answerId, noOfAnswers);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const voteAnswer = (id, answerId, value) => async (dispatch) => {
  try {
    await api.voteAnswer(id, answerId, value);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const acceptAnswer = (id, answerId) => async (dispatch) => {
  try {
    await api.acceptAnswer(id, answerId);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postQuestionComment = (commentData) => async (dispatch) => {
  try {
    const { id, commentBody, userCommented } = commentData;
    await api.postQuestionComment(id, commentBody, userCommented);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuestionComment = (id, commentId) => async (dispatch) => {
  try {
    await api.deleteQuestionComment(id, commentId);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postAnswerComment = (commentData) => async (dispatch) => {
  try {
    const { id, answerId, commentBody, userCommented } = commentData;
    await api.postAnswerComment(id, answerId, commentBody, userCommented);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswerComment = (id, answerId, commentId) => async (dispatch) => {
  try {
    await api.deleteAnswerComment(id, answerId, commentId);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};
