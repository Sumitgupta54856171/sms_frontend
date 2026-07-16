import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: '',
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Global loading state ───────────────────────────────────────────────
let activeRequests = 0;
type LoadingListener = (loading: boolean) => void;
const loadingListeners: LoadingListener[] = [];

export const onLoadingChange = (listener: LoadingListener) => {
  loadingListeners.push(listener);
  return () => {
    const idx = loadingListeners.indexOf(listener);
    if (idx !== -1) loadingListeners.splice(idx, 1);
  };
};

const notifyLoading = () => {
  const isLoading = activeRequests > 0;
  loadingListeners.forEach((l) => l(isLoading));
};

// ─── Helpers ────────────────────────────────────────────────────────────

/** Mutating HTTP methods that should show success toasts. */
const MUTATION_METHODS = new Set(["post", "put", "patch", "delete"]);

/** Check if the request opted out of global toasts. */
const shouldSkipToast = (config: any): boolean =>
  config?.headers?.["X-Skip-Toast"] === "true" ||
  config?.skipToast === true;

// ─── Request interceptor ────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    activeRequests++;
    notifyLoading();

    // Attach auth token from localStorage if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    activeRequests--;
    notifyLoading();
    return Promise.reject(error);
  }
);

// ─── Response interceptor ───────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    activeRequests--;
    notifyLoading();

    // ── Global SUCCESS toast for mutations ──
    const method = response.config?.method?.toLowerCase() ?? "";
    if (
      MUTATION_METHODS.has(method) &&
      !shouldSkipToast(response.config) &&
      response.data?.message
    ) {
      toast.success(response.data.message);
    }

    return response;
  },
  (error) => {
    activeRequests--;
    notifyLoading();

    // ── Auto-logout on 401 ──
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("useRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ── Global ERROR toast ──
    if (!shouldSkipToast(error.config)) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error.message || "Something went wrong";

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
