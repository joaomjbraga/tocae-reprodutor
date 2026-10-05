import { isVideoPath } from '@shared/media'

export function toMediaUrl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const segments = normalized.split('/').map(encodeURIComponent)
  return `media://file/${segments.join('/')}`
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || isVideoPath(file.name)
}
