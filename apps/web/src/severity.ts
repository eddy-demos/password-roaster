import type { Severity } from "@hpm/shared";

export const SEVERITY_META: Record<
  Severity,
  { label: string; emoji: string; gradient: string; bar: string; text: string; ring: string }
> = {
  PATHETIC: {
    label: "Pathetic",
    emoji: "💀",
    gradient: "from-red-950 via-red-800 to-red-600",
    bar: "bg-sev-pathetic",
    text: "text-red-100",
    ring: "ring-red-500",
  },
  WEAK: {
    label: "Weak",
    emoji: "😬",
    gradient: "from-orange-900 via-orange-700 to-orange-500",
    bar: "bg-sev-weak",
    text: "text-orange-100",
    ring: "ring-orange-500",
  },
  MID: {
    label: "Mid",
    emoji: "😐",
    gradient: "from-yellow-900 via-yellow-700 to-yellow-500",
    bar: "bg-sev-mid",
    text: "text-yellow-100",
    ring: "ring-yellow-500",
  },
  DECENT: {
    label: "Decent",
    emoji: "🙂",
    gradient: "from-blue-900 via-blue-700 to-blue-500",
    bar: "bg-sev-decent",
    text: "text-blue-100",
    ring: "ring-blue-500",
  },
  FORTRESS: {
    label: "Fortress",
    emoji: "🏰",
    gradient: "from-green-900 via-green-700 to-green-500",
    bar: "bg-sev-fortress",
    text: "text-green-100",
    ring: "ring-green-500",
  },
};

export const SEVERITY_ORDER: Severity[] = ["PATHETIC", "WEAK", "MID", "DECENT", "FORTRESS"];

// Client-side preview heuristic — extremely rough; used only for the live preview bar.
// The authoritative score always comes from the server.
export function previewSeverity(pw: string): Severity {
  if (!pw) return "PATHETIC";
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  const entropy = Math.log2(Math.max(pool, 1)) * pw.length;
  if (pw.length < 6 || entropy < 24) return "PATHETIC";
  if (entropy < 40) return "WEAK";
  if (entropy < 60) return "MID";
  if (entropy < 80) return "DECENT";
  return "FORTRESS";
}
