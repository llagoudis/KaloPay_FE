"use client";

import { useEffect, useState } from "react";

/**
 * Reads the dashboard theme from the layout's `data-theme` attribute and
 * re-renders when it toggles. Lets a component style itself per-theme without
 * depending on globals.css (which hot-reloads unreliably in this dev setup).
 */
export function useDashTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const el = document.querySelector("[data-dashboard-theme][data-theme]");
    if (!el) return;
    const read = () =>
      setTheme(el.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}
