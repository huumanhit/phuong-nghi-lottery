"use client";
import { useState, useEffect } from "react";

const PHONE = "0989007772";
const PHONE_DISPLAY = "0989 007 772";

const MESSAGES = [
  "Phương Thức Linh Động",
  "Thanh Toán Tận Nơi",
  "Uy Tín & Bảo Mật",
];

/** Inline SVG lucky coin badge */
function LuckyCoin() {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cg" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#FFF176" />
          <stop offset="45%"  stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
        <radialGradient id="inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FF1A1A" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
        <filter id="gs">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFD700" floodOpacity="0.9"/>
        </filter>
      </defs>

      {/* Outer spinning dashed ring */}
      <circle cx="29" cy="29" r="27" fill="none" stroke="#FFD700" strokeWidth="1.5"
              strokeDasharray="4 3" style={{ animation: "spinRing 6s linear infinite", transformOrigin: "29px 29px" }} />

      {/* Main gold coin */}
      <circle cx="29" cy="29" r="23" fill="url(#cg)" filter="url(#gs)" />

      {/* Red inner circle */}
      <circle cx="29" cy="29" r="16" fill="url(#inner)" />

      {/* Inner gold ring */}
      <circle cx="29" cy="29" r="16" fill="none" stroke="#FFD700" strokeWidth="1" />

      {/* 福 character (Fortune) */}
      <text x="29" y="35.5" textAnchor="middle"
            fill="#FFD700" fontSize="17" fontWeight="900"
            fontFamily="serif" style={{ letterSpacing: 0 }}>
        福
      </text>

      {/* 4 corner dots on gold ring */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 29 + 19.5 * Math.cos(rad);
        const y = 29 + 19.5 * Math.sin(rad);
        return <circle key={deg} cx={x} cy={y} r="2" fill="#8B0000" />;
      })}
    </svg>
  );
}

export default function PromoBanner() {
  const [msgIdx, setMsgIdx]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <a
        href={`tel:${PHONE}`}
        className="block w-full cursor-pointer select-none"
        style={{ textDecoration: "none" }}
      >
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl"
          style={{
            background: "linear-gradient(100deg, #5C0000 0%, #A80000 20%, #D00000 40%, #E80000 50%, #D00000 60%, #A80000 80%, #5C0000 100%)",
            border: "2.5px solid #FFD700",
            boxShadow: "0 4px 24px rgba(180,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.3)",
          }}
        >
          {/* Top gold bar */}
          <div className="h-1 w-full" style={{
            background: "linear-gradient(90deg, transparent, #FFD700 20%, #FFF176 50%, #FFD700 80%, transparent)",
            backgroundSize: "200% 100%",
            animation: "barSlide 2s linear infinite",
          }} />

          {/* Coin pattern bg */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle, #FFD700 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }} />

          {/* Shine sweep */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(112deg, transparent 25%, rgba(255,230,100,0.18) 50%, transparent 75%)",
            backgroundSize: "300% 100%",
            animation: "shine 3.5s linear infinite",
          }} />

          {/* Content row */}
          <div className="relative flex items-center px-3 sm:px-5 py-2 gap-3 sm:gap-5">

            {/* Left — custom lucky coin, floating */}
            <div className="flex-shrink-0" style={{ animation: "float 2.2s ease-in-out infinite" }}>
              <LuckyCoin />
            </div>

            {/* Center text */}
            <div className="flex-1 text-center min-w-0">
              <div
                className="font-extrabold uppercase tracking-[0.22em]"
                style={{
                  fontSize: "10px",
                  color: "#FFD700",
                  textShadow: "0 0 10px rgba(255,215,0,1)",
                  animation: "glow 2s ease-in-out infinite",
                }}
              >
                ★ ĐỔI SỐ TRÚNG ★
              </div>

              <div
                className="font-black leading-none my-0.5 whitespace-nowrap"
                style={{
                  fontSize: "clamp(18px, 5vw, 32px)",
                  color: "#FFFFFF",
                  textShadow: "0 2px 10px rgba(0,0,0,0.6), 0 0 24px rgba(255,200,0,0.5)",
                  animation: "phonePulse 1.3s ease-in-out infinite",
                  letterSpacing: "0.07em",
                }}
              >
                {PHONE_DISPLAY}
              </div>

              <div style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#FFE566",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                transition: "opacity 0.3s ease",
                opacity: visible ? 1 : 0,
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}>
                {MESSAGES[msgIdx]}
              </div>
            </div>

            {/* Right — pulsing call button */}
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
              <div
                className="rounded-full flex items-center justify-center text-2xl"
                style={{
                  width: "44px",
                  height: "44px",
                  background: "radial-gradient(circle at 35% 35%, #FFF176, #FFD700 55%, #B8860B)",
                  boxShadow: "0 0 0 3px rgba(255,215,0,0.3), 0 0 16px rgba(255,215,0,0.6)",
                  animation: "ringPulse 1.6s ease-in-out infinite",
                }}
              >
                📞
              </div>
              <span style={{ fontSize: "8px", fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Gọi ngay
              </span>
            </div>
          </div>

          {/* Bottom gold bar */}
          <div className="h-1 w-full" style={{
            background: "linear-gradient(90deg, transparent, #FFD700 20%, #FFF176 50%, #FFD700 80%, transparent)",
            backgroundSize: "200% 100%",
            animation: "barSlide 2s linear infinite reverse",
          }} />
        </div>
      </a>

      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes shine {
          0%   { background-position: -300% 0; }
          100% { background-position: 300% 0;  }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-5px); }
        }
        @keyframes phonePulse {
          0%, 100% { transform: scale(1);     }
          50%       { transform: scale(1.035); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 6px  rgba(255,215,0,0.8); }
          50%       { text-shadow: 0 0 20px rgba(255,215,0,1), 0 0 40px rgba(255,150,0,0.5); }
        }
        @keyframes barSlide {
          0%   { background-position: 0% 0;   }
          100% { background-position: 200% 0; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,215,0,0.25), 0 0 10px rgba(255,215,0,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(255,215,0,0.15), 0 0 22px rgba(255,215,0,0.9); }
        }
      `}</style>
    </>
  );
}
