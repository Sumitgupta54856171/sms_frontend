import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import LoadingPage from "@/pages/Loginpage/LoadingPage";


type LoadingContextValue = {
  isLoading: boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

const EXIT_ANIMATION_MS = 400;

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Set<string>>(() => new Set());
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | undefined>(undefined);

  const startLoading = useCallback((key: string) => {
    setTasks((current) => {
      if (current.has(key)) {
        return current;
      }
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key: string) => {
    setTasks((current) => {
      if (!current.has(key)) {
        return current;
      }
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = tasks.size > 0;

  useEffect(() => {
    if (isLoading) {
      window.clearTimeout(exitTimerRef.current);
      setOverlayVisible(true);
      setIsExiting(false);
      return;
    }

    if (!overlayVisible) {
      return;
    }

    setIsExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setOverlayVisible(false);
      setIsExiting(false);
    }, EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(exitTimerRef.current);
    };
  }, [isLoading, overlayVisible]);

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading }),
    [isLoading, startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {overlayVisible && (
        <div
          aria-busy={!isExiting}
          aria-live="polite"
          className={`loading-overlay${isExiting ? " loading-overlay--exit" : ""}`}
        >
          <LoadingPage />
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