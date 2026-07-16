import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("narada-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register");

      if (!isAuthRequest) {
        localStorage.removeItem("narada-token");
        localStorage.removeItem("narada-user");

        window.dispatchEvent(
          new CustomEvent("narada:unauthorized")
        );
      }
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "The server took too long to respond.";
  }

  if (error.message === "Network Error") {
    return "Cannot connect to the Narada server.";
  }

  return fallbackMessage;
};

export default api;