import apiClient from "./client";

export interface SendEmailData {
  recipientType: string;
  recipientEmail?: string;
  subject: string;
  message: string;
}

export const sendEmail = async (data: SendEmailData) => {
  const response = await apiClient.post("/api/v1/email/send", data);
  return response.data;
};
