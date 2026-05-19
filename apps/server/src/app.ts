import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { roastsRouter } from "./routes/roasts.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { healthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./logger.js";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Block third-party scripts on the password page; the SPA serves itself,
          // styles via Tailwind (inline-sourced at build time), and our own API.
          "script-src": ["'self'"],
          "connect-src": ["'self'", process.env.VITE_API_URL ?? "*"],
          "img-src": ["'self'", "data:"],
        },
      },
    }),
  );

  app.use(
    cors({
      origin: true,
      credentials: false,
    }),
  );

  app.use(express.json({ limit: "16kb" }));

  // Structured request logging — request body is NEVER serialized.
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          // no headers, no body
        }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    }),
  );

  // No-store on all API responses — the spec mandates it.
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.use("/api/v1", healthRouter);
  app.use("/api/v1", roastsRouter);
  app.use("/api/v1", leaderboardRouter);

  app.use(errorHandler);

  return app;
}
