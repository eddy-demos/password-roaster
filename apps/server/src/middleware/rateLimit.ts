import rateLimit from "express-rate-limit";

const max = Number(process.env.RATE_LIMIT_MAX ?? 30);

export const roastLimiter = rateLimit({
  windowMs: 60_000,
  limit: max,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Slow down. Try again in a minute." } },
});

// 5 per minute per owner token for PATCH/DELETE.
export const mutateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const token = req.header("x-owner-token");
    return token || req.ip || "anon";
  },
  message: { error: { code: "RATE_LIMITED", message: "Slow down." } },
});
