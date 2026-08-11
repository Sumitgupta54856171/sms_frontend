import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:8080/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach auth token from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 auto-logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "useRole", "userName", "userEmail"]);
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  accessToken?: string;
  role: string;
  user?: { role: string };
  name?: string;
  email?: string;
}

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export default apiClient;
