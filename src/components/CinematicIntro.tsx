import { useState, useEffect } from 'react';

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800); // fade in "Hey Kavya..."
    const t2 = setTimeout(() => setPhase(2), 3000); // fade in "A gift from Mimin"
    const t3 = setTimeout(() => setPhase(3), 5500); // fade out everything
    const t4 = setTimeout(() => onComplete(), 7000); // unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Generate random hearts
  const hearts = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 4}s`,
    animationDelay: `${Math.random() * 2}s`,
    size: `${Math.random() * 20 + 10}px`,
  }));

  return (
    <div className={`cinematic-overlay ${phase === 3 ? 'fade-out' : ''}`}>
      <div className="hearts-container">
        {hearts.map(h => (
          <div 
            key={h.id} 
            className="floating-heart"
            style={{ 
              left: h.left, 
              animationDuration: h.animationDuration, 
              animationDelay: h.animationDelay,
              fontSize: h.size
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="cinematic-content">
        <h1 className={`cinematic-text ${phase >= 1 ? 'visible' : ''}`}>
          Hey Kavya... ✨
        </h1>
        <h2 className={`cinematic-subtext ${phase >= 2 ? 'visible' : ''}`}>
          Here is a gift from Mimin ❤️
        </h2>
      </div>

      <style>{`
        .cinematic-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .cinematic-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .cinematic-content {
          text-align: center;
          z-index: 2;
          padding: 0 20px;
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .cinematic-text {
          font-family: 'Playfair Display', serif, system-ui;
          font-size: 3rem;
          color: #ffffff;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: all 2s cubic-bezier(0.25, 1, 0.5, 1);
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          margin-bottom: 16px;
          line-height: 1.2;
          text-align: center;
        }

        .cinematic-text.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .cinematic-subtext {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: #ffb6c1; /* Light pink */
          opacity: 0;
          transform: translateY(20px);
          transition: all 2s cubic-bezier(0.25, 1, 0.5, 1);
          letter-spacing: 2px;
        }

        .cinematic-subtext.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hearts-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-heart {
          position: absolute;
          bottom: -50px;
          opacity: 0;
          animation: floatUp linear infinite;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(1.2) rotate(45deg);
            opacity: 0;
          }
        }

        @media (max-width: 480px) {
          .cinematic-text { 
            font-size: 2.2rem; 
            margin-bottom: 12px;
          }
          .cinematic-subtext { 
            font-size: 1.1rem; 
            letter-spacing: 1px;
            padding: 0 10px;
          }
          .floating-heart {
            transform: scale(0.7); /* Make hearts slightly smaller on mobile */
          }
        }
      `}</style>
    </div>
  );
}
