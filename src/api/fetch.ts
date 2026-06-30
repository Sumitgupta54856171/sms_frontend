import apiClient from "./client";

export const fetchStudentsdetail = async () => {
  const response = await apiClient.get("/students");
  return response.data;
};


