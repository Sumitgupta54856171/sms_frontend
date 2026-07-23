import apiClient from "./client";

export interface SendSmsData {
  recipientType: string;
  phoneNumber?: string;
  message: string;
}

export const sendSms = async (data: SendSmsData) => {
  const response = await apiClient.post("/api/v1/sms/send", data);
  return response.data;
};
