import axios from "axios";

const backend = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: `${backend}/api`,
  withCredentials: true,
});
