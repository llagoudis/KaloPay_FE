/**
 * Global brand colors – defined in app/globals.css.
 * Use when building screens: map design colors to these tokens.
 *
 * CSS usage:  var(--color-brand-navy)  or  bg-brand-navy, text-muted, etc.
 * JS usage:   BRAND_COLORS.brandNavy
 */

export const BRAND_COLORS = {
  brandNavy: "#001539",      // Dark navy – headers, primary dark bg
  brandSurface: "#1b2a3c",  // Dark blue-gray – cards, secondary bg
  oliveDark: "#5e5e23",     // Olive dark
  mustard: "#827a1b",       // Mustard / olive accent
  muted: "#9ea6b3",         // Muted gray – secondary text, borders
  gold: "#aa9912",          // Gold accent
  goldLight: "#e3c705",     // Bright gold – highlights, CTAs
} as const;

/** Tailwind class names for brand colors */
export const BRAND_CLASSES = {
  bgBrandNavy: "bg-brand-navy",
  bgBrandSurface: "bg-brand-surface",
  bgOliveDark: "bg-olive-dark",
  bgMustard: "bg-mustard",
  bgMuted: "bg-muted",
  bgGold: "bg-gold",
  bgGoldLight: "bg-gold-light",
  textBrandNavy: "text-brand-navy",
  textBrandSurface: "text-brand-surface",
  textMuted: "text-muted",
  textGold: "text-gold",
  textGoldLight: "text-gold-light",
  borderMuted: "border-muted",
  borderBrandSurface: "border-brand-surface",
} as const;
