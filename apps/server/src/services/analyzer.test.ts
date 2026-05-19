import { describe, expect, it } from "vitest";
import { analyze, computeCharClasses } from "./analyzer.js";
import { generateRoast } from "./roastEngine.js";

describe("analyzer", () => {
  it("flags the obviously pathetic", () => {
    const r = analyze("password");
    expect(r.severity).toBe("PATHETIC");
    expect(r.score).toBeLessThanOrEqual(1);
  });

  it("recognizes character classes", () => {
    const c = computeCharClasses("Aa1!ñ");
    expect(c).toEqual({
      lower: true,
      upper: true,
      digits: true,
      symbols: true,
      unicode: true,
    });
  });

  it("rewards length + variety + randomness", () => {
    const r = analyze("Hk7$mZqL2pX!nY9wR&8cV#4t");
    expect(r.severity).toBe("FORTRESS");
    expect(r.entropy).toBeGreaterThan(70);
  });

  it("produces the literal-password specific callout", () => {
    const a = analyze("password");
    const text = generateRoast("password", a);
    expect(text).toMatch(/named your password 'password'/);
  });

  it("calls out trailing year", () => {
    const a = analyze("Summer2024");
    const text = generateRoast("Summer2024", a);
    expect(text).toMatch(/'2024'/);
  });

  it("calls out all-digits", () => {
    const a = analyze("12345678");
    const text = generateRoast("12345678", a);
    expect(text).toMatch(/All numbers/);
  });
});
