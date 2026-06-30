import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      // Success toast is handled globally by the API client interceptor
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
        className="hidden lg:flex w-1/2 bg-[#09090b] relative flex-col justify-between p-12 text-white overflow-hidden"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#6366f1] text-sm font-bold shadow-sm">
            V
          </div>
          <span className="font-semibold text-lg tracking-tight">Veridian</span>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 max-w-md pr-8">
          <h2 className="text-[28px] leading-[1.3] font-serif italic text-slate-100 mb-8">
            "The administrative weight of a school should never outweigh the teaching inside it."
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">Dr. Amara Whitfield</span>
              <span className="text-[13px] text-slate-400">Head of School, Lindenwood Academy</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-[11px] font-medium tracking-[0.15em] text-slate-500 uppercase">
          Est. Record-Keeping, Reimagined
        </div>
      </div>

      {/* --- RIGHT PANEL (LIGHT THEME / FORM) --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#fafafa] p-8 sm:p-12">
        
        <div className="w-full max-w-[380px] space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to the Lindenwood Academy workspace.</p>
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
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                className="h-11 bg-white border-slate-200 focus-visible:ring-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb]" />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                  Remember this device
                </Label>
              </div>
              <a href="#" className="text-sm font-medium text-[#2563eb] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-11 bg-[#111827] hover:bg-black text-white mt-2 gap-2 text-sm font-medium transition-colors shadow-sm" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
            </Button>

          </form>

          {/* Footer Text */}
          <p className="text-center text-[13px] text-slate-400 pt-4">
            Prototype build — any credentials will sign you in.
          </p>

        </div>
      </div>

    </div>
  );
}