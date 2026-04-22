/**
 * constants/DS.ts
 * Design System tokens for React Native.
 *
 * Color rationale (Impeccable-aligned):
 *   - oklch is not available in RN; hex equivalents computed from the
 *     web prototype's oklch values via CSS Color 4 conversion.
 *   - Neutrals are tinted toward the primary hue (moss/indigo) for
 *     subconscious brand cohesion — not pure gray.
 *   - NO neon, NO gradients on text, NO pure #000/#fff.
 *   - Two accent hues: moss-green (me) and terracotta-rose (partner).
 *     Both feel warm and alive, not cyberpunk.
 *
 * Reference apps studied for RN patterns:
 *   Nike Training Club  — motion, card hierarchy
 *   Strava              — streak, social proof
 *   Apple Fitness+      — typography weight, spacing
 *   Whoop               — health metric display
 *   MyFitnessPal        — macro bar layout
 */

import { Platform } from "react-native";

// ─── PALETTE ──────────────────────────────────────────────────────

export const Palette = {
  // Backgrounds — tinted toward hue 145 (moss)
  bg:        "#F0F4EF",   // oklch(97% 0.008 145) equiv
  surface:   "#FAFCF9",   // oklch(100% 0.004 145) equiv
  elevated:  "#F5F8F4",   // oklch(99% 0.006 145) equiv
  divider:   "#D9E2D7",   // oklch(88% 0.012 145) equiv

  // Text — NOT pure black
  ink:       "#1E2A1C",   // oklch(22% 0.015 145) equiv
  inkMid:    "#5A6E57",   // oklch(48% 0.012 145) equiv
  inkFaint:  "#8EA08A",   // oklch(70% 0.010 145) equiv

  // Me — moss green
  moss:      "#3D8B5E",   // oklch(52% 0.16 145) equiv
  mossLt:    "#D6EFE0",   // oklch(92% 0.06 145) equiv
  mossDim:   "#EAF5EE",   // oklch(96% 0.04 145) equiv

  // Partner — terracotta rose
  terra:     "#C4614A",   // oklch(56% 0.14 25) equiv
  terraLt:   "#F5DDD7",   // oklch(93% 0.06 25) equiv
  terraDim:  "#FBF1EE",   // oklch(97% 0.03 25) equiv

  // Semantic
  caution:   "#B07A1E",   // oklch(62% 0.16 55) amber
  cautionLt: "#F5EBD2",
  danger:    "#B03030",   // oklch(56% 0.18 20) red
  dangerLt:  "#F5D8D8",
  info:      "#2E6EA6",   // oklch(55% 0.14 250) blue
  infoLt:    "#D5E8F5",

  // Pure values — used only for shadows
  black: "#000000",
  white: "#FFFFFF",
} as const;

// ─── SPACING (4pt base) ───────────────────────────────────────────
// Source: Impeccable spatial-design reference
// "8pt is too coarse — you'll often need 12px"

export const Space = {
  sp1:  4,
  sp2:  8,
  sp3: 12,
  sp4: 16,
  sp5: 24,
  sp6: 32,
  sp7: 48,
  sp8: 64,
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────
// Fixed rem scale for app UI (not fluid — no major app design system
// uses fluid type in product UI per Impeccable typography reference).
//
// Fonts:
//   Display: Bricolage Grotesque — mechanical warmth, distinctive
//   Body:    Literata — reading font, calm and trustworthy
//   Both are off the Impeccable reject list.

export const Font = {
  display: "BricolageGrotesque_700Bold",
  displayBold: "BricolageGrotesque_800ExtraBold",
  displayMedium: "BricolageGrotesque_600SemiBold",
  body: "Literata_400Regular",
  bodyMedium: "Literata_500Medium",
  bodySemibold: "Literata_600SemiBold",
  // Fallbacks for before fonts load
  displayFallback: Platform.select({ ios: "System", android: "sans-serif-condensed" }) ?? "System",
  bodyFallback: Platform.select({ ios: "Georgia", android: "serif" }) ?? "Georgia",
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  lg:   17,
  xl:   22,
  hero: 30,
  mega: 40,
} as const;

export const LineHeight = {
  tight:  1.1,
  snug:   1.25,
  normal: 1.55,
  relaxed: 1.7,
} as const;

// ─── RADIUS ───────────────────────────────────────────────────────

export const Radius = {
  r1:  6,
  r2: 10,
  r3: 16,
  r4: 22,
  r5: 32,   // pill
  full: 9999,
} as const;

// ─── SHADOWS ──────────────────────────────────────────────────────
// Subtle — "if you can clearly see it, it's probably too strong"
// iOS uses shadow* props, Android uses elevation.

export const Shadow = {
  none: {},
  sm: Platform.OS === 'web' 
    ? { boxShadow: `0 1px 4px ${Palette.ink}10` }
    : Platform.select({
        ios: {
          shadowColor: Palette.ink,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: { elevation: 2 },
      }) ?? {},
  md: Platform.OS === 'web'
    ? { boxShadow: `0 4px 12px ${Palette.ink}14` }
    : Platform.select({
        ios: {
          shadowColor: Palette.ink,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
      }) ?? {},
  lg: Platform.OS === 'web'
    ? { boxShadow: `0 12px 24px ${Palette.ink}1A` }
    : Platform.select({
        ios: {
          shadowColor: Palette.ink,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
        },
        android: { elevation: 8 },
      }) ?? {},
} as const;

// ─── ANIMATION ────────────────────────────────────────────────────
// Impeccable: "use exponential easing (ease-out-quint) for natural
// deceleration". RN Animated uses Easing from react-native.
// react-native-reanimated withTiming config equivalents shown.

export const Anim = {
  // Durations (ms)
  instant:  100,  // button press feedback
  fast:     200,  // toggle, color change
  normal:   350,  // state changes
  slow:     500,  // page entrance
  // Easing string for Reanimated Easing.bezier
  easeOutQuint: [0.22, 1.0, 0.36, 1.0] as [number, number, number, number],
} as const;

// ─── HAPTICS ──────────────────────────────────────────────────────
// Maps semantic actions to expo-haptics ImpactFeedbackStyle.
// Studies show haptic confirmation increases perceived reliability.
// (Reference: Apple HIG — feedback should be proportional to action)

export const HapticWeight = {
  light:   "light",    // checklist toggle, meal log
  medium:  "medium",   // workout exercise done
  heavy:   "heavy",    // full workout completed, streak milestone
} as const;

// ─── HELPERS ──────────────────────────────────────────────────────

/** Returns the primary color for a given user */
export function userColor(user: "me" | "partner"): string {
  return user === "me" ? Palette.moss : Palette.terra;
}

export function userColorLt(user: "me" | "partner"): string {
  return user === "me" ? Palette.mossLt : Palette.terraLt;
}

export function userColorDim(user: "me" | "partner"): string {
  return user === "me" ? Palette.mossDim : Palette.terraDim;
}

export function userGradient(user: "me" | "partner"): [string, string] {
  return user === "me" ? [Palette.mossDim, Palette.moss] : [Palette.terraDim, Palette.terra];
}

/** Compute BMI */
export function bmi(weightKg: number, heightCm: number): number {
  return weightKg / ((heightCm / 100) ** 2);
}

/** BMI label */
export function bmiLabel(bmiVal: number): string {
  if (bmiVal < 18.5) return "น้ำหนักน้อยกว่าเกณฑ์";
  if (bmiVal < 23)   return "สมส่วน";
  if (bmiVal < 27.5) return "น้ำหนักเกิน";
  return "อ้วน";
}

/** Daily protein target by profile */
export function proteinTarget(profile: { weight: number; goal: string }): number {
  const factor =
    profile.goal === "sixpack" || profile.goal === "gain" ? 2.0 :
    profile.goal === "lean" ? 1.8 : 1.6;
  return Math.round(profile.weight * factor);
}

/** Today's date string YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/** Format date for display */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short" });
}

// ─── BACKWARD COMPATIBILITY ───────────────────────────────────────
// Legacy DS object — used by Card, Btn, tabs/_layout, meal, progress,
// schedule while they are gradually migrated to the new token system.

export const DS = {
  colors: {
    bg:          Palette.bg,
    surface:     Palette.surface,
    card:        Palette.elevated,
    border:      Palette.divider,
    borderLight: Palette.divider,
    text:        Palette.ink,
    textMuted:   Palette.inkMid,
    textFaint:   Palette.inkFaint,
    // Primary (moss green)
    primary:     Palette.moss,
    primaryLight: Palette.mossLt,
    primaryMid:  Palette.mossDim,
    // Partner (terracotta)
    partner:     Palette.terra,
    partnerLight: Palette.terraLt,
    partnerMid:  Palette.terraDim,
    // Semantic
    green:       Palette.moss,
    greenLight:  Palette.mossLt,
    amber:       Palette.caution,
    amberLight:  Palette.cautionLt,
    blue:        Palette.info,
    blueLight:   Palette.infoLt,
    red:         Palette.danger,
    redLight:    Palette.dangerLt,
    purple:      Palette.info,
    purpleLight: Palette.infoLt,
    orange:      Palette.terra,
    orangeLight: Palette.terraLt,
  },
  gradients: {
    primary:      [Palette.mossDim, Palette.moss]     as [string, string],
    partner:      [Palette.terraDim, Palette.terra]   as [string, string],
    green:        [Palette.mossLt, Palette.moss]      as [string, string],
    amber:        [Palette.cautionLt, Palette.caution] as [string, string],
    blue:         [Palette.infoLt, Palette.info]      as [string, string],
  },
  radius:  { xs: Radius.r1, sm: Radius.r2, md: Radius.r3, lg: Radius.r4, xl: Radius.r5, full: Radius.full },
  spacing: { xs: Space.sp1, sm: Space.sp2, md: Space.sp4, lg: Space.sp5, xl: Space.sp6, xxl: Space.sp7, page: Space.sp5 },
  shadow:  Shadow,
  typography: {
    display:  { fontSize: FontSize.hero, fontWeight: "700" as const, letterSpacing: -0.5 },
    h1:       { fontSize: FontSize.xl,   fontWeight: "700" as const, letterSpacing: -0.3 },
    h2:       { fontSize: FontSize.lg,   fontWeight: "700" as const },
    h3:       { fontSize: FontSize.base, fontWeight: "600" as const },
    body:     { fontSize: FontSize.base, fontWeight: "400" as const },
    bodyMd:   { fontSize: FontSize.sm,   fontWeight: "400" as const },
    caption:  { fontSize: FontSize.xs,   fontWeight: "400" as const },
    label:    { fontSize: 11,            fontWeight: "600" as const, letterSpacing: 0.4 },
    mono:     { fontSize: FontSize.xl,   fontWeight: "700" as const, letterSpacing: 4 },
  },
} as const;

export type ColorKey = keyof typeof DS.colors;