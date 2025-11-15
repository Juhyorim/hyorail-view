import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 세션 ID를 요청 헤더에 자동 추가
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["Session-Id"] = sessionId;
  }
  return config;
});

export const queueAPI = {
  enterQueue: (userId) =>
    api.post("/queue/enter", null, { params: { userId } }),
  getQueueSize: () => api.get("/queue/size"),
};

export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  validateSession: () => api.get("/auth/validate"),
};

export const bookingAPI = {
  getTrains: () => api.get("/booking/trains"),
  book: (trainId) => api.post("/booking/book", { trainId }),
  getMyBookings: () => api.get("/booking/my-bookings"),
};

export default api;
