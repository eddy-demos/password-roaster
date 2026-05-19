import { useEffect, useState } from "react";
import type { RoastDTO } from "@hpm/shared";
import { getLeaderboard } from "../api.js";
import { HallOfShameTable } from "../components/HallOfShameTable.js";

export function HallOfShame() {
  const [items, setItems] = useState<RoastDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLeaderboard();
        setItems(res.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load leaderboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hall of Shame</h1>
        <p className="text-sm text-zinc-400">
          The 50 worst public passwords this roaster has seen, sorted by lowest entropy.
        </p>
      </div>
      {loading ? <p className="text-zinc-500">Loading…</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
      {!loading && !error ? <HallOfShameTable items={items} /> : null}
    </div>
  );
}
