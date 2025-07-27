export function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
}

export function escapeMarkdownV2(text: string) {
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1')
}
