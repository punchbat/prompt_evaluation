# Prompt Evaluation Pipeline

CLI tool for iteratively improving LLM prompts through automated evaluation.

Compare multiple prompt versions against a test suite, score outputs with **LLM-as-judge** + **keyword matching**, and see results in a comparison table.

## How it works

```
Prompts (v1, v2, ...) × Test Cases → Claude generates → Evaluators score → Report
```

1. **Load** — prompt configs + test cases from JSON
2. **Run** — each prompt × each test case → Claude CLI
3. **Evaluate** — LLM-judge (0-10) + keyword overlap (0-5)
4. **Report** — console table + JSON file in `results/`

## Quick start

```bash
npm install
npx tsx src/index.ts --prompts prompts/v1.json prompts/v2.json --cases test-cases/summarization.json
```

Requires [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) authenticated with your account.

## Prompt format

```json
{
  "name": "summarization-v1",
  "system": "You are a concise summarizer.",
  "template": "Summarize in {{maxSentences}} sentences:\n\n{{text}}"
}
```

## Test case format

```json
{
  "id": "case-1",
  "variables": { "text": "...", "maxSentences": "2" },
  "expected": "Key points that should appear",
  "criteria": ["concise", "no hallucination"]
}
```

## Included prompts

| File | Strategy |
|------|----------|
| `v1` | Baseline — minimal instruction |
| `v2` | Constrained — system role + sentence limit |
| `v3` | Structured — bullet point format |
| `v4` | ELI5 — simple language |
| `v5` | Tweet — 280 char limit |
| `v6` | Chain-of-thought — think then summarize |

## Workflow

1. Run pipeline with current prompts
2. Review scores in the comparison table
3. Create a new prompt version (e.g. `v7.json`)
4. Run again and compare
