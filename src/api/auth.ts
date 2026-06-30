import apiClient from "./client";

export interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  const response = await apiClient.post("/api/v1/auth/login", data);
  return response.data;
};
