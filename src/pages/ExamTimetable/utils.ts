import { format } from "date-fns";

export const formatTime = (time: string) => {
  if (!time) return "";
  try {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  } catch {
    return time;
  }
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};
