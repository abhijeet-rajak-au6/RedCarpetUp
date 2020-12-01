import {
  REGISTER,
  LOGIN,
  LOGOUT,
  GET_CURRENT_PROFILE,
  CLEAR_USER,
  SET_USER,
  FETCHING_EXPERIENCE,
  LOADING,
  SET_SINGLE_USER,
} from "../Action";
import { keys } from "../../config";
import { setToken } from "../../utils/setToken";
import axios from "axios";
export const register = (userCredentials) => async (dispatch) => {
  console.log(userCredentials);
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(`${keys.BASE_URL}/register`, {
        ...userCredentials,
      });
      console.log(data);
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data);
      console.log(err.response.data.errors.msg);
      if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.errors.msg);
      }
    }
  });
};

export const login = (userCredentials) => async (dispatch) => {
  console.log(userCredentials);
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(`${keys.BASE_URL}/login`, {
        ...userCredentials,
      });
      console.log(data);
      dispatch({
        type: LOGIN,
        payload: data,
      });
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data);
      console.log(!err.response.data.hasOwnProperty("errors"));
      if (!err.response.data.hasOwnProperty("errors")) {
        // console.log('inside')
        reject(err.response.data.msg);
      }
      // console.log(err.response.data.errors.msg);
      else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.errors.msg);
      }
    }
  });
};

export const logout = () => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    if (JSON.parse(localStorage.getItem("user")).token) {
      setToken(JSON.parse(localStorage.getItem("user")).token);
    }
    try {
      const { data } = await axios.delete(`${keys.BASE_URL}/logout`);
      console.log(data);
      dispatch({
        type: CLEAR_USER,
      });
      dispatch({
        type: LOGOUT,
      });
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data);
      if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });
        reject(err.response.data.msg);
      } else if (err.response.data.msg) {
        reject(err.response.data.msg);
      }
    }
  });
};

export const createUser = (userCredentials) => async (dispatch) => {
  console.log("CREATE USER IS TRIGGRED");
  return new Promise(async (resolve, reject) => {
    // dispatch({
    //   type: FETCHING_EXPERIENCE,
    // });
    try {
      if (localStorage.getItem("user")) {
        setToken(JSON.parse(localStorage.getItem("user")).token);
      }
      const { data } = await axios.post(`${keys.BASE_URL}/user`, {
        ...userCredentials,
      });
      console.log(data);
      // dispatch({
      //   type: GET_CURRENT_PROFILE,
      //   payload: data.userProfile,
      // });
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data.msg);
      if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });
        reject(err.response.data.msg);
      } else if (!err.response.data.hasOwnProperty("errors")) {
        console.log("inside");
        reject(err.response.data.msg);
      } else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.msg);
      }
    }
  });
};

export const getCreatedUser = () => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    dispatch({
      type: LOADING,
    });
    try {
      if (localStorage.getItem("user")) {
        setToken(JSON.parse(localStorage.getItem("user")).token);
      }
      const { data } = await axios.get(`${keys.BASE_URL}/getAllUsers`);
      console.log(data);
      dispatch({
        type: SET_USER,
        payload: data.users,
      });
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data.msg);
      if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });
        reject(err.response.data.msg);
      } else if (!err.response.data.hasOwnProperty("errors")) {
        reject(err.response.data.msg);
      } else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.msg);
      }
    } finally {
      dispatch({
        type: LOADING,
      });
    }
  });
};

export const deleteUser = (id) => async (dispatch) => {
  console.log("id", id);
  return new Promise(async (resolve, reject) => {
    // dispatch({
    //   type: LOADING,
    // });
    try {
      if (localStorage.getItem("user")) {
        setToken(JSON.parse(localStorage.getItem("user")).token);
      }
      const { data } = await axios.delete(`${keys.BASE_URL}/user/${id}`);
      console.log("delete", data);
      dispatch({
        type: SET_USER,
        payload: data.users,
      });
      resolve(data.status);
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
      if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });

        reject(err.response.data.msg);
      } else if (!err.response.data.hasOwnProperty("errors")) {
        reject(err.response.data.msg);
      } else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.msg);
      }
    }
  });
};

export const getSingleUser = (id) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    dispatch({
      type: LOADING,
    });
    try {
      if (localStorage.getItem("user")) {
        setToken(JSON.parse(localStorage.getItem("user")).token);
      }
      const { data } = await axios.get(
        `${keys.BASE_URL}/getSingleUser/${id}`
      );
      console.log(data);
      dispatch({
        type: SET_SINGLE_USER,
        payload: data.user,
      });
      resolve(data.user);
    } catch (err) {
      console.log(err.response.data.msg);
      if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });
        reject(err.response.data.msg);
      } else if (!err.response.data.hasOwnProperty("errors")) {
        reject(err.response.data.msg);
      } else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else {
        reject(err.response.data.msg);
      }
    } finally {
      dispatch({
        type: LOADING,
      });
    }
  });
};

export const updateUser = (id, userCredentials) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    // dispatch({
    //   type: LOADING,
    // });
    try {
      if (localStorage.getItem("user")) {
        setToken(JSON.parse(localStorage.getItem("user")).token);
      }
      const { data } = await axios.patch(`${keys.BASE_URL}/user/${id}`, {
        ...userCredentials,
      });
      console.log(data);
      // dispatch({
      //   type: SET_SINGLE_USER,
      //   payload: data.user,
      // });
      resolve(data.status);
    } catch (err) {
      console.log(err.response.data.msg);
      if (!err.response.data.hasOwnProperty("errors")) {
        console.log("inside");
        reject(err.response.data.msg);
      }
      // console.log(err.response.data.errors.msg);
      else if (err.response.data.errors.length) {
        reject(err.response.data.errors[0].msg);
      } else if (err.response.data.msg === "Authentication failed") {
        dispatch({
          type: LOGOUT,
        });
        reject(err.response.data.msg);
      } else {
        reject(err.response.data.errors.msg);
      }
      // reject(err.response.data.errors.msg);
    }
  });
};
