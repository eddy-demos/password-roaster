import type {
  CreateRoastInput,
  CreateRoastResponse,
  ListRoastsResponse,
  PatchRoastInput,
  RoastDTO,
} from "@hpm/shared";

const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3001") + "/api/v1";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) msg = body.error.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function createRoast(input: CreateRoastInput): Promise<CreateRoastResponse> {
  const res = await fetch(`${BASE}/roasts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  return jsonOrThrow<CreateRoastResponse>(res);
}

export async function listRoasts(params: {
  limit?: number;
  cursor?: string;
  ownedIds?: string[];
  severity?: string;
  isPublic?: boolean;
}): Promise<ListRoastsResponse> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.severity) qs.set("severity", params.severity);
  if (params.isPublic !== undefined) qs.set("isPublic", String(params.isPublic));
  if (params.ownedIds && params.ownedIds.length) qs.set("ownedIds", params.ownedIds.join(","));
  const res = await fetch(`${BASE}/roasts?${qs.toString()}`, { cache: "no-store" });
  return jsonOrThrow<ListRoastsResponse>(res);
}

export async function getRoast(id: string): Promise<RoastDTO> {
  const res = await fetch(`${BASE}/roasts/${encodeURIComponent(id)}`, { cache: "no-store" });
  return jsonOrThrow<RoastDTO>(res);
}

export async function patchRoast(
  id: string,
  token: string,
  input: PatchRoastInput,
): Promise<RoastDTO> {
  const res = await fetch(`${BASE}/roasts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Owner-Token": token },
    body: JSON.stringify(input),
  });
  return jsonOrThrow<RoastDTO>(res);
}

export async function deleteRoast(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}/roasts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "X-Owner-Token": token },
  });
  await jsonOrThrow<void>(res);
}

export async function getLeaderboard(): Promise<{ items: RoastDTO[] }> {
  const res = await fetch(`${BASE}/leaderboard`);
  return jsonOrThrow<{ items: RoastDTO[] }>(res);
}
