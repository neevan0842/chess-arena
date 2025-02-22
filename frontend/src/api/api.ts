import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import useAuthStore from "../store/useAuthStore";

const API_URL: string = import.meta.env.VITE_API_URL;

const apiAuthenticated: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor: sets the Authorization header before each request.
apiAuthenticated.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      } as AxiosRequestHeaders;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiUnauthenticated: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export { apiAuthenticated, apiUnauthenticated };
