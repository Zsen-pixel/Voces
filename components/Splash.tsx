import React, { useEffect, useState } from 'react';

interface SplashProps {
  onComplete: () => void;
}

const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 1000); // Wait for fade out
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text drop-shadow-2xl">
          adysslinda
        </h1>
        <p className="mt-4 text-gray-400 text-lg tracking-widest uppercase">Texto a Voz Inteligente</p>
      </div>
    </div>
  );
};

export default Splash;