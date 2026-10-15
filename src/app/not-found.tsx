import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center space-y-4">
      <h1 className="text-2xl font-black text-white tracking-tight">Page not found</h1>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        That ScoutDeck page does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
      >
        Back to the board
      </Link>
    </div>
  );
}
