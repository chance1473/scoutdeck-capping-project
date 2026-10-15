"use client";

import { unstable_rethrow } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  unstable_rethrow(error);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center space-y-4">
      <h1 className="text-2xl font-black text-white tracking-tight">Something went wrong</h1>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        ScoutDeck could not finish loading this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
      >
        Try again
      </button>
    </div>
  );
}
