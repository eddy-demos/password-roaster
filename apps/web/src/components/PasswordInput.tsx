import { useEffect, useMemo, useRef, useState } from "react";
import { previewSeverity } from "../severity.js";
import { SeverityMeter } from "./SeverityMeter.js";

interface Props {
  onSubmit: (password: string, opts: { nickname?: string; isPublic: boolean }) => void;
  disabled?: boolean;
}

export function PasswordInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [debounced, setDebounced] = useState("");
  const [nickname, setNickname] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced preview — purely client-side, never sent until submit.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  const preview = useMemo(() => previewSeverity(debounced), [debounced]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value || disabled) return;
    onSubmit(value, { nickname: nickname.trim() || undefined, isPublic });
    // Clear from memory ASAP after submit.
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
      <div className="relative">
        <input
          ref={inputRef}
          type={reveal ? "text" : "password"}
          name="password-not-saved"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Type a password to be roasted…"
          aria-label="Password to evaluate"
          maxLength={256}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 pr-14 font-mono text-lg text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
        />
        <button
          type="button"
          aria-label={reveal ? "Hide password" : "Reveal password"}
          aria-pressed={reveal}
          onClick={() => setReveal((r) => !r)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          {reveal ? "🙈" : "👁"}
        </button>
      </div>
      <SeverityMeter severity={preview} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          placeholder="Nickname (optional, for hall of shame)"
          aria-label="Nickname for hall of shame"
          maxLength={24}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4"
          />
          Public
        </label>
        <button
          type="submit"
          disabled={!value || disabled}
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          Roast it
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Your password never leaves this tab in plain form once it's submitted — only derived
        statistics are stored. We don't log it, we don't keep it, and we don't recover it.
      </p>
    </form>
  );
}
