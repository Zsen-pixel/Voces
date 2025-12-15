import React, { useState, useRef } from 'react';
import Splash from './components/Splash';
import History from './components/History';
import { VoiceOption, VoiceGender, Accent, SpeakingStyle, AudioEntry } from './types';
import { generateSpeech } from './services/geminiService';
import { base64ToFloat32Array, pcmToWav } from './services/audioUtils';

// Define the 10 voices mapping to 5 API voices
const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'm1', name: 'Hombre - Estándar', gender: VoiceGender.MALE, apiVoiceName: 'Puck' },
  { id: 'm2', name: 'Hombre - Profundo', gender: VoiceGender.MALE, apiVoiceName: 'Charon' },
  { id: 'm3', name: 'Hombre - Intenso', gender: VoiceGender.MALE, apiVoiceName: 'Fenrir' },
  { id: 'm4', name: 'Hombre - Joven', gender: VoiceGender.MALE, apiVoiceName: 'Puck' }, // Will rely on pitch adjustment in logic if needed, or prompt
  { id: 'm5', name: 'Hombre - Maduro', gender: VoiceGender.MALE, apiVoiceName: 'Charon' },
  { id: 'f1', name: 'Mujer - Estándar', gender: VoiceGender.FEMALE, apiVoiceName: 'Kore' },
  { id: 'f2', name: 'Mujer - Calma', gender: VoiceGender.FEMALE, apiVoiceName: 'Zephyr' },
  { id: 'f3', name: 'Mujer - Narradora', gender: VoiceGender.FEMALE, apiVoiceName: 'Kore' },
  { id: 'f4', name: 'Mujer - Enérgica', gender: VoiceGender.FEMALE, apiVoiceName: 'Zephyr' },
  { id: 'f5', name: 'Mujer - Suave', gender: VoiceGender.FEMALE, apiVoiceName: 'Kore' },
];

const TAGS = [
  { label: 'Pausa (2s)', tag: '[pausa]' },
  { label: 'Risa', tag: '[risa]' },
  { label: 'Grito', tag: '[grito]' },
  { label: 'Llanto', tag: '[llanto]' },
  { label: 'Sorpresa', tag: '[sorpresa]' },
];

function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  // Form State
  const [text, setText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('m1');
  const [selectedAccent, setSelectedAccent] = useState<Accent>(Accent.SPAIN);
  const [selectedStyle, setSelectedStyle] = useState<SpeakingStyle>(SpeakingStyle.NATURAL);
  const [speed, setSpeed] = useState<number>(1.0); // 0.5 to 2.0
  const [pitch, setPitch] = useState<number>(0); // -20 to 20
  
  // App State
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AudioEntry[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = (tag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = text.substring(0, start) + tag + text.substring(end);
      setText(newText);
      // Re-focus and place cursor after tag
      setTimeout(() => {
        if(textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + tag.length, start + tag.length);
        }
      }, 0);
    } else {
      setText(prev => prev + tag);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const voice = VOICE_OPTIONS.find(v => v.id === selectedVoiceId) || VOICE_OPTIONS[0];
      
      const base64Audio = await generateSpeech({
        text,
        voiceName: voice.apiVoiceName,
        accent: selectedAccent,
        style: selectedStyle,
        speed,
        pitch
      });

      // Process Audio
      const pcmData = base64ToFloat32Array(base64Audio);
      const wavBlob = pcmToWav(pcmData);
      const blobUrl = URL.createObjectURL(wavBlob);

      const newEntry: AudioEntry = {
        id: Date.now().toString(),
        text,
        blobUrl,
        timestamp: Date.now(),
        settings: {
          voice: voice.name,
          accent: selectedAccent,
          style: selectedStyle
        }
      };

      setHistory(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Error al generar el audio. Por favor verifica tu API Key y la conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            adysslinda
          </h1>
          <div className="text-xs text-slate-500 font-mono">GEMINI 2.5 TTS</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Voice Selector */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
              <label className="block text-sm font-semibold text-purple-300 mb-3">1. Selector de Voz</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                      selectedVoiceId === voice.id 
                      ? 'bg-purple-600 text-white shadow-purple-500/25 shadow-md' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span>{voice.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${voice.gender === VoiceGender.MALE ? 'bg-blue-900/50 text-blue-200' : 'bg-pink-900/50 text-pink-200'}`}>
                      {voice.gender === VoiceGender.MALE ? 'H' : 'M'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Selector */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
              <label className="block text-sm font-semibold text-blue-300 mb-3">2. Acento</label>
              <select 
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value as Accent)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(Accent).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            {/* Style Selector */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
              <label className="block text-sm font-semibold text-pink-300 mb-3">3. Estilo</label>
              <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as SpeakingStyle)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {Object.values(SpeakingStyle).map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-green-300">4. Velocidad</label>
                  <span className="text-xs text-slate-400">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" 
                  value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-yellow-300">5. Tono</label>
                  <span className="text-xs text-slate-400">{pitch > 0 ? `+${pitch}` : pitch}</span>
                </div>
                <input 
                  type="range" min="-20" max="20" step="1" 
                  value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Grave</span>
                  <span>Agudo</span>
                </div>
              </div>
            </div>

          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-lg flex flex-col h-full min-h-[500px]">
              
              {/* Tags Toolbar */}
              <div className="bg-slate-900 p-3 rounded-t-lg border-b border-slate-700 flex flex-wrap gap-2">
                 <span className="text-xs text-slate-400 self-center mr-2">Etiquetas:</span>
                 {TAGS.map((t) => (
                   <button
                    key={t.tag}
                    onClick={() => handleInsertTag(t.tag)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-600 rounded-full transition-colors"
                   >
                     {t.label}
                   </button>
                 ))}
              </div>

              {/* Text Area */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe aquí el texto que deseas convertir a voz..."
                className="flex-1 w-full bg-slate-900 text-slate-200 p-6 text-lg outline-none resize-none placeholder-slate-600"
              />

              {/* Action Bar */}
              <div className="p-4 bg-slate-900 rounded-b-lg border-t border-slate-700 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !text.trim()}
                  className={`
                    px-8 py-3 rounded-lg font-bold text-white shadow-lg flex items-center gap-2 transition-all
                    ${loading || !text.trim() ? 'bg-slate-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105'}
                  `}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando...
                    </>
                  ) : (
                    <>
                      <span>Generar Audio</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            <History items={history} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;