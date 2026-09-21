export const IPC_CHANNELS = {
  VIDEO_OPEN: 'video:open',
} as const

export interface TocaeApi {
  onVideoOpen(callback: (filePath: string) => void): () => void
}