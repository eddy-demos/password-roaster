export function About() {
  return (
    <article className="prose prose-invert space-y-6 text-zinc-300">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">About this thing</h1>
      <p>
        This is a brutally honest password strength meter. You give it a password, it tells you
        exactly how bad it is, then it forgets the password and remembers the verdict.
      </p>
      <section>
        <h2 className="mt-6 text-xl font-semibold text-zinc-100">What we do</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Run your password through zxcvbn to estimate score, entropy, and crack time.</li>
          <li>Detect patterns: dictionary words, keyboard walks, sequences, repeats, dates.</li>
          <li>Pick a roast template based on the severity and the worst detected pattern.</li>
          <li>Store the verdict — length, score, entropy, severity, the roast — in a database.</li>
        </ul>
      </section>
      <section>
        <h2 className="mt-6 text-xl font-semibold text-zinc-100">What we do not do</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Store your plaintext password. Anywhere. Ever.</li>
          <li>Log request bodies. The middleware redacts them.</li>
          <li>Send your password through any URL or query string.</li>
          <li>Use your password for anything other than producing the result.</li>
        </ul>
      </section>
      <section>
        <h2 className="mt-6 text-xl font-semibold text-zinc-100">Ownership without accounts</h2>
        <p>
          When you create a roast, the server returns a single owner token. Your browser keeps
          it in <code className="rounded bg-zinc-900 px-1">localStorage</code>. To edit or delete
          a roast later, your browser presents the token. No accounts, no passwords (for the
          site itself), no email, no tracking.
        </p>
      </section>
      <section>
        <h2 className="mt-6 text-xl font-semibold text-zinc-100">A note on the jokes</h2>
        <p>
          The roasts target the password choice — never the person. We punch up at lazy
          credentials, not at users.
        </p>
      </section>
    </article>
  );
}
