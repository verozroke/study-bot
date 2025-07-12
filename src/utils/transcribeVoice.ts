import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const ai = new GoogleGenAI({})

// Загружает файл и возвращает URI
async function uploadAudio(filePath: string) {
  const mime = 'audio/mpeg'  // изменяй по типу файла (ogg, wav)
  return ai.files.upload({
    file: filePath,
    config: { mimeType: mime },
  })
}

/**
 * Транскрибация голосового сообщения с помощью Gemini API
 * @param filePath — путь к файлу (.ogg, .mp3, .wav и т.д.)
 * @returns распознанный текст
 */
export async function transcribeVoice(filePath: string): Promise<string> {
  try {
    const audioFile = await uploadAudio(filePath)

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(audioFile.uri as string, audioFile.mimeType as string),
        'Please transcribe the above audio into Russian text.'
      ]),
    });

    return (response as any).text.trim();
  } catch (err: any) {
    console.error('Ошибка транскрипции Gemini:', err)
    return ''
  }
}
