import type { RunResult, TestCase, EvaluationScore } from "../types.js";

export function evaluateKeywords(
  runResult: RunResult,
  testCase: TestCase
): EvaluationScore {
  const expectedWords = testCase.expected
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  if (expectedWords.length === 0) {
    return { evaluator: "keywords", score: 1, maxScore: 1 };
  }

  const outputLower = runResult.output.toLowerCase();
  const matches = expectedWords.filter((word) => outputLower.includes(word));
  const ratio = matches.length / expectedWords.length;

  return {
    evaluator: "keywords",
    score: Math.round(ratio * 5 * 100) / 100,
    maxScore: 5,
    reasoning: `${matches.length}/${expectedWords.length} key terms found`,
  };
}
