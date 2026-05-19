import { Router } from "express";
import { nanoid } from "nanoid";
import {
  createRoastInput,
  listRoastsQuery,
  patchRoastInput,
  type RoastDTO,
} from "@hpm/shared";
import { prisma } from "../db.js";
import { analyze } from "../services/analyzer.js";
import { generateRoast } from "../services/roastEngine.js";
import { dedupEnabled, hashForDedup } from "../services/hash.js";
import { sanitizeNickname } from "../services/profanity.js";
import { HttpError } from "../middleware/errorHandler.js";
import { mutateLimiter, roastLimiter } from "../middleware/rateLimit.js";

export const roastsRouter = Router();

function toDTO(row: {
  id: string;
  length: number;
  entropy: number;
  score: number;
  crackTimeSeconds: number;
  crackTimeDisplay: string;
  charClasses: string;
  topPattern: string;
  severity: string;
  roastText: string;
  nickname: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}): RoastDTO {
  return {
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
  };
}

// POST /roasts — analyze a password and create a roast record.
// Plaintext lives only inside this handler frame; it is never logged, never stored,
// and never returned in any response.
roastsRouter.post("/roasts", roastLimiter, async (req, res, next) => {
  try {
    const parsed = createRoastInput.parse(req.body);
    let password: string | null = parsed.password;

    const analysis = analyze(password);
    const roastText = generateRoast(password, analysis);
    const passwordHash = dedupEnabled() ? await hashForDedup(password) : null;

    // Overwrite plaintext reference before we move on.
    password = null;

    const id = nanoid();
    const ownerToken = nanoid(32);
    const nickname = sanitizeNickname(parsed.nickname ?? null);

    const row = await prisma.roast.create({
      data: {
        id,
        ownerToken,
        passwordHash,
        length: analysis.length,
        entropy: analysis.entropy,
        score: analysis.score,
        crackTimeSeconds: analysis.crackTimeSeconds,
        crackTimeDisplay: analysis.crackTimeDisplay,
        charClasses: JSON.stringify(analysis.charClasses),
        topPattern: analysis.topPattern,
        severity: analysis.severity,
        roastText,
        nickname,
        isPublic: parsed.isPublic ?? false,
      },
    });

    res.status(201).json({ ...toDTO(row), ownerToken });
  } catch (err) {
    next(err);
  }
});

// GET /roasts — paginated list with strict scoping.
// If `ownedIds` is provided, results are strictly filtered to that set (user history).
// Otherwise the listing only returns public records.
roastsRouter.get("/roasts", async (req, res, next) => {
  try {
    const q = listRoastsQuery.parse(req.query);
    const where: Record<string, unknown> = {};
    if (q.severity) where.severity = q.severity;
    if (q.ownedIds && q.ownedIds.length > 0) {
      where.id = { in: q.ownedIds };
    } else {
      where.isPublic = q.isPublic ?? true;
    }
    if (q.cursor) {
      // Cursor by createdAt + id for stability
      const cursorRow = await prisma.roast.findUnique({ where: { id: q.cursor } });
      if (cursorRow) {
        where.createdAt = { lt: cursorRow.createdAt };
      }
    }
    const rows = await prisma.roast.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: q.limit + 1,
    });
    const hasMore = rows.length > q.limit;
    const items = rows.slice(0, q.limit).map(toDTO);
    const last = items[items.length - 1];
    res.json({
      items,
      nextCursor: hasMore && last ? last.id : null,
    });
  } catch (err) {
    next(err);
  }
});

roastsRouter.get("/roasts/:id", async (req, res, next) => {
  try {
    const row = await prisma.roast.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, "NOT_FOUND", "Roast not found.");
    res.json(toDTO(row));
  } catch (err) {
    next(err);
  }
});

function requireOwner(headerToken: string | undefined, dbToken: string): void {
  if (!headerToken || headerToken !== dbToken) {
    throw new HttpError(403, "FORBIDDEN", "Owner token missing or invalid.");
  }
}

roastsRouter.patch("/roasts/:id", mutateLimiter, async (req, res, next) => {
  try {
    const body = patchRoastInput.parse(req.body);
    const row = await prisma.roast.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, "NOT_FOUND", "Roast not found.");
    requireOwner(req.header("x-owner-token") ?? undefined, row.ownerToken);

    const data: Record<string, unknown> = {};
    if (body.nickname !== undefined) {
      data.nickname = body.nickname === null ? null : sanitizeNickname(body.nickname);
    }
    if (body.isPublic !== undefined) data.isPublic = body.isPublic;

    const updated = await prisma.roast.update({ where: { id: row.id }, data });
    res.json(toDTO(updated));
  } catch (err) {
    next(err);
  }
});

roastsRouter.delete("/roasts/:id", mutateLimiter, async (req, res, next) => {
  try {
    const row = await prisma.roast.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, "NOT_FOUND", "Roast not found.");
    requireOwner(req.header("x-owner-token") ?? undefined, row.ownerToken);
    await prisma.roast.delete({ where: { id: row.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
