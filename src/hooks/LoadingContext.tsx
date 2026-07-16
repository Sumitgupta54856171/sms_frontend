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
      {/* Non-blocking mini spinner — doesn't block interaction */}
      {isGlobalLoading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm border border-slate-200 backdrop-blur-sm">
          <Spinner className="size-4 text-indigo-600" />
          <span className="text-xs font-medium text-slate-600">Loading...</span>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
