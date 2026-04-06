import { runPipeline } from "./pipeline.js";

function parseArgs(args: string[]): {
  prompts: string[];
  cases: string;
} {
  const prompts: string[] = [];
  let cases = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prompts") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        prompts.push(args[i]);
        i++;
      }
      i--;
    } else if (args[i] === "--cases") {
      cases = args[++i];
    }
  }

  return { prompts, cases };
}

async function main(): Promise<void> {
  const { prompts, cases } = parseArgs(process.argv.slice(2));

  if (prompts.length === 0 || !cases) {
    console.log(
      "Usage: npx tsx src/index.ts --prompts <prompt1.json> [prompt2.json ...] --cases <cases.json>"
    );
    process.exit(1);
  }

  await runPipeline(prompts, cases);
}

main().catch((error: unknown) => {
  console.error("Pipeline failed:", error);
  process.exit(1);
});
