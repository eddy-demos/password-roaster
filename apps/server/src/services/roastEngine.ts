import type { Severity } from "@hpm/shared";
import type { AnalysisResult } from "./analyzer.js";

// 20+ templates per severity bucket. `{pattern}` is replaced with the top detected
// pattern name (humanized). Roasts target the password choice, never the person.
const TEMPLATES: Record<Severity, string[]> = {
  PATHETIC: [
    "This password walked into a security audit and the auditor cried.",
    "I've seen stronger passwords on a child's diary.",
    "A goldfish could brute-force this on its lunch break.",
    "Calling this a password is generous. It's a vibe at best.",
    "Your {pattern} is the cybersecurity equivalent of leaving your keys in the door.",
    "This password is so common it has its own Wikipedia page.",
    "I would say 'try harder' but you'd probably just add a 1.",
    "Even ChatGPT in 2022 could guess this on the first try.",
    "Hackers don't even need to break in. You opened the door for them.",
    "This password has been in the top 100 most common list since dial-up.",
    "You picked the password equivalent of 'open sesame'.",
    "A determined toddler with a keyboard would crack this faster than you typed it.",
    "I'd roast this harder but it would feel like bullying.",
    "Your password is what we in the industry call 'pre-cracked'.",
    "Russian hackers have a folder labelled 'low-hanging fruit'. You're in it.",
    "This password is the reason your bank invented two-factor auth.",
    "Somewhere a CISO felt a chill and doesn't know why. It was you.",
    "This is the password version of writing your PIN on the back of your card.",
    "Your {pattern} screams 'I'll change it later'. Spoiler: you won't.",
    "Cybersecurity awareness training was created specifically because of passwords like this.",
    "Even your dog's name with '123' would have been an upgrade. Slightly.",
  ],
  WEAK: [
    "This password is the participation trophy of credentials.",
    "Better than nothing. Marginally. Microscopically.",
    "I'd give this a C-. And only because we don't give Ds anymore.",
    "Your {pattern} is doing more work than it should have to.",
    "This is the password version of locking your screen door.",
    "You're one motivated attacker away from a bad afternoon.",
    "It's giving 'I read one blog post about passwords in 2015'.",
    "Adding one capital letter doesn't make a password strong. It makes it cute.",
    "This would have been impressive in 2008. It is now 2026.",
    "Your password is technically alive. Barely. On life support.",
    "I see what you tried to do. I'm not impressed, but I see it.",
    "Weak. Like decaf. Like your gym routine. Like this password.",
    "This password thinks it's hardcore. It's not. It's been workshopped to mediocrity.",
    "A targeted attacker would yawn through this.",
    "Your {pattern} is the password equivalent of a wet paper towel.",
    "Half the security of a real password, all the inconvenience.",
    "This password is the security equivalent of locking the screen door but leaving the deadbolt open.",
    "You met the minimum requirements. The bar was on the floor.",
    "Mid-tier on a good day, which today is not.",
    "I bet you reuse this everywhere too, don't you?",
    "Better luck next rotation. Which should be immediately.",
  ],
  MID: [
    "Acceptable. Not impressive, but acceptable.",
    "This password won't win awards, but it probably won't get you pwned today.",
    "A solid 'meh'. The cornerstone of mediocrity.",
    "Your password is the Toyota Camry of credentials. Functional. Forgettable.",
    "I cannot in good conscience roast this. I also cannot praise it.",
    "It's fine. 'Fine' is a vibe, not a security posture.",
    "This password would survive a casual attacker and a serious one's first coffee.",
    "Middle of the road. Like your password and presumably your taste in cereal.",
    "Adequate. The dictionary should put your password under the definition.",
    "You're not the easy target on the list, but you're on the list.",
    "A B-minus password. Could be worse. Has been worse. Will be worse.",
    "This password is doing the absolute average. Crushing those expectations.",
    "Statistically average and not in a fun way.",
    "Your {pattern} is fine. Everything's fine. Definitely fine.",
    "This password is like a salad: technically good for you, missing some heat.",
    "Mid. The password is, as the kids say, mid.",
    "A password manager would weep at how close you came to using one.",
    "Decent enough that I won't laugh, weak enough that I won't applaud.",
    "Not bad, not great, the password equivalent of room-temperature water.",
    "An honest day's password for an honest day's threat model.",
  ],
  DECENT: [
    "Now we're talking. Almost. But yes.",
    "I'd respect this password in a dark alley. Probably.",
    "Good enough that an attacker would actually have to try.",
    "This password is what 'security by competence' looks like.",
    "You're not getting popped in a credential stuffing attack tonight.",
    "Solid. Like a well-made sandwich. Or a load-bearing wall.",
    "Your password could survive most automated attacks and a hangover.",
    "Decent. Welcome to the upper-middle class of credentials.",
    "An attacker would have to actually allocate budget to crack this.",
    "I would describe this as 'almost responsible adult'.",
    "This password says 'I read at least two articles about security'.",
    "You're tougher to crack than 80% of users. The other 20% have password managers.",
    "Respectable. Like a quiet neighbor who pays their taxes.",
    "This password could go a few rounds.",
    "You're not in the easy-to-crack pile. You're in the 'come back later' pile.",
    "Approaching strong. Like a cat approaching a bath: cautiously, but it's happening.",
    "You're doing the security thing. Keep doing it. Maybe go longer next time.",
    "Genuinely decent. I'm proud. In a roasting way.",
    "Your password earned the title 'inconvenience' to attackers.",
    "Reasonable. Like a sensible shoe. Or a 401k contribution.",
  ],
  FORTRESS: [
    "Okay. Fine. You've clearly used a password manager. Congratulations on doing the bare minimum correctly.",
    "This password could survive a heat death of the universe sub-event.",
    "A nation-state would have to want this very, very badly.",
    "I cannot roast this. I will not roast this. Respect.",
    "Your password is what cryptographers think about when they're sad.",
    "An attacker took one look at this and applied for a different job.",
    "This is the password equivalent of a vault inside a vault inside a vault.",
    "Quantum computers are watching this password and feeling inadequate.",
    "Beautifully overbuilt. The Maginot Line of credentials. But in a good way.",
    "I salute you, your password, and the password manager you rode in on.",
    "This is the password your security team puts in slide decks.",
    "Truly excessive. I love it.",
    "Your password is going to outlive several civilizations.",
    "Strong enough that I have to assume you take this seriously.",
    "This password has more entropy than my Monday morning thoughts.",
    "Fortress-tier. The password version of a moat with sharks.",
    "I'm contractually obligated to roast this and I refuse.",
    "An attacker would need a budget, a team, and reasons.",
    "This password is so strong it makes other passwords feel bad about themselves.",
    "Genuinely good. Use it once and never speak of it again.",
    "Now: don't reuse it. I will know. Somehow.",
  ],
};

const PATTERN_LABELS: Record<string, string> = {
  dictionary: "dictionary-word password",
  reverse_dictionary: "backwards-word trick",
  spatial: "keyboard walk",
  sequence: "lazy sequence",
  repeat: "repetition",
  date: "date pattern",
  bruteforce: "alleged random string",
  random: "non-pattern",
  unknown: "thing",
};

function humanizePattern(pattern: string): string {
  return PATTERN_LABELS[pattern] ?? pattern;
}

function pickTemplate(severity: Severity, rng: () => number): string {
  const bucket = TEMPLATES[severity];
  const idx = Math.floor(rng() * bucket.length);
  return bucket[idx] ?? bucket[0] ?? "Your password exists. That's about all I can say.";
}

// Specific overrides — these short-circuit the generic template when triggered.
function specificCallout(password: string, analysis: AnalysisResult): string | null {
  const lower = password.toLowerCase();
  const length = analysis.length;

  if (lower.includes("password")) {
    return "You named your password 'password'. There's commitment, and then there's this.";
  }

  if (/^\d+$/.test(password)) {
    return "All numbers? Your bank PIN called, it wants its security back.";
  }

  // Year 1900–2099 at the end
  const yearMatch = password.match(/(19\d{2}|20\d{2})$/);
  if (yearMatch) {
    return `Adding '${yearMatch[1]}' doesn't make it secure. It makes it your birthday.`;
  }

  // Keyboard walk override (spatial pattern from zxcvbn)
  if (analysis.matches.some((m) => m.pattern === "spatial")) {
    return "Walked your fingers across the keyboard and called it a day.";
  }

  // First name + digits (very rough heuristic, leaning on zxcvbn dictionary match)
  const hasName = analysis.matches.some(
    (m) => m.pattern === "dictionary" && /^[A-Za-z]+$/.test(m.token) && m.token.length >= 3,
  );
  const trailingDigits = /[A-Za-z]+\d+$/.test(password);
  if (hasName && trailingDigits) {
    return "First name plus a number? You also leave your front door unlocked, don't you?";
  }

  if (length < 6) {
    return "This is less a password and more a suggestion.";
  }

  // Length ≥ 20 random — grudging respect, only if zxcvbn agrees it's strong.
  if (length >= 20 && analysis.score === 4 && analysis.matches.length <= 1) {
    return "Okay. Fine. You've clearly used a password manager. Congratulations on doing the bare minimum correctly.";
  }

  return null;
}

// Deterministic-ish RNG so a given password yields a stable-ish roast within a session.
// (Not security-sensitive — this never touches anything cryptographic.)
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hashSeed(password: string): number {
  // Cheap non-crypto hash of the password length+entropy+pattern, NOT the password itself.
  // We avoid hashing the plaintext so we don't accidentally embed it in the seed lifecycle.
  let h = 2166136261;
  const tag = `${password.length}|${password.charCodeAt(0) || 0}|${password.charCodeAt(password.length - 1) || 0}`;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateRoast(password: string, analysis: AnalysisResult): string {
  const specific = specificCallout(password, analysis);
  if (specific) return specific;
  const rng = seededRng(hashSeed(password));
  const template = pickTemplate(analysis.severity, rng);
  return template.replace("{pattern}", humanizePattern(analysis.topPattern));
}
