import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

import { buildSystemPrompt, buildUserMessage } from "@/lib/prompt";
import { AnalysisSchema, type Analysis } from "@/lib/schema";

export const MODEL = "claude-opus-5-5";

export class RefusalError extends Error {
  constructor(public readonly category: string | null) {
    super("The model declined to analyse this enquiry.");
    this.name = "RefusalError";
  }
}

export class EmptyOutputError extends Error {
  constructor(public readonly stopReason: string | null) {
    super("The model returned no structured result.");
    this.name = "EmptyOutputError";
  }
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // Reads ANTHROPIC_API_KEY from the environment.
  client ??= new Anthropic();
  return client;
}

const SYSTEM_PROMPT = buildSystemPrompt();

/**
 * One structured-output call to Claude. Uses the beta Messages surface for
 * server-side refusal fallbacks: if the primary model declines, the API
 * re-runs the request on a fallback model within the same call.
 */
export async function analyzeEnquiry(enquiry: string): Promise<Analysis> {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "low",
      format: betaZodOutputFormat(AnalysisSchema),
    },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(enquiry) }],
  });

  if (response.stop_reason === "refusal") {
    throw new RefusalError(response.stop_details?.category ?? null);
  }
  if (!response.parsed_output) {
    throw new EmptyOutputError(response.stop_reason);
  }
  return response.parsed_output;
}
