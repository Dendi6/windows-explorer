import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Translate HTTP errors into user-friendly messages
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ??
      (err.response?.status === 409 ? "Email already registered" :
       err.response?.status === 401 ? "Invalid email or password" :
       err.response?.status >= 500  ? "Server error, please try again" :
       "Something went wrong");

    // Rethrow a clean error — no Axios internals leaking into domain
    return Promise.reject(new Error(message));
  }
);