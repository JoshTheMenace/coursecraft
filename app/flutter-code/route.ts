import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Just return a text file as "flutter_code.zip"
  const text = "Fake Flutter code content..."
  const file = new Blob([text], { type: 'application/zip' })
  return new Response(file, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="flutter_code.zip"'
    }
  })
}
