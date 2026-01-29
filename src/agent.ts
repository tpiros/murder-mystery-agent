import { createBashTool } from 'bash-tool';
import { google } from '@ai-sdk/google';
import { generateText, stepCountIs, Output } from 'ai';
import { systemPrompt, taskPrompt } from './prompts.ts';
import { verdictSchema, type Verdict } from './schema.ts';

export async function createDetectiveAgent(files: Record<string, string>) {
  const { tools } = await createBashTool({
    files,
    destination: '/',
  });

  return {
    tools,
    model: google('gemini-3-flash-preview'),
  };
}

export async function investigate(files: Record<string, string>): Promise<Verdict> {
  const { tools, model } = await createDetectiveAgent(files);

  let stepCount = 0;

  const { output } = await generateText({
    model,
    tools,
    output: Output.object({ schema: verdictSchema }),
    stopWhen: stepCountIs(50),
    system: systemPrompt,
    prompt: taskPrompt,
    onStepFinish: ({ toolCalls }) => {
      stepCount++;
      if (toolCalls?.length) {
        for (const call of toolCalls) {
          const input = 'input' in call ? (call.input as Record<string, unknown>) : undefined;
          if (call.toolName === 'bash' && input?.command) {
            console.log(`[${stepCount}] $ ${input.command}`);
          } else if (call.toolName === 'readFile' && input?.path) {
            console.log(`[${stepCount}] read: ${input.path}`);
          } else if (call.toolName === 'writeFile' && input?.path) {
            console.log(`[${stepCount}] write: ${input.path}`);
          } else {
            console.log(`[${stepCount}] ${call.toolName}`);
          }
        }
      }
    },
  });

  return output as Verdict;
}
