import React from 'react';

interface CuckooLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isSinging?: boolean;
  showWaves?: boolean;
  className?: string;
  glow?: boolean;
}

export const CuckooLogo: React.FC<CuckooLogoProps> = ({
  size = 'md',
  isSinging = false,
  showWaves = true,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    hero: 'w-48 h-48 md:w-56 md:h-56',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
    >
      {/* Dynamic Multi-layered Ambient Glow */}
      {glow && (
        <>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#159447]/30 via-[#65E62E]/35 to-[#8AFF42]/45 blur-2xl transition-all duration-700 pointer-events-none ${
              isSinging ? 'scale-160 opacity-100' : 'scale-110 opacity-50'
            }`}
          />
          <div
            className={`absolute inset-2 rounded-full bg-[#8AFF42]/20 blur-md transition-all duration-500 pointer-events-none ${
              isSinging ? 'scale-130 opacity-90 animate-pulse' : 'scale-90 opacity-20'
            }`}
          />
        </>
      )}

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_8px_24px_rgba(101,230,46,0.35)]"
        aria-label="Cuckoo Voice AI Majestic Logo"
      >
        <defs>
          {/* Gradients */}
          {/* Bird Body: Rich emerald into vivid leaf & electric lime */}
          <linearGradient id="massBodyGrad" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8AFF42" />
            <stop offset="28%" stopColor="#65E62E" />
            <stop offset="65%" stopColor="#159447" />
            <stop offset="100%" stopColor="#082D19" />
          </linearGradient>

          {/* Wing Primary Plumes */}
          <linearGradient id="massWingGrad1" x1="50" y1="70" x2="130" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A3FF66" />
            <stop offset="40%" stopColor="#65E62E" />
            <stop offset="80%" stopColor="#12592F" />
            <stop offset="100%" stopColor="#082D19" />
          </linearGradient>

          <linearGradient id="massWingGrad2" x1="60" y1="90" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#65E62E" />
            <stop offset="50%" stopColor="#159447" />
            <stop offset="100%" stopColor="#051C0F" />
          </linearGradient>

          {/* Tail Royal Feathers */}
          <linearGradient id="massTailGrad" x1="20" y1="120" x2="60" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8AFF42" />
            <stop offset="40%" stopColor="#159447" />
            <stop offset="100%" stopColor="#051C0F" />
          </linearGradient>

          {/* Beak Majestic Gold & Lime Gloss */}
          <linearGradient id="massBeakGrad" x1="130" y1="45" x2="180" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F4FFF1" />
            <stop offset="35%" stopColor="#FFE066" />
            <stop offset="75%" stopColor="#8AFF42" />
            <stop offset="100%" stopColor="#159447" />
          </linearGradient>

          {/* Studio Condenser Mic Capsule Metallic Body */}
          <linearGradient id="micMetalShell" x1="85" y1="95" x2="125" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A4A2E" />
            <stop offset="30%" stopColor="#0B2B18" />
            <stop offset="70%" stopColor="#159447" />
            <stop offset="100%" stopColor="#051A0E" />
          </linearGradient>

          {/* Studio Honeycomb Grille Luminescence */}
          <linearGradient id="micGrilleGlow" x1="90" y1="100" x2="120" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F4FFF1" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#8AFF42" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#65E62E" stopOpacity="0.7" />
          </linearGradient>

          {/* Chrome Suspension Rim */}
          <linearGradient id="chromeRing" x1="75" y1="110" x2="135" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8AFF42" />
            <stop offset="50%" stopColor="#F4FFF1" />
            <stop offset="100%" stopColor="#159447" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="massGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8AFF42" floodOpacity="0.6" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#65E62E" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 4 Radiating Epic Sound Waves from Beak */}
        {showWaves && (
          <g className={`transition-all duration-300 ${isSinging ? 'opacity-100' : 'opacity-50'}`}>
            {/* Wave 1: Immediate Crisp Pulse */}
            <path
              d="M 148 58 C 158 50, 158 36, 148 28"
              stroke="#F4FFF1"
              strokeWidth="4"
              strokeLinecap="round"
              className={isSinging ? 'animate-ping origin-center' : ''}
              style={{ animationDuration: '1.2s' }}
            />
            {/* Wave 2: Laser Lime Frequency */}
            <path
              d="M 162 66 C 176 52, 176 30, 162 18"
              stroke="#8AFF42"
              strokeWidth="3.8"
              strokeLinecap="round"
              filter="url(#massGlowFilter)"
              className={isSinging ? 'animate-pulse' : ''}
              style={{ animationDuration: '1s' }}
            />
            {/* Wave 3: Emerald Harmonic Arc */}
            <path
              d="M 176 74 C 194 56, 194 24, 176 8"
              stroke="#65E62E"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Wave 4: Deep Ambient Outer Arc */}
            <path
              d="M 190 82 C 212 60, 212 18, 190 -2"
              stroke="#159447"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Radiant Sound Sparks floating near mouth */}
            {isSinging && (
              <>
                <circle cx="156" cy="42" r="2.5" fill="#F4FFF1" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                <circle cx="170" cy="34" r="2" fill="#8AFF42" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="182" cy="48" r="2" fill="#65E62E" className="animate-ping" style={{ animationDuration: '1.8s' }} />
              </>
            )}
          </g>
        )}

        {/* ================= ROYAL CUCKOO TAIL FEATHERS ================= */}
        <g id="massTail">
          {/* Main Long Steering Feather */}
          <path
            d="M 44 116 C 26 128, 8 148, 12 172 C 15 186, 32 178, 48 152 C 58 136, 56 122, 44 116 Z"
            fill="url(#massTailGrad)"
            stroke="#159447"
            strokeWidth="2"
          />
          {/* Tail feather spine glow */}
          <path d="M 44 122 Q 28 150 20 174" stroke="#8AFF42" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

          {/* Secondary Feather Plume */}
          <path
            d="M 52 128 C 36 142, 22 164, 28 184 C 36 188, 50 174, 62 148 Z"
            fill="#0B381C"
            stroke="#65E62E"
            strokeWidth="1.5"
          />
          <path d="M 48 136 Q 34 162 32 180" stroke="#65E62E" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

          {/* Tertiary Sharp Underside Plume */}
          <path
            d="M 60 140 C 46 156, 38 178, 44 192 C 54 194, 66 176, 72 154 Z"
            fill="#159447"
            opacity="0.9"
          />
        </g>

        {/* ================= BIRD BODY & CHEST ================= */}
        {/* Powerful Torso & Head Contour */}
        <path
          d="M 60 125 C 48 102, 54 68, 76 46 C 94 30, 118 28, 134 44 C 146 56, 150 78, 144 98 C 136 126, 116 148, 84 148 C 68 148, 62 136, 60 125 Z"
          fill="url(#massBodyGrad)"
          stroke="#051C0F"
          strokeWidth="3"
          filter="url(#massGlowFilter)"
        />

        {/* Feather Highlight Layers on Back */}
        <path
          d="M 66 84 C 62 70, 72 54, 86 42 C 92 48, 82 68, 76 86 Z"
          fill="#8AFF42"
          opacity="0.35"
        />

        {/* ================= TRIPLE ROYAL CREST FEATHERS ================= */}
        <g id="massHeadCrest">
          {/* Main Crown Plume */}
          <path
            d="M 106 32 C 112 14, 126 8, 130 18 C 132 24, 124 30, 116 34 Z"
            fill="#8AFF42"
            stroke="#159447"
            strokeWidth="1.8"
          />
          <path d="M 112 28 Q 124 16 126 14" stroke="#F4FFF1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Secondary Forward Plume */}
          <path
            d="M 116 34 C 124 20, 138 18, 140 26 C 142 30, 134 34, 124 36 Z"
            fill="#65E62E"
            stroke="#082D19"
            strokeWidth="1.5"
          />

          {/* Tertiary Subtle Plume */}
          <path
            d="M 98 34 C 100 22, 110 20, 112 28 C 112 32, 106 34, 102 36 Z"
            fill="#159447"
            stroke="#051C0F"
            strokeWidth="1.2"
          />
        </g>

        {/* ================= DYNAMIC MULTI-TIER WINGS ================= */}
        <g id="massWing">
          {/* Base Layer Outer Wing */}
          <path
            d="M 64 96 C 68 76, 90 66, 116 78 C 122 98, 110 124, 82 122 C 70 120, 64 108, 64 96 Z"
            fill="url(#massWingGrad1)"
            stroke="#082D19"
            strokeWidth="2.5"
          />

          {/* Primary Flight Feathers - Layer 2 */}
          <path
            d="M 68 106 C 74 90, 96 82, 118 92 C 124 108, 112 130, 88 128 C 76 126, 70 118, 68 106 Z"
            fill="url(#massWingGrad2)"
            stroke="#159447"
            strokeWidth="1.8"
          />

          {/* Sculpted Feather Veins (Neon Leaf Texture) */}
          <path d="M 74 96 Q 96 90 114 88" stroke="#8AFF42" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M 78 104 Q 98 100 112 98" stroke="#8AFF42" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
          <path d="M 82 114 Q 98 112 108 110" stroke="#8AFF42" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
          <path d="M 86 122 Q 98 120 106 118" stroke="#65E62E" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />

          {/* Edge Specular Flare on Wing Crest */}
          <path d="M 70 88 Q 90 74 112 80" stroke="#F4FFF1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* ================= MAJESTIC SINGING BEAK ================= */}
        {/* Opens dynamically with singing animation */}
        <g
          className={`transition-transform duration-200 origin-[132px_56px] ${
            isSinging ? 'scale-y-125' : 'hover:scale-y-110'
          }`}
        >
          {/* Upper Beak - Sculpted, proud, raised angle */}
          <path
            d="M 130 48 L 158 42 C 152 50, 142 54, 130 55 Z"
            fill="url(#massBeakGrad)"
            stroke="#082D19"
            strokeWidth="2.2"
          />
          {/* Upper Beak Highlight Ridge */}
          <path d="M 132 49 L 154 44" stroke="#F4FFF1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Lower Beak - Acoustic resonance chamber */}
          <path
            d="M 130 55 L 152 54 C 146 61, 136 64, 130 62 Z"
            fill="#8AFF42"
            stroke="#082D19"
            strokeWidth="1.8"
          />

          {/* Inside Singing Throat Glow */}
          <ellipse cx="135" cy="54" rx="4" ry="2.5" fill="#082D19" />
          <circle cx="134" cy="54" r="1.5" fill="#8AFF42" className={isSinging ? 'animate-ping' : ''} />
        </g>

        {/* ================= CHARISMATIC FIERCE EYE ================= */}
        <g id="massEye">
          {/* Emerald Eye Socket shadow */}
          <ellipse cx="112" cy="54" rx="9" ry="8" fill="#051C0F" />
          {/* Outer Iris Ring */}
          <ellipse cx="113" cy="54" rx="7.5" ry="6.8" fill="#159447" />
          {/* Vivid Laser Lime Core */}
          <circle cx="113.5" cy="54" r="5" fill="#8AFF42" />
          {/* Deep Black Pupil */}
          <circle cx="114" cy="54" r="3.2" fill="#051C0F" />
          {/* Primary Specular Star Catchlight */}
          <circle cx="115.5" cy="52" r="1.8" fill="#F4FFF1" />
          {/* Secondary Amber Catchlight */}
          <circle cx="112" cy="56" r="0.9" fill="#FFE566" />
          {/* Brow Accent / Eyeliner (Gives charismatic focus) */}
          <path d="M 104 48 Q 114 46 122 50" stroke="#8AFF42" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ================= STUDIO CONDENSER MICROPHONE CAPSULE ================= */}
        {/* Seamlessly fused into the bird's chest and heart */}
        <g id="massStudioMic">
          {/* Outer Shock Mount Suspension Ring */}
          <path
            d="M 72 108 C 72 134, 126 134, 126 108"
            fill="none"
            stroke="url(#chromeRing)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#massGlowFilter)"
          />

          {/* Suspension Cross Bands */}
          <line x1="74" y1="112" x2="84" y2="120" stroke="#8AFF42" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="124" y1="112" x2="114" y2="120" stroke="#8AFF42" strokeWidth="1.8" strokeLinecap="round" />

          {/* Main Cylindrical Condenser Capsule */}
          <rect
            x="82"
            y="94"
            width="34"
            height="44"
            rx="17"
            fill="url(#micMetalShell)"
            stroke="#8AFF42"
            strokeWidth="2.4"
          />

          {/* Gloss Specular Arc on Left Edge */}
          <path
            d="M 85 106 C 84 116, 84 126, 86 132"
            stroke="#F4FFF1"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Studio Honeycomb Grille Mesh */}
          <rect
            x="86"
            y="100"
            width="26"
            height="22"
            rx="11"
            fill="#051C0F"
            stroke="#65E62E"
            strokeWidth="1.4"
          />

          {/* Precision Grille Slots (Vocal diaphragm vents) */}
          <line x1="91" y1="106" x2="107" y2="106" stroke="url(#micGrilleGlow)" strokeWidth="2" strokeLinecap="round" />
          <line x1="89" y1="111" x2="109" y2="111" stroke="url(#micGrilleGlow)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="89" y1="116" x2="109" y2="116" stroke="url(#micGrilleGlow)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="91" y1="121" x2="107" y2="121" stroke="url(#micGrilleGlow)" strokeWidth="2" strokeLinecap="round" />

          {/* Center Vertical Sound Tube */}
          <line x1="99" y1="98" x2="99" y2="126" stroke="#8AFF42" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />

          {/* Internal VU Meter / Audio Pulse Core */}
          {isSinging && (
            <circle cx="99" cy="111" r="3.5" fill="#F4FFF1" className="animate-ping" style={{ animationDuration: '1s' }} />
          )}

          {/* Capsule Mount Collar & Stem */}
          <rect x="94" y="138" width="10" height="6" rx="2" fill="#8AFF42" stroke="#051C0F" strokeWidth="1.2" />
          <line x1="99" y1="144" x2="99" y2="158" stroke="#8AFF42" strokeWidth="3.2" strokeLinecap="round" />
          {/* Base Stand Mount */}
          <path d="M 88 158 L 110 158" stroke="#65E62E" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 84 162 L 114 162" stroke="#159447" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Ambient Floating Acoustic Particles around the bird */}
        <circle cx="68" cy="42" r="1.5" fill="#8AFF42" opacity="0.6" />
        <circle cx="152" cy="94" r="1.8" fill="#65E62E" opacity="0.7" />
        <circle cx="44" cy="98" r="1.2" fill="#8AFF42" opacity="0.5" />
      </svg>
    </div>
  );
};
