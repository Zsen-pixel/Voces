import React from 'react';
import { AudioEntry } from '../types';

interface HistoryProps {
  items: AudioEntry[];
}

const History: React.FC<HistoryProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full mt-8 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Historial de Generaciones
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <p className="text-gray-300 text-sm line-clamp-2 italic">"{item.text}"</p>
              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs text-purple-300">
              <span className="bg-purple-900/40 px-2 py-1 rounded">{item.settings.voice}</span>
              <span className="bg-blue-900/40 px-2 py-1 rounded">{item.settings.accent}</span>
              <span className="bg-pink-900/40 px-2 py-1 rounded">{item.settings.style}</span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <audio controls src={item.blobUrl} className="h-8 w-full max-w-md bg-transparent" />
              <a 
                href={item.blobUrl} 
                download={`adysslinda-${item.id}.wav`}
                className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full transition-colors"
                title="Descargar Audio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;