"use client";

import { useState } from "react";

import { SAMPLES } from "@/data/samples";
import type { HistoryEntry } from "@/lib/history";
import { historyStore, useHistory } from "@/lib/history-store";
import { MAX_ENQUIRY_CHARS, type AnalyzeError, type AnalyzeResponse } from "@/lib/schema";

import { ResultView, type CopyState } from "./result-view";
import { Card, CardHeader, cx, Icons, TierPill } from "./ui";

type Current = {
  entryId: string;
  input: string;
  sampleId: string | null;
  response: AnalyzeResponse;
  subject: string;
  body: string;
  approved: boolean;
};

export function LeadAgent({ demoMode }: { demoMode: boolean }) {
  const [text, setText] = useState("");
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [loading, setLoading] = useState<"analyze" | "regenerate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const history = useHistory();

  const tooLong = text.length > MAX_ENQUIRY_CHARS;

  async function run(input: string, inputSampleId: string | null, kind: "analyze" | "regenerate") {
    setLoading(kind);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, sampleId: inputSampleId }),
      });
      const data = (await res.json()) as AnalyzeResponse | AnalyzeError;
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        input,
        sampleId: inputSampleId,
        response: data,
        approved: false,
      };
      historyStore.add(entry);
      setCurrent({
        entryId: entry.id,
        input,
        sampleId: inputSampleId,
        response: data,
        subject: data.analysis.reply.subject,
        body: data.analysis.reply.body,
        approved: false,
      });
      setCopyState("idle");
      if (kind === "regenerate" && data.mode === "demo") {
        setNotice("Demo mode returns the same pre-computed draft. Add an API key to generate a fresh one.");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  function pickSample(id: string) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setText(sample.text);
    setSampleId(sample.id);
    setError(null);
  }

  async function approve() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${current.subject}\n\n${current.body}`);
      setCopyState("copied");
      setCurrent({ ...current, approved: true });
      historyStore.markApproved(current.entryId);
      window.setTimeout(() => setCopyState((s) => (s === "copied" ? "idle" : s)), 2500);
    } catch {
      setCopyState("failed");
    }
  }

  function restore(entry: HistoryEntry) {
    setText(entry.input);
    setSampleId(entry.sampleId);
    setError(null);
    setNotice(null);
    setCopyState("idle");
    setCurrent({
      entryId: entry.id,
      input: entry.input,
      sampleId: entry.sampleId,
      response: entry.response,
      subject: entry.response.analysis.reply.subject,
      body: entry.response.analysis.reply.body,
      approved: entry.approved,
    });
  }

  const edited =
    !!current &&
    (current.subject !== current.response.analysis.reply.subject ||
      current.body !== current.response.analysis.reply.body);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      {/* Input column */}
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader
            title="Inbound enquiry"
            icon={<Icons.inbox className="size-4 text-stone-400" />}
            aside={
              demoMode ? (
                <span className="whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30">
                  Demo mode<span className="hidden sm:inline"> — sample output</span>
                </span>
              ) : (
                <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
                  Live · Claude
                </span>
              )
            }
          />
          <div className="space-y-4 p-5">
            <div>
              <p className="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">Try a sample</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSample(s.id)}
                    aria-pressed={sampleId === s.id && text === s.text}
                    className={cx(
                      "rounded-lg border px-3 py-2 text-left transition",
                      sampleId === s.id && text === s.text
                        ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-500/10 dark:ring-indigo-400"
                        : "border-stone-200 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-stone-800/60",
                    )}
                  >
                    <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">{s.label}</span>
                    <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{s.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="sr-only">Enquiry text</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste an inbound email or web-form enquiry…"
                className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <span className={cx("text-xs tabular-nums", tooLong ? "text-rose-600" : "text-stone-400")}>
                {text.length.toLocaleString("en-GB")} / {MAX_ENQUIRY_CHARS.toLocaleString("en-GB")}
              </span>
              <button
                type="button"
                onClick={() => run(text, sampleId, "analyze")}
                disabled={!text.trim() || tooLong || loading !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icons.sparkles className={cx("size-4", loading === "analyze" && "animate-pulse")} />
                {loading === "analyze" ? "Analysing…" : "Analyse enquiry"}
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent runs"
            icon={<Icons.clock className="size-4 text-stone-400" />}
            aside={
              history.length > 0 && (
                <button
                  type="button"
                  onClick={() => historyStore.clear()}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  Clear
                </button>
              )
            }
          />
          {history.length === 0 ? (
            <p className="px-5 py-4 text-sm text-stone-500 dark:text-stone-400">
              Runs are kept in this browser only.
            </p>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => restore(h)}
                    className={cx(
                      "flex w-full items-center gap-3 px-5 py-2.5 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800/60",
                      current?.entryId === h.id && "bg-stone-50 dark:bg-stone-800/60",
                    )}
                  >
                    <span className="w-7 shrink-0 text-right text-sm font-semibold tabular-nums text-stone-700 dark:text-stone-300">
                      {h.response.analysis.score}
                    </span>
                    <TierPill tier={h.response.analysis.tier} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-stone-600 dark:text-stone-300">
                      {h.response.analysis.requirements.company ?? h.input.slice(0, 60)}
                    </span>
                    {h.approved && <Icons.check className="size-4 shrink-0 text-emerald-600" aria-label="Approved" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Results column */}
      <div className="min-w-0" aria-live="polite">
        {error && (
          <div className="mb-5 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <Icons.alert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            {notice}
          </div>
        )}

        {loading === "analyze" ? (
          <LoadingState />
        ) : current ? (
          <ResultView
            response={current.response}
            subject={current.subject}
            body={current.body}
            edited={edited}
            approved={current.approved}
            copyState={copyState}
            regenerating={loading === "regenerate"}
            onSubjectChange={(subject) => setCurrent({ ...current, subject, approved: false })}
            onBodyChange={(body) => setCurrent({ ...current, body, approved: false })}
            onApprove={approve}
            onRegenerate={() => run(current.input, current.sampleId, "regenerate")}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const steps = [
    ["Score", "0–100 lead score, tier and a one-line reason"],
    ["Extract", "Company, contact, products mapped to SKUs, missing info"],
    ["Draft", "A catalogue-grounded first reply, never quoting prices"],
    ["Review", "You edit and approve. Nothing is sent automatically"],
  ] as const;
  return (
    <Card className="p-6 sm:p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icons.sparkles className="size-5" />
        </div>
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Triage an inbound lead</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Pick a sample or paste an enquiry to Northwind Fasteners, a fictional fastener supplier.
        </p>
      </div>
      <ol className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
        {steps.map(([title, desc], i) => (
          <li key={title} className="rounded-lg border border-stone-200 p-3.5 dark:border-stone-800">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {i + 1}. {title}
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{desc}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      <Card className="flex items-center gap-5 p-5">
        <div className="size-28 shrink-0 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          <div className="h-4 w-full animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        </div>
      </Card>
      <Card className="space-y-3 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-stone-100 dark:bg-stone-800" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </Card>
      <p className="text-center text-sm text-stone-500 dark:text-stone-400">Reading the enquiry and drafting a reply…</p>
    </div>
  );
}
