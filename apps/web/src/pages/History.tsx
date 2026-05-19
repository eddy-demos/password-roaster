import { useEffect, useState } from "react";
import type { RoastDTO } from "@hpm/shared";
import { listRoasts, deleteRoast } from "../api.js";
import { getOwnedIds, getOwnerToken, removeOwned } from "../storage.js";
import { RoastCard } from "../components/RoastCard.js";

export function History() {
  const [items, setItems] = useState<RoastDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const ids = getOwnedIds();
      if (ids.length === 0) {
        setItems([]);
        return;
      }
      const res = await listRoasts({ ownedIds: ids, limit: 50 });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    const token = getOwnerToken(id);
    if (!token) return;
    if (!confirm("Delete this roast?")) return;
    await deleteRoast(id, token);
    removeOwned(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Your History</h1>
      <p className="text-sm text-zinc-400">
        Stored locally on your device. Clear your browser data and they're gone from this view — but
        if you marked any public, they remain on the hall of shame until you delete them.
      </p>
      {loading ? <p className="text-zinc-500">Loading…</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
      {!loading && items.length === 0 ? (
        <p className="text-zinc-500">No roasts yet. Go humiliate a password.</p>
      ) : null}
      <div className="space-y-6">
        {items.map((r) => (
          <RoastCard key={r.id} roast={r} onDelete={() => handleDelete(r.id)} animate={false} />
        ))}
      </div>
    </div>
  );
}
