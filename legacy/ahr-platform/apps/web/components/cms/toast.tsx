"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * Implements: Milestone 4 — Toast Notifications. Generic: any future
 * package calls `useToast().show(...)` — no entity-specific message text
 * lives here.
 */
export interface ToastMessage {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  show: (kind: ToastMessage["kind"], message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastMessage["kind"], message: string) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, kind, message }]);
      // Brief, non-blocking confirmation (UI/UX Specification, Design
      // System §"Toasts") — auto-dismiss after a few seconds.
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={
              toast.kind === "error"
                ? "rounded-md bg-danger p-3 text-white"
                : "rounded-md bg-success p-3 text-white"
            }
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() must be used within a <ToastProvider>.");
  }
  return ctx;
}
