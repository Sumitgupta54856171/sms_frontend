import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onLoadingChange } from "@/api/client";
import { Spinner } from "@/components/ui/spinner";

interface LoadingContextValue {
  isGlobalLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue>({ isGlobalLoading: false });

export const useGlobalLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onLoadingChange(setIsGlobalLoading);
    return unsubscribe;
  }, []);

  return (
    <LoadingContext.Provider value={{ isGlobalLoading }}>
      {children}
      {isGlobalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-6 py-5 shadow-2xl flex items-center gap-4">
            <Spinner className="size-6 text-[#6366f1]" />
            <span className="text-sm font-medium text-slate-700">Loading...</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
