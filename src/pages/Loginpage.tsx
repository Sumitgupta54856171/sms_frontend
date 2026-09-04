import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getCookie } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { loadSessions } from "@/store/slices/sessionSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    setIsPending(true);
    try {
      await login(email.trim(), password);

      // After login, read cookies set by backend and save them
      const sessionIdFromCookie = getCookie("sessionId");
      if (sessionIdFromCookie) {
        localStorage.setItem("currentSessionId", sessionIdFromCookie);
      }
      const teacherIdFromCookie = getCookie("teacherId");
      if (teacherIdFromCookie) {
        localStorage.setItem("teacherId", teacherIdFromCookie);
      }

      // Load sessions — the session slice will auto-select the one matching currentSessionId
      dispatch(loadSessions());

      navigate("/");
    } catch {
      // Error toast is handled globally by the API client interceptor
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans">
      
      {/* --- LEFT PANEL (DARK THEME) --- */}
      <div 
        className="hidden lg:flex w-1/2 bg-[#0d9488]  relative flex-col justify-between p-12 text-white overflow-hidden"
      >
        {/* Dotted Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-30" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }}
        />

        {/* Top Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-4xl bg-[#6366f1] text-sm font-bold shadow-sm overflow-hidden">
            <img src="/LOGO.jpg.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Rose Convent High School</span>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 max-w-md pr-8">
          <h2 className="text-[28px] leading-[1.3] font-serif italic text-slate-100 mb-8">
            "The administrative weight of a school should never outweigh the teaching inside it."
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">Mr. Mohan Lal Sen</span>
              <span className="text-[13px] text-slate-400">Head of School, Rose Convent High School</span>
            </div>
          </div>
        </div>

        
      </div>

      {/* --- RIGHT PANEL (LIGHT THEME / FORM) --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#fafafa] p-8 sm:p-12">
        
        <div className="w-full max-w-[380px] space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to the Rose Convent High School workspace.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-slate-600 font-medium">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="amara.whitfield@lindenwood.edu" 
                className="h-11 bg-white border-slate-200 focus-visible:ring-slate-400 placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
             />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-slate-600 font-medium">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 bg-white border-slate-200 focus-visible:ring-slate-400 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
               
               
              </div>
              
            </div>

            <Button type="submit" className="w-full h-11 bg-[#0d9488]  hover:bg-black text-white mt-2 gap-2 text-sm font-medium transition-colors shadow-sm" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
            </Button>

          </form>

          {/* Footer Text */}
          

        </div>
      </div>

    </div>
  );
}