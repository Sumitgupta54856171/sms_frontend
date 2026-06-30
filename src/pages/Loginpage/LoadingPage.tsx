import { Loader2 } from "lucide-react";

export default function LoadingPage() {

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white font-sans relative overflow-hidden">
      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#6366f1] text-base font-bold shadow-sm">
            V
          </div>
          <span className="font-semibold text-xl tracking-tight">Veridian</span>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          <p className="text-sm text-slate-400">Initializing workspace...</p>
        </div>
      </div>
    </div>
  );
}
