'use server';
/**
 * @fileOverview An AI agent to summarize notes and identify key action items.
 *
 * - aiNoteSummarizer - A function that handles the note summarization process.
 * - AiNoteSummarizerInput - The input type for the aiNoteSummarizer function.
 * - AiNoteSummarizerOutput - The return type for the aiNoteSummarizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNoteSummarizerInputSchema = z.object({
  note: z.string().describe('The lengthy note text to be summarized.'),
});
export type AiNoteSummarizerInput = z.infer<typeof AiNoteSummarizerInputSchema>;

const AiNoteSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the note.'),
  actionItems: z
    .array(z.string())
    .describe('A list of key action items extracted from the note.'),
});
export type AiNoteSummarizerOutput = z.infer<
  typeof AiNoteSummarizerOutputSchema
>;

export async function aiNoteSummarizer(
  input: AiNoteSummarizerInput
): Promise<AiNoteSummarizerOutput> {
  return aiNoteSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiNoteSummarizerPrompt',
  input: {schema: AiNoteSummarizerInputSchema},
  output: {schema: AiNoteSummarizerOutputSchema},
  prompt: `You are an assistant specialized in summarizing text and extracting action items.

Summarize the following note text concisely and identify any key action items present in the text.

Note: {{{note}}}`,
});

const aiNoteSummarizerFlow = ai.defineFlow(
  {
    name: 'aiNoteSummarizerFlow',
    inputSchema: AiNoteSummarizerInputSchema,
    outputSchema: AiNoteSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
