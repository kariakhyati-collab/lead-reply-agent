import Anthropic from "@anthropic-ai/sdk";

import { analyzeEnquiry, EmptyOutputError, RefusalError } from "@/lib/analyze";
import { enforceGuardrails } from "@/lib/catalog-match";
import { findDemoResult } from "@/lib/demo";
import { clientKey, RateLimiter } from "@/lib/rate-limit";
import { MAX_ENQUIRY_CHARS, type AnalyzeError, type AnalyzeResponse } from "@/lib/schema";

// 10 analyses per client per hour. Best-effort, per server instance.
const limiter = new RateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

function fail(status: number, code: AnalyzeError["code"], error: string, headers?: HeadersInit) {
  return Response.json({ code, error } satisfies AnalyzeError, { status, headers });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "bad_request", "Request body must be JSON.");
  }

  const { text, sampleId } = (body ?? {}) as { text?: unknown; sampleId?: unknown };
  if (typeof text !== "string" || !text.trim()) {
    return fail(400, "empty", "Paste an enquiry or pick a sample first.");
  }
  if (text.length > MAX_ENQUIRY_CHARS) {
    return fail(413, "too_long", `Enquiries are capped at ${MAX_ENQUIRY_CHARS.toLocaleString("en-GB")} characters.`);
  }

  // Demo mode: no key configured, serve pre-computed results for the samples.
  if (!process.env.ANTHROPIC_API_KEY) {
    const demo = findDemoResult(text, typeof sampleId === "string" ? sampleId : null);
    if (!demo) {
      return fail(
        422,
        "demo_custom_text",
        "This deployment is running in demo mode without an API key, so only the sample enquiries can be analysed. Pick a sample, or run it locally with your own key to try custom text.",
      );
    }
    const { analysis, warnings } = enforceGuardrails(demo.analysis);
    return Response.json({ mode: "demo", analysis, warnings } satisfies AnalyzeResponse);
  }

  const limit = limiter.check(clientKey(request.headers));
  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return fail(429, "rate_limited", "Rate limit reached (10 analyses per hour). Please try again later.", {
      "Retry-After": String(retryAfter),
    });
  }

  try {
    const raw = await analyzeEnquiry(text);
    const { analysis, warnings } = enforceGuardrails(raw);
    return Response.json({ mode: "live", analysis, warnings } satisfies AnalyzeResponse);
  } catch (err) {
    if (err instanceof RefusalError) {
      return fail(422, "refused", "The model declined to analyse this message. Review it manually.");
    }
    if (err instanceof EmptyOutputError) {
      console.error("analyze: no parsed output", err.stopReason);
      return fail(502, "upstream", "The model did not return a usable result. Try regenerating.");
    }
    if (err instanceof Anthropic.RateLimitError) {
      return fail(503, "upstream", "The AI service is busy right now. Please try again in a minute.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("analyze: API error", err.status, err.message);
      return fail(502, "upstream", "The AI service returned an error. Please try again.");
    }
    console.error("analyze: unexpected error", err);
    return fail(500, "upstream", "Something went wrong while analysing the enquiry.");
  }
}
