import { createPartFromUri, createUserContent } from "@google/genai";
import { ai } from "./init";

export const uploadOptions = {
  file: '',
  config: { mimeType: "audio/ogg" },
}

export async function upload(file: string) {
  return await ai.files.upload({ ...uploadOptions, file, });
}

export async function getTranscript(file: any) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(file.uri, file.mimeType),
      "Generate a transcript of the speech.",
    ]),
  })
  //@ts-ignore
  const text = response.candidates[0].content?.parts[0].text as string
  return text
}
