export function multerToDomFile(f: Express.Multer.File): File {
  // Create a *new* Uint8Array from the Node Buffer (copies bytes, backed by a normal ArrayBuffer)
  const bytes = new Uint8Array(f.buffer); // <-- key change

  return new File([bytes], f.originalname || 'audio.wav', {
    type: f.mimetype || 'audio/wav',
    lastModified: Date.now(),
  });
}

export async function createBufferFromStream(
  readableStream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  return buffer;
}
