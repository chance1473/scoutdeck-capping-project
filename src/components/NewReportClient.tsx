"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileEdit, CheckCircle2, AlertCircle } from "lucide-react";
import { createReportAction } from "@/app/actions";

interface ProspectOption {
  id: string;
  name: string;
  position: string;
  school: string;
}

interface NewReportClientProps {
  prospects: ProspectOption[];
  defaultProspectId?: string;
}

export default function NewReportClient({
  prospects,
  defaultProspectId,
}: NewReportClientProps) {
  const [selectedProspectId, setSelectedProspectId] = useState(
    defaultProspectId || prospects[0]?.id || ""
  );
  const [grade, setGrade] = useState(60);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={selectedProspectId ? `/prospects/${selectedProspectId}` : "/"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Player</span>
        </Link>
        <div className="text-xs text-slate-400">Field Report Logger</div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">File In-Person Scouting Report</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Record professional game observations, tool evaluations, strengths, and areas for development.
          </p>
        </div>

        <form action={createReportAction} className="space-y-6">
          {/* Prospect Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select MLB Player <span className="text-rose-400">*</span>
            </label>
            <select
              name="prospectId"
              value={selectedProspectId}
              onChange={(e) => setSelectedProspectId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {prospects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.position}) — {p.school}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scout Name &amp; Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="scoutName"
                required
                defaultValue="David Vance (National Crosschecker)"
                placeholder="e.g. Mike Callahan (West Coast Scout)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Game / Series <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="eventName"
                required
                placeholder="e.g. Yankees at Red Sox / September series"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Observation</label>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Overall Evaluation Grade (20–80 Scale)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  name="grade"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="flex-1 accent-emerald-400"
                />
                <span className="w-12 text-center px-2 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-sm">
                  {grade}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Game Notes &amp; Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="summary"
              required
              rows={4}
              placeholder="Describe at-bats, pitching matchups, pitch execution, swing mechanics, and demeanor on the field..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Key Strengths</span>
              </label>
              <textarea
                name="strengths"
                required
                rows={3}
                placeholder="e.g. Plus bat speed, effortless barrel control, quiet hands..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Areas for Development</span>
              </label>
              <textarea
                name="weaknesses"
                required
                rows={3}
                placeholder="e.g. Tendency to chase elevated breaking balls, footwork at 2B..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Video / Film Reel URL (Optional)</label>
            <input
              type="url"
              name="videoUrl"
              placeholder="https://www.youtube.com/watch?v=... or Hudl link"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/40"
            >
              Submit Scouting Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
