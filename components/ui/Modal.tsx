"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Merged onto the modal panel (e.g. extra padding) */
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!isOpen) return;
    const rootTheme =
      modalRef.current?.closest("[data-theme]")?.getAttribute("data-theme") ?? "light";
    setTheme(rootTheme === "dark" ? "dark" : "light");
  }, [isOpen]);

  const isLight = theme === "light";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 sm:p-6 sm:pt-10">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--modal-backdrop-overlay)" }}
        onClick={onClose}
      />
      <div
        ref={modalRef}
        data-modal-theme={isLight ? "light" : "dark"}
        className={cn(
          "relative w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl p-6 shadow-xl",
          sizes[size],
          className
        )}
        style={{
          backgroundColor: isLight ? "#FFFFFF" : "#0f172a",
          color: isLight ? "#111827" : "#F9FAFB",
          border: `1px solid ${isLight ? "#E5E7EB" : "#334155"}`,
        }}
      >
        {title && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className={cn("text-lg font-semibold", isLight ? "text-gray-900" : "text-white")}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn("hover:text-gray-600", isLight ? "text-gray-400" : "text-gray-300 hover:text-white/90")}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}