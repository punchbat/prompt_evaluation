import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PromptConfig, TestCase, RunResult } from "./types.js";

const execFileAsync = promisify(execFile);

function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

async function callClaude(
  system: string,
  userMessage: string
): Promise<string> {
  const fullMessage = `[System: ${system}]\n\n${userMessage}`;
  const { stdout } = await execFileAsync(
    "claude",
    [
      "--print",
      "--model", "claude-haiku-4-5-20251001",
      fullMessage,
    ],
    { maxBuffer: 1024 * 1024, timeout: 120_000 }
  );
  return stdout.trim();
}

export async function runPrompt(
  prompt: PromptConfig,
  testCase: TestCase
): Promise<RunResult> {
  const input = renderTemplate(prompt.template, testCase.variables);
  const start = performance.now();

  const output = await callClaude(prompt.system, input);
  const latencyMs = Math.round(performance.now() - start);

  return {
    promptName: prompt.name,
    caseId: testCase.id,
    input,
    output,
    latencyMs,
  };
}

export async function runPromptSuite(
  prompt: PromptConfig,
  cases: TestCase[]
): Promise<RunResult[]> {
  // Run sequentially to avoid rate limits with CLI
  const results: RunResult[] = [];
  for (const testCase of cases) {
    results.push(await runPrompt(prompt, testCase));
  }
  return results;
}
