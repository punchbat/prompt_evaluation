import type {
  RunResult,
  TestCase,
  EvaluationScore,
  EvaluationResult,
} from "../types.js";
import { evaluateWithLlmJudge } from "./llm-judge.js";
import { evaluateKeywords } from "./keywords.js";

export async function evaluate(
  runResult: RunResult,
  testCase: TestCase
): Promise<EvaluationResult> {
  const [llmScore, keywordScore] = await Promise.all([
    evaluateWithLlmJudge(runResult, testCase),
    Promise.resolve(evaluateKeywords(runResult, testCase)),
  ]);

  const scores: EvaluationScore[] = [llmScore, keywordScore];
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxTotalScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

  return {
    promptName: runResult.promptName,
    caseId: runResult.caseId,
    output: runResult.output,
    scores,
    totalScore: Math.round(totalScore * 100) / 100,
    maxTotalScore,
  };
}
