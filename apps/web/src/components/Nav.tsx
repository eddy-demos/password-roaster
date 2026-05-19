import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Roast" },
  { to: "/history", label: "Your History" },
  { to: "/hall-of-shame", label: "Hall of Shame" },
  { to: "/about", label: "About" },
];

export function Nav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">
            🔥
          </span>
          <span className="font-mono text-sm font-bold tracking-tight">honest-password-meter</span>
        </NavLink>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${
                  isActive
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
