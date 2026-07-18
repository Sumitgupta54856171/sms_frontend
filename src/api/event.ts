import apiClient from "./client";

export interface EventPayload {
  eventname: string;
  eventdate: string; // "YYYY-MM-DD"
  venue: string;
  color: string;
  sessionId: number;
}

export interface EventItem {
  eventid: number;
  eventname: string;
  eventdate: string; // "YYYY-MM-DD"
  venue: string;
  color: string;
  sessionId: number;
}

export const saveEvent = async (payload: EventPayload): Promise<EventItem> => {
  const response = await apiClient.post("/api/v1/event/save", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchEvents = async (): Promise<EventItem[]> => {
  const response = await apiClient.get("/api/v1/event/get", {
    withCredentials: true,
  });
  const raw = response.data?.data ?? response.data?.body ?? response.data;
  return Array.isArray(raw) ? raw : [];
};
