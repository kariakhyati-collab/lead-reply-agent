"use client";

import { getProduct } from "@/data/catalog";
import type { AnalyzeResponse } from "@/lib/schema";

import {
  Card,
  CardHeader,
  cx,
  Icons,
  NEXT_ACTION_ICONS,
  NEXT_ACTION_LABELS,
  ScoreRing,
  TierPill,
} from "./ui";

export type CopyState = "idle" | "copied" | "failed";

type Props = {
  response: AnalyzeResponse;
  subject: string;
  body: string;
  edited: boolean;
  approved: boolean;
  copyState: CopyState;
  regenerating: boolean;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onApprove: () => void;
  onRegenerate: () => void;
};

export function ResultView(props: Props) {
  const { analysis, warnings } = props.response;
  const req = analysis.requirements;
  const ActionIcon = NEXT_ACTION_ICONS[analysis.next_action];
  const isSpam = analysis.tier === "spam";

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <Card>
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <ScoreRing score={analysis.score} tier={analysis.tier} />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <TierPill tier={analysis.tier} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/30">
                <ActionIcon className="size-3.5" />
                {NEXT_ACTION_LABELS[analysis.next_action]}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-stone-800 dark:text-stone-200">{analysis.reason}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{analysis.next_action_note}</p>
          </div>
        </div>
        {warnings.length > 0 && (
          <ul className="space-y-2 border-t border-stone-100 px-5 py-3.5 dark:border-stone-800">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                <Icons.shield className="mt-0.5 size-4 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Review gate */}
      <Card className="ring-1 ring-indigo-600/10 dark:ring-indigo-400/10">
        <CardHeader
          title="Draft reply"
          icon={<Icons.mail className="size-4 text-indigo-600 dark:text-indigo-400" />}
          aside={
            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                props.approved
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
              )}
            >
              {props.approved ? "Approved" : props.edited ? "Edited · needs review" : "Needs your review"}
            </span>
          }
        />
        <div className="space-y-3 p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400">Subject</span>
            <input
              value={props.subject}
              onChange={(e) => props.onSubjectChange(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400">Body</span>
            <textarea
              value={props.body}
              onChange={(e) => props.onBodyChange(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-stone-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <Icons.shield className="size-3.5 shrink-0" />
              Nothing is sent automatically. Approving copies the draft to your clipboard.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={props.onRegenerate}
                disabled={props.regenerating}
                className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:flex-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Icons.refresh className={cx("size-4", props.regenerating && "animate-spin")} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={props.onApprove}
                disabled={isSpam}
                title={isSpam ? "Spam: no reply recommended" : undefined}
                className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 sm:flex-none dark:disabled:bg-stone-800"
              >
                {props.copyState === "copied" ? <Icons.check className="size-4" /> : <Icons.copy className="size-4" />}
                {props.copyState === "copied" ? "Copied" : "Approve & copy"}
              </button>
            </div>
          </div>
          {props.copyState === "failed" && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Could not access the clipboard. Select the text above and copy it manually.
            </p>
          )}
        </div>
      </Card>
      {/* Requirements */}
      <Card>
        <CardHeader title="Extracted requirements" icon={<Icons.list className="size-4 text-stone-400" />} />
        <div className="space-y-5 p-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="Company" value={req.company} />
            <Field label="Contact" value={req.contact_name} />
            <Field label="Email" value={req.contact_email} />
            <Field label="Location" value={req.location} />
            <Field label="Deadline" value={req.deadline} />
            <Field label="Language" value={req.language} />
          </dl>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Products
            </h3>
            {req.products.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">No products requested.</p>
            ) : (
              <ul className="divide-y divide-stone-100 overflow-hidden rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
                {req.products.map((p, i) => {
                  const product = p.sku ? getProduct(p.sku) : undefined;
                  return (
                    <li key={`${p.requested}-${i}`} className="flex flex-col gap-1.5 px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-stone-900 dark:text-stone-100">{p.requested}</p>
                        {product && (
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {product.name} · MOQ {product.moq} · {product.leadTime}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {p.quantity && (
                          <span className="text-sm tabular-nums text-stone-600 dark:text-stone-300">{p.quantity}</span>
                        )}
                        {p.sku ? (
                          <code className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                            {p.sku}
                          </code>
                        ) : (
                          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                            No match
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {req.missing_info.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Missing before we can quote
              </h3>
              <ul className="space-y-1.5">
                {req.missing_info.map((m) => (
                  <li key={m} className="flex gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className={cx("break-words", value ? "text-stone-900 dark:text-stone-100" : "text-stone-400 dark:text-stone-500")}>
        {value ?? "Not given"}
      </dd>
    </div>
  );
}
