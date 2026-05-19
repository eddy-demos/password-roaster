import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // Never log queries with parameters — they may contain user input that originated
  // alongside passwords. Keep it to warnings.
  log: ["warn", "error"],
});
