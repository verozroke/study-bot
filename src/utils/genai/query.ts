import { GenerateContentParameters } from "@google/genai";
import { ai } from "./init";

export const queryOptions: GenerateContentParameters = {
  model: "gemini-2.5-flash",
  contents: 'default_value',
  config: {
    thinkingConfig: {
      thinkingBudget: 0, // Disables thinking
    },
  }

}
export async function query(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({ ...queryOptions, contents: prompt })
  // @ts-ignore
  const text = response.candidates[0].content?.parts[0].text as string
  return text

}