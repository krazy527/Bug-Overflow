import axios from "axios";

const API = axios.create({
  // baseURL: "https://bug-overflow-clone-server-ql8j.onrender.com/",
  baseURL: "http://localhost:5000/"
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("Profile")) {
    req.headers.authorization = `Bearer ${
      JSON.parse(localStorage.getItem("Profile")).token
    }`;
  }
  return req;
});

export const logIn = (authData) => API.post("/user/login", authData);
export const signUp = (authData) => API.post("/user/signup", authData);

export const postQuestion = (questionData) =>
  API.post("/questions/Ask", questionData);
export const getAllQuestions = () => API.get("/questions/get");
export const deleteQuestion = (id) => API.delete(`/questions/delete/${id}`);
export const voteQuestion = (id, value) =>
  API.patch(`/questions/vote/${id}`, { value });

export const postAnswer = (id, noOfAnswers, answerBody, userAnswered) =>
  API.patch(`/answer/post/${id}`, { noOfAnswers, answerBody, userAnswered });
export const deleteAnswer = (id, answerId, noOfAnswers) =>
  API.patch(`/answer/delete/${id}`, { answerId, noOfAnswers });

export const voteAnswer = (id, answerId, value) =>
  API.patch(`/questions/vote/${id}/${answerId}`, { value });
export const acceptAnswer = (id, answerId) =>
  API.patch(`/questions/accept/${id}/${answerId}`);

export const postQuestionComment = (id, commentBody, userCommented) =>
  API.patch(`/comments/question/${id}/post`, { commentBody, userCommented });
export const deleteQuestionComment = (id, commentId) =>
  API.patch(`/comments/question/${id}/delete`, { commentId });
export const postAnswerComment = (id, answerId, commentBody, userCommented) =>
  API.patch(`/comments/answer/${id}/${answerId}/post`, { commentBody, userCommented });
export const deleteAnswerComment = (id, answerId, commentId) =>
  API.patch(`/comments/answer/${id}/${answerId}/delete`, { commentId });
export const getAllUsers = () => API.get("/user/getAllUsers");
export const searchUsers = (query, limit = 10, skip = 0) =>
  API.get(`/user/search?query=${query}&limit=${limit}&skip=${skip}`);
export const searchQuestions = (query, limit = 10, skip = 0) =>
  API.get(`/questions/search?query=${query}&limit=${limit}&skip=${skip}`);
export const searchTags = (query, limit = 10) =>
  API.get(`/user/tags/search?query=${query}&limit=${limit}`);
export const updateProfile = (id, updateData) =>
  API.patch(`/user/update/${id}`, updateData);
