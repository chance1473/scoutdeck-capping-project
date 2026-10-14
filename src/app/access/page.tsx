import { signInAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const rejected = params.error === "1";

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8">
      <h1 className="text-2xl font-black tracking-tight text-white">Writer access</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Creating prospects, filing reports, importing MLB players, and clearing imported players
        require the writer secret configured for this deployment.
      </p>
      {rejected ? (
        <p className="mt-4 text-sm text-rose-300">That secret was not accepted.</p>
      ) : null}
      <form action={signInAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-300" htmlFor="secret">
          Writer secret
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Sign in
        </button>
      </form>
    </section>
  );
}
