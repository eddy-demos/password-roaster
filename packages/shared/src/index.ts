import { z } from "zod";

export const SEVERITIES = ["PATHETIC", "WEAK", "MID", "DECENT", "FORTRESS"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const severityEnum = z.enum(SEVERITIES);

export const charClassesSchema = z.object({
  lower: z.boolean(),
  upper: z.boolean(),
  digits: z.boolean(),
  symbols: z.boolean(),
  unicode: z.boolean(),
});
export type CharClasses = z.infer<typeof charClassesSchema>;

// --- API I/O ---

export const createRoastInput = z.object({
  password: z.string().min(1).max(256),
  nickname: z.string().trim().max(24).optional(),
  isPublic: z.boolean().optional().default(false),
});
export type CreateRoastInput = z.infer<typeof createRoastInput>;

export const patchRoastInput = z.object({
  nickname: z.string().trim().max(24).nullable().optional(),
  isPublic: z.boolean().optional(),
});
export type PatchRoastInput = z.infer<typeof patchRoastInput>;

export const listRoastsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  severity: severityEnum.optional(),
  isPublic: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .optional(),
  ownedIds: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    ),
});

export interface RoastDTO {
  id: string;
  length: number;
  entropy: number;
  score: number;
  crackTimeSeconds: number;
  crackTimeDisplay: string;
  charClasses: CharClasses;
  topPattern: string;
  severity: Severity;
  roastText: string;
  nickname: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoastResponse extends RoastDTO {
  ownerToken: string;
}

export interface ListRoastsResponse {
  items: RoastDTO[];
  nextCursor: string | null;
}

export interface ApiError {
  error: { code: string; message: string };
}
