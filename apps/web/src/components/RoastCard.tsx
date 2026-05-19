import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { RoastDTO } from "@hpm/shared";
import { SEVERITY_META } from "../severity.js";
import { SeverityMeter } from "./SeverityMeter.js";

interface Props {
  roast: RoastDTO;
  onDelete?: () => void;
  showShare?: boolean;
  animate?: boolean;
}

export function RoastCard({ roast, onDelete, showShare = true, animate = true }: Props) {
  const meta = SEVERITY_META[roast.severity];
  const [typed, setTyped] = useState(animate ? "" : roast.roastText);
  const [showStats, setShowStats] = useState(false);

  // Type-out animation — respects reduced motion via CSS handler in index.css.
  useEffect(() => {
    if (!animate) {
      setTyped(roast.roastText);
      return;
    }
    setTyped("");
    let i = 0;
    const step = Math.max(15, Math.min(35, 800 / roast.roastText.length));
    const t = setInterval(() => {
      i += 1;
      setTyped(roast.roastText.slice(0, i));
      if (i >= roast.roastText.length) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [roast.roastText, animate]);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/r/${roast.id}` : `/r/${roast.id}`;

  return (
    <motion.article
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl bg-gradient-to-br ${meta.gradient} p-1 shadow-xl`}
    >
      <div className="rounded-[14px] bg-zinc-950/70 p-6 backdrop-blur">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="text-4xl">
              {meta.emoji}
            </span>
            <div>
              <div className={`text-xs uppercase tracking-widest ${meta.text}`}>
                {meta.label}
              </div>
              <div className="text-sm text-zinc-400">
                {roast.crackTimeDisplay} to crack &middot; {roast.entropy.toFixed(1)} bits
              </div>
            </div>
          </div>
          {roast.nickname ? (
            <div className="text-right text-xs text-zinc-400">
              <div>nickname</div>
              <div className="font-mono text-sm text-zinc-200">{roast.nickname}</div>
            </div>
          ) : null}
        </header>
        <div className="mt-5">
          <SeverityMeter severity={roast.severity} pulse={animate} />
        </div>
        <p
          aria-live="polite"
          className="mt-6 min-h-[3em] font-serif text-xl leading-snug text-zinc-50"
        >
          {typed}
          {animate && typed.length < roast.roastText.length ? (
            <span className="ml-0.5 inline-block w-2 animate-pulse bg-zinc-50">&nbsp;</span>
          ) : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setShowStats((s) => !s)}
            aria-expanded={showStats}
            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 hover:bg-zinc-800"
          >
            {showStats ? "Hide" : "Show"} stats
          </button>
          {showShare ? (
            <Link
              to={`/r/${roast.id}`}
              className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 hover:bg-zinc-800"
            >
              Share
            </Link>
          ) : null}
          {showShare ? (
            <button
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(shareUrl);
              }}
              className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 hover:bg-zinc-800"
            >
              Copy link
            </button>
          ) : null}
          {onDelete ? (
            <button
              onClick={onDelete}
              className="ml-auto rounded-md border border-red-800 bg-red-950/40 px-3 py-1 text-red-200 hover:bg-red-900/60"
            >
              Delete
            </button>
          ) : null}
        </div>
        {showStats ? (
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-zinc-900/60 p-4 text-sm sm:grid-cols-3">
            <Stat label="Length" value={String(roast.length)} />
            <Stat label="Score" value={`${roast.score} / 4`} />
            <Stat label="Entropy" value={`${roast.entropy.toFixed(1)} bits`} />
            <Stat label="Top pattern" value={roast.topPattern} />
            <Stat label="Crack time" value={roast.crackTimeDisplay} />
            <Stat
              label="Classes"
              value={Object.entries(roast.charClasses)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ") || "none"}
            />
          </dl>
        ) : null}
      </div>
    </motion.article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd className="font-mono text-zinc-100">{value}</dd>
    </div>
  );
}
