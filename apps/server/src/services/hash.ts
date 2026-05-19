import argon2 from "argon2";

// Optional dedup hash. Only enabled when ARGON2_PEPPER is set in env.
// We salt per-record (argon2 generates a random salt) and pepper with a server-side
// secret so leaked DB rows can't be cheaply rainbow-tabled.

export function dedupEnabled(): boolean {
  return Boolean(process.env.ARGON2_PEPPER);
}

export async function hashForDedup(password: string): Promise<string | null> {
  const pepper = process.env.ARGON2_PEPPER;
  if (!pepper) return null;
  // Argon2id with sensible defaults. Salt is generated internally per-call.
  return argon2.hash(`${password}:${pepper}`, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}
