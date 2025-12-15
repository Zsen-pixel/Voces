export enum VoiceGender {
  MALE = 'Hombre',
  FEMALE = 'Mujer'
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  apiVoiceName: string; // Map to Gemini internal names (Puck, Charon, etc.)
}

export enum Accent {
  SPAIN = 'España',
  MEXICO = 'México',
  ARGENTINA = 'Argentina',
  COLOMBIA = 'Colombia',
  VENEZUELA = 'Venezuela'
}

export enum SpeakingStyle {
  HAPPY = 'Alegre',
  SAD = 'Triste',
  WHISPER = 'Susurrar',
  NARRATOR = 'Narrador',
  DEEP = 'Profundo',
  NATURAL = 'Natural',
  ENERGETIC = 'Enérgico' // Mapping user request "Grito" implies energetic style generally, but specific tag is separate
}

export interface AudioEntry {
  id: string;
  text: string;
  blobUrl: string;
  timestamp: number;
  settings: {
    voice: string;
    style: string;
    accent: string;
  };
}

// PCM Wave helper types
export interface WavHeader {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
}