import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("joballocate_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle errors (401, CORS, network errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Clear invalid token & user session if unauthorized
      localStorage.removeItem("joballocate_token");
      localStorage.removeItem("joballocate_user");
    }

    let errorMessage = "An unexpected error occurred.";
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === "string" && data.includes("<!DOCTYPE html>")) {
        errorMessage = "Server returned an HTML error response. Please try again later.";
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
