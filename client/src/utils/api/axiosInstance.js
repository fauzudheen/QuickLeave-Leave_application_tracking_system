import axios from 'axios';
import { backendUrl } from '../const';

const createAxiosInstance = (token) => {
  const axiosInstance = axios.create({
    baseURL: backendUrl,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default createAxiosInstance;