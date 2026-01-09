
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(219,39,119,0.3)]">
        {/* Outer Rings */}
        <circle cx="200" cy="200" r="190" stroke="#DB2777" strokeWidth="2" />
        <circle cx="200" cy="200" r="184" stroke="#DB2777" strokeWidth="1" opacity="0.5" />
        
        {/* Inner Ring */}
        <circle cx="200" cy="200" r="140" stroke="#DB2777" strokeWidth="2" strokeDasharray="10 5" opacity="0.3" />

        {/* Warren Buffett Bust Silhouette */}
        <g stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hair and Head Outline */}
          <path d="M165 105C165 85 180 75 200 75C220 75 235 85 235 105C235 115 232 125 228 130" />
          <path d="M172 105C172 95 185 90 200 90C215 90 228 95 228 105" opacity="0.6" />
          
          {/* Ears */}
          <path d="M165 110C160 110 158 115 158 122C158 130 162 135 165 135" />
          <path d="M235 110C240 110 242 115 242 122C242 130 238 135 235 135" />

          {/* Glasses */}
          <rect x="175" y="115" width="22" height="15" rx="2" />
          <rect x="203" y="115" width="22" height="15" rx="2" />
          <path d="M197 122H203" />

          {/* Face Details */}
          <path d="M185 145C190 148 210 148 215 145" opacity="0.7" /> {/* Mouth */}
          <path d="M195 132V138L200 140" opacity="0.5" /> {/* Nose */}

          {/* Suit and Tie */}
          <path d="M158 155L135 180V250H265V180L242 155" />
          <path d="M200 155V190" /> {/* Tie line */}
          <path d="M185 155L200 170L215 155" /> {/* Lapels/Collar */}
        </g>

        {/* Rising Chart Arrow (W-Shape) */}
        <g stroke="#DB2777" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M140 280L180 220L210 260L250 160" />
          <path d="M235 160H250V175" /> {/* Arrowhead */}
          
          {/* Book/Foundation at bottom */}
          <path d="M140 280L200 310L260 280V250H140V280Z" fill="#020617" opacity="0.8" />
          <path d="M140 250L130 265L200 295L270 265L260 250" />
        </g>

        {/* Logo Text "ASK WARREN" */}
        <text 
          x="200" 
          y="345" 
          fill="#DB2777" 
          fontFamily="'Crimson Pro', serif" 
          fontSize="44" 
          fontWeight="700" 
          textAnchor="middle" 
          letterSpacing="2"
        >
          ASK WARREN
        </text>
        
        {/* Decorative inner arcs from image */}
        <path d="M100 200C100 144.772 144.772 100 200 100" stroke="#DB2777" strokeWidth="1" opacity="0.2" />
        <path d="M300 200C300 255.228 255.228 300 200 300" stroke="#DB2777" strokeWidth="1" opacity="0.2" />
      </svg>
    </div>
  );
};

export default Logo;
