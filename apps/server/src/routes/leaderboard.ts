import { Router } from "express";
import { prisma } from "../db.js";
import type { RoastDTO } from "@hpm/shared";

export const leaderboardRouter = Router();

interface CacheEntry {
  expires: number;
  payload: RoastDTO[];
}
let cache: CacheEntry | null = null;

// 60-second in-memory cache as per spec.
leaderboardRouter.get("/leaderboard", async (_req, res, next) => {
  try {
    const now = Date.now();
    if (cache && cache.expires > now) {
      res.set("Cache-Control", "public, max-age=60");
      res.json({ items: cache.payload });
      return;
    }
    const rows = await prisma.roast.findMany({
      where: { isPublic: true },
      orderBy: [{ entropy: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
    const items: RoastDTO[] = rows.map((row) => ({
      id: row.id,
      length: row.length,
      entropy: row.entropy,
      score: row.score,
      crackTimeSeconds: row.crackTimeSeconds,
      crackTimeDisplay: row.crackTimeDisplay,
      charClasses: JSON.parse(row.charClasses),
      topPattern: row.topPattern,
      severity: row.severity as RoastDTO["severity"],
      roastText: row.roastText,
      nickname: row.nickname,
      isPublic: row.isPublic,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
    cache = { expires: now + 60_000, payload: items };
    res.set("Cache-Control", "public, max-age=60");
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
