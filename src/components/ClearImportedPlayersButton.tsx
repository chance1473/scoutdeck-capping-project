"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { clearImportedMlbPlayersAction } from "@/app/actions";
import { CLEAR_IMPORTED_CONFIRMATION } from "@/lib/limits";

export default function ClearImportedPlayersButton({ count }: { count: number }) {
  const confirmInput = useRef<HTMLInputElement>(null);
  if (count === 0) return null;

  return (
    <form
      action={clearImportedMlbPlayersAction}
      onSubmit={(event) => {
        const typed = window.prompt(
          `Remove all ${count} imported MLB players? Their synchronized statistics and attached scouting reports will also be deleted. This cannot be undone.\n\nType ${CLEAR_IMPORTED_CONFIRMATION} to confirm.`,
        );
        if (typed?.trim() !== CLEAR_IMPORTED_CONFIRMATION || !confirmInput.current) {
          event.preventDefault();
          return;
        }
        confirmInput.current.value = CLEAR_IMPORTED_CONFIRMATION;
      }}
    >
      <input ref={confirmInput} type="hidden" name="confirm" defaultValue="" />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl border border-rose-900/70 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/60 hover:text-rose-200"
      >
        <Trash2 className="h-4 w-4" />
        Clear {count} imported players
      </button>
    </form>
  );
}
