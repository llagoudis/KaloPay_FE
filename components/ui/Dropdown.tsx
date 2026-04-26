"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  className?: string;
  menuClassName?: string;
  align?: "left" | "right";
  placement?: "top" | "bottom";
}

export default function Dropdown({
  trigger,
  items,
  onSelect,
  className,
  menuClassName,
  align = "left",
  placement = "bottom",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-10 min-w-[160px] overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
            placement === "top" ? "bottom-full mb-1" : "mt-1",
            menuClassName ?? "max-h-[50vh]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              disabled={item.disabled}
              onClick={() => {
                onSelect(item.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
