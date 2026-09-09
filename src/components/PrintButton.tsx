"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-700 shadow-sm"
      title="Print official scouting card"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print Dossier</span>
    </button>
  );
}
