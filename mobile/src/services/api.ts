
import axios from "axios";


const api = axios.create({
  baseURL: "http://192.168.18.28:3333",
  timeout: 12000,
});

export default api;
