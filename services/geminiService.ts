import { GoogleGenAI } from "@google/genai";
import { Accent, SpeakingStyle } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GenerateSpeechParams {
  text: string;
  voiceName: string; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  accent: Accent;
  style: SpeakingStyle;
  speed: number; // 0.5 to 2.0 (mapped from UI)
  pitch: number; // -20 to 20 (mapped from UI)
}

export const generateSpeech = async ({
  text,
  voiceName,
  accent,
  style,
  speed,
  pitch
}: GenerateSpeechParams): Promise<string> => {
  
  // Map speed/pitch to prompt instructions
  let speedInstruction = '';
  if (speed <= 0.7) speedInstruction = 'Speak very slowly.';
  else if (speed <= 0.9) speedInstruction = 'Speak slowly.';
  else if (speed >= 1.3) speedInstruction = 'Speak fast.';
  else if (speed >= 1.6) speedInstruction = 'Speak very fast.';

  let pitchInstruction = '';
  if (pitch <= -10) pitchInstruction = 'Use a very deep voice.';
  else if (pitch < -2) pitchInstruction = 'Use a deeper voice.';
  else if (pitch >= 10) pitchInstruction = 'Use a very high-pitched voice.';
  else if (pitch > 2) pitchInstruction = 'Use a slightly higher pitch voice.';

  const instructions = `
    Act as a professional voice actor native to ${accent}.
    You are reading a script with the following emotional tone: ${style}.
    ${speedInstruction}
    ${pitchInstruction}
    
    IMPORTANT:
    [pausa] = Pause for exactly 2 seconds.
    [risa] = Laugh naturally.
    [grito] = Scream or shout the phrase energetically and loudly.
    [llanto] = Cry or sob briefly.
    [sorpresa] = Make a surprised gasp or expression.
    
    Do not read the tags literally. Perform the sound.
    Read the script below clearly in Spanish.
  `;

  // We prepend instructions to the text because gemini-2.5-flash-preview-tts
  // might ignore systemInstruction in some contexts, but follows text prompts well.
  const fullPrompt = `${instructions}\n\nScript:\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      config: {
        responseModalities: ['AUDIO'], // Using string literal 'AUDIO' to avoid import issues
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      const textPart = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textPart) {
         console.warn("Model returned text:", textPart);
      }
      throw new Error("No audio data returned from Gemini.");
    }

    return audioData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};