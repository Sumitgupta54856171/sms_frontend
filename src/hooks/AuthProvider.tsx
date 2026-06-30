import { createContext, useContext, useState, useEffect } from "react";
import { loginUser } from "@/api/auth";

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

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("useRole");
    const name = localStorage.getItem("userName") || undefined;
    const email = localStorage.getItem("userEmail") || undefined;

    if (token && role) {
      setUser({ token, role, name, email });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password })

    const token = data.token ?? data.accessToken;
    const role = data.role ?? data.user?.role ?? "teacher";
    

    localStorage.setItem("token", token);
    localStorage.setItem("useRole", role);
    console.log("Login data:", data);
   

    setUser({ token, role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("useRole");
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;