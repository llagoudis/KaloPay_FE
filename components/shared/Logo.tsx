"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Logo – global. Optional accentColor for dashboard (e.g. "#4A90E2").
 * Uses global brand colors.
 */
interface LogoProps {
  href?: string;
  className?: string;
  useImage?: boolean;
  variant?: "dark" | "light";
  /** Optional: e.g. "#4A90E2" for dashboard accent; circle uses this, text on circle becomes white */
  accentColor?: string;
}

export default function Logo({ href = "/", className = "", useImage = false, variant = "dark", accentColor }: LogoProps) {
  const circleBg = accentColor || "var(--color-gold-light)";
  const circleText = accentColor ? "#fff" : "var(--color-brand-navy)";
  const content = useImage ? (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={120}
      height={32}
      className="h-8 w-auto object-contain"
      priority
    />
  ) : (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: circleBg }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: circleText }}
        >
          K
        </span>
      </div>
      <span
        className="shrink-0 text-lg font-semibold whitespace-nowrap"
        style={
          variant === "dark"
            ? { color: accentColor || "#fff" }
            : { color: "var(--color-brand-navy)" }
        }
      >
        KaloPay
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`inline-flex items-center ${className}`}>{content}</div>;
}
