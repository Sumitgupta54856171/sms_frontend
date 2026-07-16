import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Spinner } from "@/components/ui/spinner";

type LoadingContextValue = {
  isLoading: boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Set<string>>(() => new Set());

  const startLoading = useCallback((key: string) => {
    setTasks((current) => {
      if (current.has(key)) return current;
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key: string) => {
    setTasks((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = tasks.size > 0;

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading }),
    [isLoading, startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {/* Non-blocking mini spinner — doesn't block interaction */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm border border-slate-200 backdrop-blur-sm">
          <Spinner className="size-4 text-indigo-600" />
          <span className="text-xs font-medium text-slate-600">Loading...</span>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export function useLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}