import apiClient from "./client";

export interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  const response = await apiClient.post("/api/v1/auth/login", data, { withCredentials: true });
  console.log("Login response:", response.data);
  return response.data;
};

// ─── Register role (student / parent login generation) ────────────────
export interface RegisterRolePayload {
  username: string;
  email: string;
  password: string;
  role: "STUDENT" | "PARENT";
}

export interface RegisterRoleResponse {
  success: string;
  message?: string;
}

/** Send a list of registration payloads. Backend expects a JSON array. */
export const registerRoleBulk = async (dataList: RegisterRolePayload[]) => {
  const response = await apiClient.post("/api/v1/auth/register/role", dataList, {
    withCredentials: true,
  });
  return response.data;
};
  
 
