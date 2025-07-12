export function splitMessage(text: string, limit = 4096): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + limit

    // Попробуй не обрывать посреди слова
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end)
      if (lastSpace > start) end = lastSpace
    }

    chunks.push(text.slice(start, end).trim())
    start = end
  }

  return chunks
}