import { protocol } from 'electron'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { mimeTypeFor } from './mime'

export function registerMediaSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'media',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        bypassCSP: true,
      },
    },
  ])
}

export function registerMediaProtocol(): void {
  protocol.handle('media', handleMediaRequest)
}

async function handleMediaRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url)
  const filePath = decodeURIComponent(pathname.slice(1))

  const result = await stat(filePath)
  if (!result.isFile()) {
    return new Response('Not found', { status: 404 })
  }

  const size = result.size
  const rangeMatch = /bytes=(\d*)-(\d*)/.exec(request.headers.get('Range') ?? '')

  if (rangeMatch) {
    const start = rangeMatch[1] ? Number(rangeMatch[1]) : 0
    const end = rangeMatch[2] ? Number(rangeMatch[2]) : size - 1
    return streamResponse(createReadStream(filePath, { start, end }), {
      'Content-Type': mimeTypeFor(filePath),
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
    }, 206)
  }

  if (size === 0) {
    return streamResponse(createReadStream(filePath), {
      'Content-Type': mimeTypeFor(filePath),
    })
  }

  return streamResponse(createReadStream(filePath), {
    'Content-Type': mimeTypeFor(filePath),
    'Accept-Ranges': 'bytes',
    'Content-Length': String(size),
  })
}

function streamResponse(
  stream: Readable,
  headers: Record<string, string>,
  status = 200,
): Response {
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, { status, headers })
}