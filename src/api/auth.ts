import apiClient from "./client";
import { toast } from "sonner";

export interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  try{
    const response = await apiClient.post("/api/v1/auth/login", data,{withCredentials: true});

  return response.data;

  }catch(error){
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unknown error occurred.");
    }
  }
  
  

};
  
 
