/**
 * Converts a Float32Array of PCM data to a WAV Blob.
 * Gemini usually returns raw PCM at 24kHz (check model specs).
 */
export function pcmToWav(pcmData: Float32Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length * (bitsPerSample / 8);
  const bufferSize = 44 + dataSize;
  
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    // Convert float (-1.0 to 1.0) to int16 (-32768 to 32767)
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  // Gemini returns raw bytes (PCM), likely Int16 Little Endian if not specified otherwise, 
  // but the JS SDK examples often treat it as raw bytes that need decoding via AudioContext or manual.
  // The safest way without AudioContext (for non-browser environments or pure download) is assuming 
  // standard PCM 16-bit LE.
  
  const int16Array = new Int16Array(len / 2);
  const dataView = new DataView(new Uint8Array(new Uint8Array(len).map((_, i) => binaryString.charCodeAt(i))).buffer);
  
  for (let i = 0; i < len / 2; i++) {
    int16Array[i] = dataView.getInt16(i * 2, true); // Little Endian
  }

  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}