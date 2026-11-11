import { connection } from "next/server";
import { Suspense } from "react";

import { LeadAgent } from "@/components/lead-agent";
import { Icons } from "@/components/ui";

const REPO_URL = "https://github.com/kariakhyati-collab/lead-reply-agent";

/** Reads the environment at request time so demo mode reflects the running server. */
async function Agent() {
  await connection();
  return <LeadAgent demoMode={!process.env.ANTHROPIC_API_KEY} />;
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/85">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Icons.inbox className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-stone-900 dark:text-stone-50">Inbound</span>
            <span className="hidden truncate text-sm text-stone-500 sm:inline dark:text-stone-400">
              AI lead-reply agent
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-4 text-sm">
            <span className="text-stone-500 dark:text-stone-400">by Khyati Karia</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label="Source on GitHub"
            >
              <Icons.github className="size-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
            Reply to every inbound lead in minutes, not days
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
            Claude scores the enquiry, extracts what the buyer needs, and drafts a first reply grounded in the
            product catalogue. A person reviews every draft before anything leaves the building.
          </p>
        </div>

        <div id="agent" className="scroll-mt-20">
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-xl bg-stone-100 dark:bg-stone-900" />}>
            <Agent />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-stone-200/80 dark:border-stone-800/80">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-stone-500 sm:px-6 dark:text-stone-400">
          Demonstrates structured LLM output, prompt-injection handling and a human-in-the-loop review gate.
          Northwind Fasteners and all sample senders are fictional.
        </p>
      </footer>
    </>
  );
}
