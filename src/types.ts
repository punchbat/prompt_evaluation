export interface PromptConfig {
  name: string;
  system: string;
  template: string;
}

export interface TestCase {
  id: string;
  variables: Record<string, string>;
  expected: string;
  criteria: string[];
}

export interface TestSuite {
  name: string;
  cases: TestCase[];
}

export interface RunResult {
  promptName: string;
  caseId: string;
  input: string;
  output: string;
  latencyMs: number;
}

export interface EvaluationScore {
  evaluator: string;
  score: number;
  maxScore: number;
  reasoning?: string;
}

export interface EvaluationResult {
  promptName: string;
  caseId: string;
  output: string;
  scores: EvaluationScore[];
  totalScore: number;
  maxTotalScore: number;
}

export interface PipelineReport {
  timestamp: string;
  testSuite: string;
  results: EvaluationResult[];
  summary: PromptSummary[];
}

export interface PromptSummary {
  promptName: string;
  averageScore: number;
  maxPossibleScore: number;
  caseCount: number;
}
