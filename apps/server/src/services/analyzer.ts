import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import type { CharClasses, Severity } from "@hpm/shared";

zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

const SYMBOL_RE = /[^\p{L}\p{N}\s]/u;
const UNICODE_RE = /[^\x00-\x7f]/;

export function computeCharClasses(password: string): CharClasses {
  return {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digits: /\d/.test(password),
    symbols: SYMBOL_RE.test(password),
    unicode: UNICODE_RE.test(password),
  };
}

function poolSize(c: CharClasses): number {
  let pool = 0;
  if (c.lower) pool += 26;
  if (c.upper) pool += 26;
  if (c.digits) pool += 10;
  if (c.symbols) pool += 33;
  if (c.unicode) pool += 100; // rough estimate for non-ASCII
  return Math.max(pool, 1);
}

function patternPenalty(matches: { pattern?: string; token?: string }[]): number {
  // Heuristic: discount entropy for each detected non-random pattern.
  // Each "bookmark" pattern peels off some assumed-random bits.
  let penalty = 0;
  for (const m of matches) {
    switch (m.pattern) {
      case "dictionary":
      case "reverse_dictionary":
        penalty += Math.min((m.token?.length ?? 0) * 2.5, 20);
        break;
      case "spatial":
      case "sequence":
        penalty += Math.min((m.token?.length ?? 0) * 2, 16);
        break;
      case "repeat":
        penalty += Math.min((m.token?.length ?? 0) * 1.5, 12);
        break;
      case "date":
        penalty += 8;
        break;
      default:
        penalty += 1;
    }
  }
  return penalty;
}

export interface AnalysisResult {
  length: number;
  entropy: number;
  score: number;
  crackTimeSeconds: number;
  crackTimeDisplay: string;
  charClasses: CharClasses;
  topPattern: string;
  severity: Severity;
  // Used by the roast engine — never persisted directly.
  matches: { pattern: string; token: string }[];
  feedbackWarning: string;
}

// Minimal top-10k list lookup is offloaded to zxcvbn's dictionaries. We additionally
// keep a tiny worst-of-the-worst list for fast-path PATHETIC override below.
const ABSURDLY_COMMON = new Set([
  "password",
  "password1",
  "123456",
  "12345678",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
  "monkey",
  "111111",
  "abc123",
  "hunter2",
]);

export function analyze(password: string): AnalysisResult {
  const result = zxcvbn(password);
  const charClasses = computeCharClasses(password);
  const length = [...password].length; // count code points, not UTF-16 units

  const naiveEntropy = Math.log2(poolSize(charClasses)) * length;
  const matches = (result.sequence ?? []).map((s: { pattern?: string; token?: string }) => ({
    pattern: String(s.pattern ?? "unknown"),
    token: String(s.token ?? ""),
  }));
  const penalty = patternPenalty(matches);
  const entropy = Math.max(0, Number((naiveEntropy - penalty).toFixed(2)));

  const crackTimeSeconds = Number(
    result.crackTimesSeconds.offlineSlowHashing1e4PerSecond,
  );
  const crackTimeDisplay = String(
    result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
  );

  // Pick the "top" pattern: longest matched sub-pattern by token length.
  const topPattern =
    matches.length === 0
      ? "random"
      : matches.reduce((a, b) => (b.token.length > a.token.length ? b : a)).pattern;

  // Severity mapping per spec.
  let severity: Severity;
  const lower = password.toLowerCase();
  const isAbsurdlyCommon = ABSURDLY_COMMON.has(lower);
  if (result.score === 0 || length < 8 || isAbsurdlyCommon) {
    severity = "PATHETIC";
  } else if (result.score === 1) {
    severity = "WEAK";
  } else if (result.score === 2) {
    severity = "MID";
  } else if (result.score === 3) {
    severity = "DECENT";
  } else if (result.score === 4 && length >= 14 && entropy >= 70) {
    severity = "FORTRESS";
  } else {
    severity = "DECENT";
  }

  return {
    length,
    entropy,
    score: result.score,
    crackTimeSeconds,
    crackTimeDisplay,
    charClasses,
    topPattern,
    severity,
    matches,
    feedbackWarning: result.feedback.warning ?? "",
  };
}
