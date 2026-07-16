import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login as reduxLogin, logout as reduxLogout, restoreSession } from "@/store/slices/authSlice";
import { fetchAndCacheTeacherClass } from "@/api/teacher";

export interface AuthUser {
  token: string;
  role: string;
  name?: string;
  email?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Re-export useAuth for backward compatibility — reads from Redux store
export function useAuth(): AuthContextValue {
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.initializing);
  const dispatch = useAppDispatch();

  return {
    user,
    loading,
    login: async (email: string, password: string) => {
      await dispatch(reduxLogin({ email, password })).unwrap();
    },
    logout: () => dispatch(reduxLogout()),
  };
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  // user is read via useAuth() hook, not directly here

  useEffect(() => {
    dispatch(restoreSession());

    // Read role directly from localStorage (same source restoreSession uses)
    // so we don't have to wait for a re-render cycle
    const role = localStorage.getItem("useRole");
    if (role?.toLowerCase() === "teacher") {
      fetchAndCacheTeacherClass();
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;