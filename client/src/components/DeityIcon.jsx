// Custom SVG deity icons — each represents the deity's most iconic symbol
// Krishna: Bansuri (flute) · Shiva: Trishul · Lakshmi: Lotus
// Hanuman: Gada (mace) · Saraswati: Veena · Ganesha: Elephant head

const svgIcons = {

  krishna: (
    // Bansuri — bamboo flute, diagonal with finger holes
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Bamboo tube */}
      <path d="M9 37 L40 11" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Mouthpiece cap */}
      <path d="M9 37 Q6 40 8 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Finger holes */}
      <circle cx="18" cy="30" r="2.2" fill="rgba(0,0,0,0.35)"/>
      <circle cx="23" cy="25.5" r="2.2" fill="rgba(0,0,0,0.35)"/>
      <circle cx="28" cy="21" r="2.2" fill="rgba(0,0,0,0.35)"/>
      <circle cx="33" cy="16.5" r="2.2" fill="rgba(0,0,0,0.35)"/>
      {/* Highlight on tube */}
      <path d="M10 35 L39 9" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),

  shiva: (
    // Trishul — trident with staff and crossbar
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Staff */}
      <line x1="24" y1="20" x2="24" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Center prong */}
      <line x1="24" y1="7" x2="24" y2="22" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Left prong */}
      <path d="M24 18 Q21 14 18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Right prong */}
      <path d="M24 18 Q27 14 30 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Prong tips */}
      <circle cx="24" cy="7" r="2" fill="white"/>
      <circle cx="17.5" cy="8" r="2" fill="white"/>
      <circle cx="30.5" cy="8" r="2" fill="white"/>
      {/* Crossbar */}
      <line x1="17" y1="30" x2="31" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Base knob */}
      <circle cx="24" cy="43" r="2.5" fill="white"/>
    </svg>
  ),

  lakshmi: (
    // Lotus — 8 petals around a center, water at base
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Back petals (diagonal) */}
      <ellipse cx="32" cy="16" rx="3.5" ry="8" transform="rotate(45 32 16)" fill="white" opacity="0.5"/>
      <ellipse cx="16" cy="16" rx="3.5" ry="8" transform="rotate(-45 16 16)" fill="white" opacity="0.5"/>
      <ellipse cx="32" cy="30" rx="3.5" ry="8" transform="rotate(-45 32 30)" fill="white" opacity="0.5"/>
      <ellipse cx="16" cy="30" rx="3.5" ry="8" transform="rotate(45 16 30)" fill="white" opacity="0.5"/>
      {/* Front petals (cardinal) */}
      <ellipse cx="24" cy="13" rx="4" ry="8" fill="white" opacity="0.8"/>
      <ellipse cx="13" cy="23" rx="8" ry="4" fill="white" opacity="0.8"/>
      <ellipse cx="35" cy="23" rx="8" ry="4" fill="white" opacity="0.8"/>
      <ellipse cx="24" cy="33" rx="4" ry="8" fill="white" opacity="0.8"/>
      {/* Center */}
      <circle cx="24" cy="23" r="6" fill="white"/>
      {/* Stamen dots */}
      <circle cx="24" cy="21" r="1.2" fill="rgba(0,0,0,0.25)"/>
      <circle cx="22" cy="24" r="1.2" fill="rgba(0,0,0,0.25)"/>
      <circle cx="26" cy="24" r="1.2" fill="rgba(0,0,0,0.25)"/>
    </svg>
  ),

  hanuman: (
    // Gada — ceremonial mace with round head and ringed handle
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Handle */}
      <line x1="24" y1="44" x2="24" y2="22" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Handle rings */}
      <ellipse cx="24" cy="32" rx="4.5" ry="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="24" cy="38" rx="3.5" ry="1.5" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
      {/* Gada head */}
      <circle cx="24" cy="14" r="11" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.12)"/>
      {/* Head detail — vertical groove lines */}
      <path d="M20 5 Q18 14 20 23" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M24 4 Q22 14 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M28 5 Q30 14 28 23" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  saraswati: (
    // Veena — classical Indian string instrument
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Resonator body (lower gourd) */}
      <ellipse cx="32" cy="36" rx="9" ry="8" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.1)"/>
      {/* Sound hole */}
      <circle cx="32" cy="36" r="3" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.2)"/>
      {/* Neck */}
      <path d="M24 32 L14 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Upper gourd */}
      <ellipse cx="12" cy="10" rx="5" ry="4.5" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      {/* Scroll/pegbox */}
      <path d="M12 6 Q9 4 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Strings (3) */}
      <line x1="23" y1="31" x2="15" y2="13" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="25" y1="33" x2="16" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="27" y1="35" x2="17" y2="17" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),

  ganesha: (
    // Ganesha head — large head, big ears, curved trunk
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Left ear (large, round) */}
      <ellipse cx="9" cy="20" rx="6" ry="9" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      {/* Right ear */}
      <ellipse cx="39" cy="20" rx="6" ry="9" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
      {/* Head */}
      <ellipse cx="24" cy="19" rx="13" ry="14" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.1)"/>
      {/* Crown */}
      <path d="M16 9 Q20 4 24 7 Q28 4 32 9" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Eyes */}
      <circle cx="19" cy="17" r="2.5" fill="white"/>
      <circle cx="29" cy="17" r="2.5" fill="white"/>
      <circle cx="20" cy="17.5" r="1" fill="rgba(0,0,0,0.5)"/>
      <circle cx="30" cy="17.5" r="1" fill="rgba(0,0,0,0.5)"/>
      {/* Trunk (curves to the right — auspicious) */}
      <path d="M24 23 Q18 30 20 36 Q22 40 26 38" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Right tusk */}
      <path d="M30 23 Q34 28 32 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

const DeityIcon = ({ id, color, size = 80, borderRadius = 20 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius,
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
    padding: size * 0.14,
  }}>
    {svgIcons[id] || svgIcons.krishna}
  </div>
);

export default DeityIcon;
