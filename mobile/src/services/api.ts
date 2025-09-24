// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.18.28:3333",
});

function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default Object.assign(api, { setAuthToken });
