import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { RoastDTO } from "@hpm/shared";
import { getRoast } from "../api.js";
import { RoastCard } from "../components/RoastCard.js";

export function RoastPermalink() {
  const { id } = useParams<{ id: string }>();
  const [roast, setRoast] = useState<RoastDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await getRoast(id);
        setRoast(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load roast.");
      }
    })();
  }, [id]);

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }
  if (!roast) {
    return <p className="text-zinc-500">Loading…</p>;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">A roast, on permanent display</h1>
      <RoastCard roast={roast} animate={false} />
    </div>
  );
}
