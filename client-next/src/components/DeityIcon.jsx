import { useState } from 'react';

// Custom SVG deity icons — authentic Hindu symbols, modern execution
// Krishna: Morpankh (Peacock Feather) · Shiva: Trishul · Lakshmi: Lotus
// Hanuman: Gada (Mace) · Saraswati: Hamsa (Swan) · Ganesha: Ganesha face

const svgIcons = {

  krishna: (
    // Morpankh — Krishna's peacock feather, most iconic symbol
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Spine */}
      <path d="M26 44 Q24 34 22 24 Q20 16 22 6" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Left vanes */}
      <path d="M23 40 Q18 38 14 35" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M23 34 Q17 31 13 27" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M22 28 Q16 24 14 19" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M22 22 Q17 18 17 13" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Right vanes */}
      <path d="M24 38 Q29 37 33 35" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M23 32 Q28 29 32 26" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M22 26 Q27 22 31 18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M22 20 Q26 16 28 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Eye — outermost ring */}
      <ellipse cx="22" cy="7" rx="7.5" ry="5.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
      {/* Eye — middle ring */}
      <ellipse cx="22" cy="7" rx="5" ry="3.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2"/>
      {/* Eye — inner filled circle */}
      <circle cx="22" cy="7" r="2.4" fill="rgba(255,255,255,0.95)"/>
      {/* Eye — pupil */}
      <circle cx="22" cy="7" r="1" fill="rgba(0,0,0,0.3)"/>
    </svg>
  ),

  shiva: (
    // Trishul — Shiva's trident, the most powerful symbol
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Staff */}
      <line x1="24" y1="44" x2="24" y2="22" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round"/>
      {/* Center prong — tallest */}
      <path d="M24 8 L24 23" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round"/>
      {/* Left prong */}
      <path d="M24 20 Q20 16 17 9" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Right prong */}
      <path d="M24 20 Q28 16 31 9" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Prong tips — filled diamond shapes */}
      <ellipse cx="24" cy="7" rx="2.5" ry="3" fill="white"/>
      <ellipse cx="16.5" cy="8" rx="2" ry="2.5" fill="rgba(255,255,255,0.9)" transform="rotate(-10 16.5 8)"/>
      <ellipse cx="31.5" cy="8" rx="2" ry="2.5" fill="rgba(255,255,255,0.9)" transform="rotate(10 31.5 8)"/>
      {/* Crossbar */}
      <path d="M16 28 Q24 26 32 28" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Crossbar end knobs */}
      <circle cx="15.5" cy="28" r="2" fill="rgba(255,255,255,0.8)"/>
      <circle cx="32.5" cy="28" r="2" fill="rgba(255,255,255,0.8)"/>
      {/* Base knob */}
      <circle cx="24" cy="43.5" r="2.5" fill="rgba(255,255,255,0.85)"/>
      {/* Small ring on staff */}
      <ellipse cx="24" cy="36" rx="3.5" ry="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
    </svg>
  ),

  lakshmi: (
    // Lotus — Lakshmi's sacred flower, symbol of purity and prosperity
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Back row petals (smaller, behind) */}
      <ellipse cx="24" cy="11" rx="3.5" ry="7.5" fill="rgba(255,255,255,0.35)"/>
      <ellipse cx="11" cy="24" rx="7.5" ry="3.5" fill="rgba(255,255,255,0.35)"/>
      <ellipse cx="37" cy="24" rx="7.5" ry="3.5" fill="rgba(255,255,255,0.35)"/>
      <ellipse cx="24" cy="37" rx="3.5" ry="7.5" fill="rgba(255,255,255,0.35)"/>
      {/* Diagonal back petals */}
      <ellipse cx="33" cy="15" rx="3" ry="7" transform="rotate(45 33 15)" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="15" cy="15" rx="3" ry="7" transform="rotate(-45 15 15)" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="33" cy="33" rx="3" ry="7" transform="rotate(-45 33 33)" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="15" cy="33" rx="3" ry="7" transform="rotate(45 15 33)" fill="rgba(255,255,255,0.28)"/>
      {/* Front row petals (larger, in front) */}
      <ellipse cx="24" cy="13" rx="4" ry="8" fill="rgba(255,255,255,0.8)"/>
      <ellipse cx="13" cy="24" rx="8" ry="4" fill="rgba(255,255,255,0.8)"/>
      <ellipse cx="35" cy="24" rx="8" ry="4" fill="rgba(255,255,255,0.8)"/>
      <ellipse cx="24" cy="35" rx="4" ry="8" fill="rgba(255,255,255,0.8)"/>
      {/* Diagonal front petals */}
      <ellipse cx="34" cy="14" rx="3.5" ry="7.5" transform="rotate(45 34 14)" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="14" cy="14" rx="3.5" ry="7.5" transform="rotate(-45 14 14)" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="34" cy="34" rx="3.5" ry="7.5" transform="rotate(-45 34 34)" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="14" cy="34" rx="3.5" ry="7.5" transform="rotate(45 14 34)" fill="rgba(255,255,255,0.7)"/>
      {/* Center */}
      <circle cx="24" cy="24" r="7" fill="white"/>
      {/* Stamen ring */}
      <circle cx="24" cy="24" r="4.5" stroke="rgba(0,0,0,0.12)" strokeWidth="1" fill="none"/>
      {/* Stamen dots */}
      <circle cx="24" cy="20.5" r="1.2" fill="rgba(0,0,0,0.18)"/>
      <circle cx="27" cy="26" r="1.2" fill="rgba(0,0,0,0.18)"/>
      <circle cx="21" cy="26" r="1.2" fill="rgba(0,0,0,0.18)"/>
    </svg>
  ),

  hanuman: (
    // Gada — Hanuman's sacred mace, symbol of strength and devotion
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Handle — tapered */}
      <path d="M24 44 L24 22" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round"/>
      {/* Handle grip rings */}
      <ellipse cx="24" cy="38" rx="4" ry="1.8" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/>
      <ellipse cx="24" cy="33" rx="3.5" ry="1.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <ellipse cx="24" cy="28" rx="3" ry="1.2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
      {/* Gada head — filled circle with depth */}
      <circle cx="24" cy="14" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"/>
      <circle cx="24" cy="14" r="9" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      {/* Head texture — radial lines */}
      <line x1="24" y1="3" x2="24" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="33" y1="6" x2="31" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="14" x2="33" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="33" y1="22" x2="31" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="6" x2="17" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="15" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="22" x2="17" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Center jewel */}
      <circle cx="24" cy="14" r="3.5" fill="rgba(255,255,255,0.9)"/>
      <circle cx="24" cy="14" r="1.5" fill="rgba(0,0,0,0.2)"/>
      {/* Base cap */}
      <circle cx="24" cy="44" r="2.5" fill="rgba(255,255,255,0.85)"/>
    </svg>
  ),

  saraswati: (
    // Hamsa — Saraswati's sacred swan, symbol of wisdom, grace and discernment
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Body */}
      <ellipse cx="27" cy="32" rx="13" ry="9" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
      {/* Neck — graceful S-curve */}
      <path d="M16 28 Q12 22 14 15 Q16 9 21 7" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <circle cx="23" cy="6" r="5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
      {/* Beak */}
      <path d="M27 5.5 L33 6 L27 8" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
      {/* Eye */}
      <circle cx="24" cy="5" r="1.5" fill="white"/>
      <circle cx="24.5" cy="5" r="0.6" fill="rgba(0,0,0,0.4)"/>
      {/* Wing feathers — layered */}
      <path d="M15 34 Q22 27 34 30" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M14 37 Q21 31 35 34" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Tail */}
      <path d="M38 30 Q44 25 43 20" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M39 33 Q46 30 46 24" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Lotus beneath — small */}
      <ellipse cx="27" cy="43" rx="9" ry="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
      <path d="M20 43 Q24 38 27 43 Q30 38 34 43" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none"/>
    </svg>
  ),

  ganesha: (
    // Ganesha — beloved remover of obstacles, stylised divine face
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Left ear — very large, fan-shaped */}
      <ellipse cx="8" cy="21" rx="6.5" ry="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"/>
      <ellipse cx="8" cy="21" rx="4" ry="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      {/* Right ear */}
      <ellipse cx="40" cy="21" rx="6.5" ry="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"/>
      <ellipse cx="40" cy="21" rx="4" ry="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      {/* Head — large dome */}
      <ellipse cx="24" cy="20" rx="14" ry="15" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2"/>
      {/* Crown */}
      <path d="M15 10 Q20 5 24 8 Q28 5 33 10" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="7" r="2" fill="rgba(255,255,255,0.9)"/>
      <circle cx="16" cy="11" r="1.5" fill="rgba(255,255,255,0.7)"/>
      <circle cx="32" cy="11" r="1.5" fill="rgba(255,255,255,0.7)"/>
      {/* Eyes — kind, large */}
      <circle cx="19" cy="18" r="3.5" fill="white"/>
      <circle cx="29" cy="18" r="3.5" fill="white"/>
      <circle cx="19.5" cy="18.5" r="1.5" fill="rgba(0,0,0,0.45)"/>
      <circle cx="29.5" cy="18.5" r="1.5" fill="rgba(0,0,0,0.45)"/>
      <circle cx="19" cy="17.5" r="0.6" fill="white"/>
      <circle cx="29" cy="17.5" r="0.6" fill="white"/>
      {/* Trunk — auspicious right-curling */}
      <path d="M24 26 Q19 32 20 38 Q21 42 25 41 Q28 40 27 37" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Trunk tip ring */}
      <circle cx="26.5" cy="37.5" r="1.5" fill="rgba(255,255,255,0.7)"/>
      {/* Single right tusk */}
      <path d="M30 26 Q36 30 34 36" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Broken left tusk — short */}
      <path d="M18 26 Q14 28 15 30" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Third eye dot — Tilak */}
      <circle cx="24" cy="13" r="1.5" fill="rgba(255,255,255,0.8)"/>
    </svg>
  ),
};

function DeityIcon({ id, color, size = 80, borderRadius = 20, imageUrl = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackSvg = svgIcons[id] || svgIcons.krishna;
  const resolvedImage = imageUrl && !imageUrl.startsWith('/deities/') ? imageUrl : '';
  const showImage = Boolean(resolvedImage) && !imageFailed;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius,
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
      padding: showImage ? 0 : size * 0.12,
    }}>
      {showImage ? (
        <>
          <img
            src={resolvedImage}
            alt={`${id} avatar`}
            onError={() => setImageFailed(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.22))',
            pointerEvents: 'none',
          }} />
        </>
      ) : (
        fallbackSvg
      )}
    </div>
  );
}

export default DeityIcon;
