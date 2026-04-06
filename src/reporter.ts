import Table from "cli-table3";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  EvaluationResult,
  PipelineReport,
  PromptSummary,
} from "./types.js";

function groupByPrompt(
  results: EvaluationResult[]
): Map<string, EvaluationResult[]> {
  const grouped = new Map<string, EvaluationResult[]>();
  for (const result of results) {
    const existing = grouped.get(result.promptName) ?? [];
    existing.push(result);
    grouped.set(result.promptName, existing);
  }
  return grouped;
}

function buildSummary(results: EvaluationResult[]): PromptSummary[] {
  const grouped = groupByPrompt(results);
  const summaries: PromptSummary[] = [];

  for (const [promptName, promptResults] of grouped) {
    const totalScore = promptResults.reduce((s, r) => s + r.totalScore, 0);
    const maxScore = promptResults.reduce((s, r) => s + r.maxTotalScore, 0);
    summaries.push({
      promptName,
      averageScore: Math.round((totalScore / promptResults.length) * 100) / 100,
      maxPossibleScore: maxScore / promptResults.length,
      caseCount: promptResults.length,
    });
  }

  return summaries.sort((a, b) => b.averageScore - a.averageScore);
}

export function printReport(results: EvaluationResult[]): void {
  // Detail table
  const detailTable = new Table({
    head: ["Prompt", "Case", "LLM Judge", "Keywords", "Total", "Latency"],
    style: { head: ["cyan"] },
  });

  for (const r of results) {
    const llm = r.scores.find((s) => s.evaluator === "llm-judge");
    const kw = r.scores.find((s) => s.evaluator === "keywords");
    detailTable.push([
      r.promptName,
      r.caseId,
      llm ? `${llm.score}/${llm.maxScore}` : "—",
      kw ? `${kw.score}/${kw.maxScore}` : "—",
      `${r.totalScore}/${r.maxTotalScore}`,
      "—",
    ]);
  }

  console.log("\n📊 Detailed Results:");
  console.log(detailTable.toString());

  // Summary table
  const summaries = buildSummary(results);
  const summaryTable = new Table({
    head: ["Prompt", "Avg Score", "Max Possible", "Cases"],
    style: { head: ["green"] },
  });

  for (const s of summaries) {
    summaryTable.push([
      s.promptName,
      s.averageScore.toFixed(2),
      s.maxPossibleScore.toFixed(2),
      s.caseCount,
    ]);
  }

  console.log("\n🏆 Summary (sorted by score):");
  console.log(summaryTable.toString());
}

export async function saveReport(
  results: EvaluationResult[],
  testSuiteName: string
): Promise<string> {
  const report: PipelineReport = {
    timestamp: new Date().toISOString(),
    testSuite: testSuiteName,
    results,
    summary: buildSummary(results),
  };

  const resultsDir = join(process.cwd(), "results");
  await mkdir(resultsDir, { recursive: true });

  const filename = `${testSuiteName}-${Date.now()}.json`;
  const filepath = join(resultsDir, filename);
  await writeFile(filepath, JSON.stringify(report, null, 2));

  return filepath;
}
