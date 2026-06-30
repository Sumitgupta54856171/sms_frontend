import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Track active requests for global loading state
let activeRequests = 0;
let loadingListeners: Array<(loading: boolean) => void> = [];

export const onLoadingChange = (listener: (loading: boolean) => void) => {
  loadingListeners.push(listener);
  return () => {
    loadingListeners = loadingListeners.filter((l) => l !== listener);
  };
};

const notifyLoading = () => {
  const isLoading = activeRequests > 0;
  loadingListeners.forEach((l) => l(isLoading));
};

// Request interceptor — increment counter
apiClient.interceptors.request.use(
  (config) => {
    activeRequests++;
    notifyLoading();
    return config;
  },
  (error) => {
    activeRequests--;
    notifyLoading();
    return Promise.reject(error);
  }
);

// Response interceptor — decrement counter & show error toasts
apiClient.interceptors.response.use(
  (response) => {
    activeRequests--;
    notifyLoading();
    return response;
  },
  (error) => {
    activeRequests--;
    notifyLoading();

    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : error.message || "Something went wrong";

    toast.error(message);
    return Promise.reject(error);
  }
);

export default apiClient;
