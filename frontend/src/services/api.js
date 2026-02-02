import axios from "axios";

const API = axios.create({
  baseURL: "https://minidrive-project-mern.onrender.com",
});

export default API;