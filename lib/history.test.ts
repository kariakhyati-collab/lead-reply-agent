import { describe, expect, it } from "vitest";

import { DEMO_RESULTS } from "@/data/demo-results";

import { addToHistory, parseHistory, type HistoryEntry } from "./history";

const entry = (id: string): HistoryEntry => ({
  id,
  createdAt: 1,
  input: "x",
  sampleId: null,
  approved: false,
  response: { mode: "demo", analysis: DEMO_RESULTS["vague"], warnings: [] },
});

describe("history", () => {
  it("adds newest first, de-duplicates and caps", () => {
    let list: HistoryEntry[] = [];
    for (const id of ["a", "b", "c"]) list = addToHistory(list, entry(id), 2);
    expect(list.map((e) => e.id)).toEqual(["c", "b"]);
    list = addToHistory(list, entry("b"), 2);
    expect(list.map((e) => e.id)).toEqual(["b", "c"]);
  });

  it("parses stored history defensively", () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory("not json")).toEqual([]);
    expect(parseHistory('{"a":1}')).toEqual([]);
    expect(parseHistory(JSON.stringify([entry("a"), { id: 1 }, null]))).toHaveLength(1);
  });
});
