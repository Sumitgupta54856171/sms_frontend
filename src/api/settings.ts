import apiClient from "./client";

export interface AdminProfile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface SmsGatewaySettings {
  gatewayUrl: string;
  apiKey: string;
  senderId: string;
  enabled: boolean;
}

export interface EmailSettings {
  gmailAddress: string;
  gmailAppSecret: string;
  enabled: boolean;
}

export interface AppSettings {
  profile: AdminProfile;
  sms: SmsGatewaySettings;
  email: EmailSettings;
}

// ─── LocalStorage helpers (fallback until backend endpoints are ready) ─
const SETTINGS_KEY = "sms_settings";
const EMAIL_SETTINGS_KEY = "email_settings";
const PROFILE_KEY = "admin_profile";

// ─── Fetch super admin profile ─────────────────────────────────────────
export const fetchAdminProfile = async (): Promise<AdminProfile> => {
  try {
    const response = await apiClient.get("/api/v1/settings/admin/profile", {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? {};
    return {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      photoUrl: data.photoUrl ?? data.photo_url ?? "",
    };
  } catch {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
    return { name: "", email: "", phone: "", photoUrl: "" };
  }
};

// ─── Update super admin profile ────────────────────────────────────────
export const updateAdminProfile = async (profile: AdminProfile): Promise<AdminProfile> => {
  try {
    const response = await apiClient.put("/api/v1/settings/admin/profile", profile, {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? profile;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  }
};

// ─── Upload super admin photo ──────────────────────────────────────────
export const uploadAdminPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("photo", file);
  try {
    const response = await apiClient.post("/api/v1/settings/admin/photo", formData, {
      withCredentials: true,
      transformRequest: [(data) => data],
      headers: { "Content-Type": null },
    });
    const url = response.data?.photoUrl ?? response.data?.body?.photoUrl ?? "";
    const saved = localStorage.getItem(PROFILE_KEY);
    const profile = saved ? JSON.parse(saved) : {};
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, photoUrl: url }));
    return url;
  } catch {
    // Fallback: store as base64 in localStorage for demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const saved = localStorage.getItem(PROFILE_KEY);
        const profile = saved ? JSON.parse(saved) : {};
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, photoUrl: url }));
        resolve(url);
      };
      reader.readAsDataURL(file);
    });
  }
};

// ─── Fetch SMS gateway settings ──────────────────────────────────────
export const fetchSmsSettings = async (): Promise<SmsGatewaySettings> => {
  try {
    const response = await apiClient.get("/api/v1/settings/sms", {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? {};
    return {
      gatewayUrl: data.gatewayUrl ?? data.gateway_url ?? "",
      apiKey: data.apiKey ?? data.api_key ?? "",
      senderId: data.senderId ?? data.sender_id ?? "",
      enabled: data.enabled ?? false,
    };
  } catch {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
    return { gatewayUrl: "", apiKey: "", senderId: "", enabled: false };
  }
};

// ─── Save SMS gateway settings ────────────────────────────────────────
export const saveSmsSettings = async (settings: SmsGatewaySettings): Promise<SmsGatewaySettings> => {
  try {
    const response = await apiClient.post("/api/v1/settings/sms", settings, {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? settings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  }
};

// ─── Fetch email/Gmail settings ────────────────────────────────────────
export const fetchEmailSettings = async (): Promise<EmailSettings> => {
  try {
    const response = await apiClient.get("/api/v1/settings/email", {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? {};
    return {
      gmailAddress: data.gmailAddress ?? data.gmail_address ?? "",
      gmailAppSecret: data.gmailAppSecret ?? data.gmail_app_secret ?? "",
      enabled: data.enabled ?? false,
    };
  } catch {
    const saved = localStorage.getItem(EMAIL_SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
    return { gmailAddress: "", gmailAppSecret: "", enabled: false };
  }
};

// ─── Save email/Gmail settings ─────────────────────────────────────────
export const saveEmailSettings = async (settings: EmailSettings): Promise<EmailSettings> => {
  try {
    const response = await apiClient.post("/api/v1/settings/email", settings, {
      withCredentials: true,
    });
    const data = response.data?.body ?? response.data ?? settings;
    localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  }
};

// ─── Fetch all settings at once ────────────────────────────────────────
export const fetchAllSettings = async (): Promise<AppSettings> => {
  const [profile, sms, email] = await Promise.all([
    fetchAdminProfile(),
    fetchSmsSettings(),
    fetchEmailSettings(),
  ]);
  return { profile, sms, email };
};
