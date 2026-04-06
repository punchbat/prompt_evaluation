import { readFile } from "node:fs/promises";
import type {
  PromptConfig,
  TestSuite,
  TestCase,
  EvaluationResult,
} from "./types.js";
import { runPromptSuite } from "./runner.js";
import { evaluate } from "./evaluators/index.js";
import { printReport, saveReport } from "./reporter.js";

export async function loadJson<T>(path: string): Promise<T> {
  const content = await readFile(path, "utf-8");
  return JSON.parse(content) as T;
}

export async function runPipeline(
  promptPaths: string[],
  casesPath: string
): Promise<void> {
  // Load configs
  const prompts = await Promise.all(
    promptPaths.map((p) => loadJson<PromptConfig>(p))
  );
  const testSuite = await loadJson<TestSuite>(casesPath);

  console.log(`\nLoaded ${prompts.length} prompt(s), ${testSuite.cases.length} test case(s)`);
  console.log(`Test suite: ${testSuite.name}\n`);

  const allResults: EvaluationResult[] = [];

  for (const prompt of prompts) {
    console.log(`Running prompt: ${prompt.name}...`);

    // Run all test cases for this prompt
    const runResults = await runPromptSuite(prompt, testSuite.cases);

    // Evaluate each result
    const evaluations = await Promise.all(
      runResults.map((runResult) => {
        const testCase = testSuite.cases.find(
          (c) => c.id === runResult.caseId
        ) as TestCase;
        return evaluate(runResult, testCase);
      })
    );

    allResults.push(...evaluations);
    console.log(`  ✓ ${prompt.name}: ${evaluations.length} case(s) evaluated`);
  }

  // Print and save report
  printReport(allResults);

  const reportPath = await saveReport(allResults, testSuite.name);
  console.log(`\n💾 Report saved: ${reportPath}`);
}
