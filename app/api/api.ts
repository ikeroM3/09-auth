import axios from "axios";

export const nextServer = axios.create({
  baseURL: "https://notehub-api.goit.study",
  withCredentials: true,
});
