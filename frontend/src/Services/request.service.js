import axios from "axios";
import { baseUrl } from "./auth.service";

export const getMyRequests = async (email) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .get(baseUrl + `/api/requests/getMyRequests/${email}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};

export const sendRequest = async (reqObj) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .post(baseUrl + `/api/requests/sendRequest`, reqObj, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};

export const acceptRequest = async (reqObj) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .post(baseUrl + `/api/requests/acceptRequest`, reqObj, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};

export const rejectRequest = async (reqObj) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .post(baseUrl + `/api/requests/rejectRequest`, reqObj, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};
