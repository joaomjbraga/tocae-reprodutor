export const VIDEO_EXTENSIONS = [
  'mp4',
  'webm',
  'mkv',
  'avi',
  'mov',
  'm4v',
  'ogv',
  'ogg',
  'mpg',
  'mpeg',
] as const

export function isVideoPath(source: string): boolean {
  const withoutQuery = source.split(/[?#]/)[0]
  const extension = withoutQuery.slice(withoutQuery.lastIndexOf('.') + 1).toLowerCase()
  return (VIDEO_EXTENSIONS as readonly string[]).includes(extension)
}
