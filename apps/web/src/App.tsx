import { Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav.js";
import { Home } from "./pages/Home.js";
import { History } from "./pages/History.js";
import { HallOfShame } from "./pages/HallOfShame.js";
import { RoastPermalink } from "./pages/RoastPermalink.js";
import { About } from "./pages/About.js";

export function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/hall-of-shame" element={<HallOfShame />} />
          <Route path="/r/:id" element={<RoastPermalink />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-4xl px-4 pb-8 text-center text-xs text-zinc-500">
        Built with bad opinions and good intentions. Plaintext never persisted.
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center text-zinc-400">
      <h1 className="text-2xl font-bold text-zinc-100">404</h1>
      <p>That page doesn't exist. Like a good password, perhaps.</p>
    </div>
  );
}
