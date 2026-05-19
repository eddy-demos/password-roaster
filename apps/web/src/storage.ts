// LocalStorage-backed registry of the user's own roast IDs + owner tokens.
// The server has no user accounts; this is the entire concept of "ownership" on the
// client side. Tokens are opaque, server-issued, and treated like API keys.

const KEY = "hpm.owned";

interface OwnedEntry {
  id: string;
  ownerToken: string;
  createdAt: string;
}

export function loadOwned(): OwnedEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is OwnedEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as OwnedEntry).id === "string" &&
        typeof (e as OwnedEntry).ownerToken === "string",
    );
  } catch {
    return [];
  }
}

export function saveOwned(entries: OwnedEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addOwned(id: string, ownerToken: string): void {
  const cur = loadOwned();
  if (cur.some((e) => e.id === id)) return;
  cur.unshift({ id, ownerToken, createdAt: new Date().toISOString() });
  saveOwned(cur.slice(0, 500));
}

export function removeOwned(id: string): void {
  saveOwned(loadOwned().filter((e) => e.id !== id));
}

export function getOwnerToken(id: string): string | null {
  return loadOwned().find((e) => e.id === id)?.ownerToken ?? null;
}

export function getOwnedIds(): string[] {
  return loadOwned().map((e) => e.id);
}
