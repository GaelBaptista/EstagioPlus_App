import axios from "axios";

/**
 * Ajuste o BASE conforme seu ambiente:
 * - Celular físico (Expo Go): IP da sua máquina no Wi-Fi, ex.: http://192.168.0.11:4000
 * - Emulador Android: http://10.0.2.2:4000
 * - iOS simulador:    http://127.0.0.1:4000
 */
const BASE = "http://192.168.18.28:3333"; // <= TROQUE AQUI

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export default api;
