import axios from "axios";
import { baseUrl } from "./auth.service";

export const getMyFriends = async () => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .get(baseUrl + `/api/chats/getMyFriends`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};

export const getChatById = async (chatId) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .get(baseUrl + `/api/chats/getChatById/${chatId}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};

export const getChatIdByFriend = async (friendId) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .get(baseUrl + `/api/chats/getChatIdByFriend/${friendId}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};