import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { RunResult, TestCase, EvaluationScore } from "../types.js";

const execFileAsync = promisify(execFile);

const JUDGE_SYSTEM = `You are an expert evaluator. You will be given:
- An original input prompt
- The AI's output
- Expected output / reference
- Evaluation criteria

Score the output from 0 to 10 based on how well it meets the criteria.

Respond ONLY in this exact JSON format:
{"score": <number 0-10>, "reasoning": "<brief explanation>"}`;

function buildJudgePrompt(runResult: RunResult, testCase: TestCase): string {
  return `## Input
${runResult.input}

## AI Output
${runResult.output}

## Expected Output
${testCase.expected}

## Evaluation Criteria
${testCase.criteria.map((c) => `- ${c}`).join("\n")}

Rate the AI output from 0 to 10.`;
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

export async function evaluateWithLlmJudge(
  runResult: RunResult,
  testCase: TestCase
): Promise<EvaluationScore> {
  const prompt = buildJudgePrompt(runResult, testCase);
  const text = await callClaude(JUDGE_SYSTEM, prompt);

  try {
    const parsed = JSON.parse(text) as { score: number; reasoning: string };
    return {
      evaluator: "llm-judge",
      score: Math.min(10, Math.max(0, parsed.score)),
      maxScore: 10,
      reasoning: parsed.reasoning,
    };
  } catch {
    return {
      evaluator: "llm-judge",
      score: 0,
      maxScore: 10,
      reasoning: `Failed to parse judge response: ${text}`,
    };
  }
}
