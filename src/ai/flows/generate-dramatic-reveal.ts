'use server';
/**
 * @fileOverview AI agent to generate a dramatic reveal of Super Art selections.
 *
 * - generateDramaticReveal - A function that generates a dramatic reveal.
 * - GenerateDramaticRevealInput - The input type for the generateDramaticReveal function.
 * - GenerateDramaticRevealOutput - The return type for the generateDramaticReveal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDramaticRevealInputSchema = z.object({
  team1SuperArt: z.string().describe('The Super Art selected by team 1.'),
  team2SuperArt: z.string().describe('The Super Art selected by team 2.'),
});
export type GenerateDramaticRevealInput = z.infer<typeof GenerateDramaticRevealInputSchema>;

const GenerateDramaticRevealOutputSchema = z.object({
  revealText: z.string().describe('The dramatic text reveal of the super arts.'),
});
export type GenerateDramaticRevealOutput = z.infer<typeof GenerateDramaticRevealOutputSchema>;

export async function generateDramaticReveal(input: GenerateDramaticRevealInput): Promise<GenerateDramaticRevealOutput> {
  return generateDramaticRevealFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDramaticRevealPrompt',
  input: {schema: GenerateDramaticRevealInputSchema},
  output: {schema: GenerateDramaticRevealOutputSchema},
  prompt: `Craft a dramatic reveal for the selected Super Arts. Team 1 has chosen {{{team1SuperArt}}}, and Team 2 has chosen {{{team2SuperArt}}}. Build suspense and create a feeling of payoff. The reveal should be in a single paragraph.`,
});

const generateDramaticRevealFlow = ai.defineFlow(
  {
    name: 'generateDramaticRevealFlow',
    inputSchema: GenerateDramaticRevealInputSchema,
    outputSchema: GenerateDramaticRevealOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
