// Minimal nickname sanitizer. Strips control chars, length-caps, and lightly filters
// the worst slurs. We are generous-but-not-infinite with edgy handles — actual
// pejoratives are dropped, generic profanity is left alone.

const HARD_BLOCK = [
  // a small, deliberate, conservative slur list (substring match, lowercased)
  "n1gger",
  "nigger",
  "f4ggot",
  "faggot",
  "tranny",
  "retard",
  "kike",
  "chink",
  "spic",
];

export function sanitizeNickname(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  // Strip control chars (incl. zero-width and bidi overrides)
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim();
  if (cleaned.length === 0) return null;
  const capped = cleaned.slice(0, 24);
  const lower = capped.toLowerCase();
  if (HARD_BLOCK.some((bad) => lower.includes(bad))) {
    return "[redacted]";
  }
  return capped;
}
