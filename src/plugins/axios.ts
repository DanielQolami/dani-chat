import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  // timeout: 20000
});

// Set the AUTH token for any request
instance.interceptors.request.use(
  (config) => {
    let sessionToken = window.localStorage.getItem(import.meta.env.VITE_LOCALSTORAGE_SESSION_TOKEN);

    config.headers.Authorization = sessionToken ? `Bearer ${sessionToken}` : "";
    config.headers.debug = true;

    return config;
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log("res: ", response);
    return response;
  },
  (error: AxiosError) => {
    // console.log("err", error);

    // Unauthorized handler
    // if (error.response?.status === 401) {
    //   const userStore = useUserStore();
    //
    //   userStore.clearUserAndGoToLoginPage();
    // }

    return Promise.reject(error);
  }
);
export default instance;
