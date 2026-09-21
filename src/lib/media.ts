export function toMediaUrl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const segments = normalized.split('/').map(encodeURIComponent)
  return `media://file/${segments.join('/')}`
}