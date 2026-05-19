import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { RoastDTO } from "@hpm/shared";
import { SEVERITY_META } from "../severity.js";

type SortKey = "nickname" | "severity" | "entropy" | "length" | "createdAt";
type Direction = "asc" | "desc";

interface Props {
  items: RoastDTO[];
}

const SEV_RANK: Record<RoastDTO["severity"], number> = {
  PATHETIC: 0,
  WEAK: 1,
  MID: 2,
  DECENT: 3,
  FORTRESS: 4,
};

export function HallOfShameTable({ items }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: Direction }>({
    key: "entropy",
    dir: "asc",
  });

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case "nickname":
          cmp = (a.nickname ?? "").localeCompare(b.nickname ?? "");
          break;
        case "severity":
          cmp = SEV_RANK[a.severity] - SEV_RANK[b.severity];
          break;
        case "entropy":
          cmp = a.entropy - b.entropy;
          break;
        case "length":
          cmp = a.length - b.length;
          break;
        case "createdAt":
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [items, sort]);

  function setKey(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900 text-left text-xs uppercase tracking-wider text-zinc-400">
          <tr>
            <Th onClick={() => setKey("nickname")} active={sort.key === "nickname"} dir={sort.dir}>
              Nickname
            </Th>
            <Th onClick={() => setKey("severity")} active={sort.key === "severity"} dir={sort.dir}>
              Severity
            </Th>
            <Th onClick={() => setKey("entropy")} active={sort.key === "entropy"} dir={sort.dir}>
              Entropy
            </Th>
            <Th onClick={() => setKey("length")} active={sort.key === "length"} dir={sort.dir}>
              Length
            </Th>
            <Th onClick={() => setKey("createdAt")} active={sort.key === "createdAt"} dir={sort.dir}>
              When
            </Th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const meta = SEVERITY_META[r.severity];
            return (
              <tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="px-4 py-2 font-mono text-zinc-200">{r.nickname ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${meta.text} ${meta.bar}/30`}>
                    {meta.emoji} {meta.label}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono">{r.entropy.toFixed(1)}</td>
                <td className="px-4 py-2 font-mono">{r.length}</td>
                <td className="px-4 py-2 text-zinc-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/r/${r.id}`} className="text-amber-400 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                The hall is empty. For now.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  onClick,
  active,
  dir,
  children,
}: {
  onClick: () => void;
  active: boolean;
  dir: Direction;
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="cursor-pointer px-4 py-3 text-left font-semibold hover:text-amber-300"
      onClick={onClick}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      {children}
      {active ? <span aria-hidden> {dir === "asc" ? "▲" : "▼"}</span> : null}
    </th>
  );
}
