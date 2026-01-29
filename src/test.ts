import { generateText, Output, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const { output } = await generateText({
  model: google('gemini-3-pro-preview'),
  tools: {
    weather: tool({
      description: 'Get the weather for a location',
      inputSchema: z.object({ location: z.string() }),
      execute: async ({ location }) => {
        // fetch weather data
        return { temperature: 72, condition: 'sunny' };
      },
    }),
  },
  output: Output.object({
    schema: z.object({
      summary: z.string(),
      recommendation: z.string(),
    }),
  }),
  stopWhen: stepCountIs(5),
  prompt: 'What should I wear in San Francisco today?',
});
console.log({ output });
