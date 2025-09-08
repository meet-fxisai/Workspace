import axios from "axios";
import { baseUrl } from "./auth.service";

export const sendMessage = async (newMessage) => {
  const t = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  };
  return axios
    .post(baseUrl + `/api/messages/sendMessage`, newMessage, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred", error);
      throw error;
    });
};
