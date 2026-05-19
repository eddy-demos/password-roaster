import { useState } from "react";
import type { CreateRoastResponse, RoastDTO } from "@hpm/shared";
import { PasswordInput } from "../components/PasswordInput.js";
import { RoastCard } from "../components/RoastCard.js";
import { createRoast, deleteRoast } from "../api.js";
import { addOwned, removeOwned } from "../storage.js";

export function Home() {
  const [roast, setRoast] = useState<RoastDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(password: string, opts: { nickname?: string; isPublic: boolean }) {
    setError(null);
    setLoading(true);
    try {
      const res: CreateRoastResponse = await createRoast({
        password,
        nickname: opts.nickname,
        isPublic: opts.isPublic,
      });
      addOwned(res.id, res.ownerToken);
      const { ownerToken, ...dto } = res;
      setRoast(dto);
      setToken(ownerToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went sideways.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!roast || !token) return;
    if (!confirm("Delete this roast?")) return;
    await deleteRoast(roast.id, token);
    removeOwned(roast.id);
    setRoast(null);
    setToken(null);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The honest password strength meter.
        </h1>
        <p className="text-zinc-400">
          Type a password. We'll evaluate it, roast it, and never store the plaintext. Just the
          painful truth.
        </p>
      </section>
      <PasswordInput onSubmit={handleSubmit} disabled={loading} />
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-200"
        >
          {error}
        </div>
      ) : null}
      {roast ? <RoastCard roast={roast} onDelete={handleDelete} /> : null}
    </div>
  );
}
