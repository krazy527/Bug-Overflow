import * as api from "../api";
import { setCurrentUser } from "./currentUser";
import { fetchAllUsers } from "./users";

export const signup = (authData, navigate) => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_ERROR" });
    const { data } = await api.signUp(authData);
    dispatch({ type: "AUTH", data });
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("Profile"))));
    dispatch(fetchAllUsers());
    navigate("/");
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || "An error occurred during signup";
    dispatch({ type: "AUTH_ERROR", payload: errorMessage });
    console.log(error);
  }
};

export const login = (authData, navigate) => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_ERROR" });
    const { data } = await api.logIn(authData);
    dispatch({ type: "AUTH", data });
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("Profile"))));
    navigate("/");
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || "An error occurred during login";
    dispatch({ type: "AUTH_ERROR", payload: errorMessage });
    console.log(error);
  }
};

export const clearAuthError = () => (dispatch) => {
  dispatch({ type: "CLEAR_ERROR" });
};
