import { pino } from "pino";

// Logger explicitly redacts any field that could carry a password.
// We also never pass the request body into pino-http (see app.ts).
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: ["password", "*.password", "req.body.password", "req.body", "res.body", "body.password"],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino/file",
          options: { destination: 1 },
        },
});
