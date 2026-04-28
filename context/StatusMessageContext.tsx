"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type StatusTone = "success" | "error" | "info";

type StatusToast = {
  id: number;
  message: string;
  tone: StatusTone;
};

type StatusMessageContextValue = {
  showStatusMessage: (message: string, tone?: StatusTone) => void;
};

const StatusMessageContext = createContext<StatusMessageContextValue | null>(null);

const DEFAULT_TIMEOUT_MS = 4500;

export function StatusMessageProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<StatusToast[]>([]);
  const idRef = useRef(0);

  const showStatusMessage = useCallback(
    (message: string, tone: StatusTone = "info") => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message: trimmed, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, DEFAULT_TIMEOUT_MS);
    },
    []
  );

  const value = useMemo(
    () => ({ showStatusMessage }),
    [showStatusMessage]
  );

  return (
    <StatusMessageContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const toneClasses =
            toast.tone === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-gray-200 bg-white text-gray-900";

          return (
            <div
              key={toast.id}
              className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${toneClasses}`}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-live={toast.tone === "error" ? "assertive" : "polite"}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </StatusMessageContext.Provider>
  );
}

export function useStatusMessage() {
  const ctx = useContext(StatusMessageContext);
  if (!ctx) {
    throw new Error("useStatusMessage must be used within StatusMessageProvider");
  }
  return ctx;
}
