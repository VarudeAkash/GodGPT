import { useEffect } from 'react';
import DeityIcon from './DeityIcon.jsx';

const PARTICLES = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19];

function DeityTransition({ deity, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1900);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="deity-transition">
      {/* Dark base */}
      <div className="dt-base" />

      {/* Expanding deity-colored radial */}
      <div className="dt-radial" style={{ background: `radial-gradient(circle, ${deity.color} 0%, transparent 70%)` }} />

      {/* Sacred rings expanding from center */}
      <div className="dt-rings">
        <div className="dt-ring dt-ring--1" style={{ borderColor: deity.color }} />
        <div className="dt-ring dt-ring--2" style={{ borderColor: `${deity.color}99` }} />
        <div className="dt-ring dt-ring--3" style={{ borderColor: `${deity.color}55` }} />
        <div className="dt-ring dt-ring--4" style={{ borderColor: `${deity.color}22` }} />
      </div>

      {/* Center content */}
      <div className="dt-center">
        <div className="dt-icon-glow" style={{ background: `radial-gradient(circle, ${deity.color}60 0%, transparent 65%)` }} />
        <div className="dt-icon">
          <DeityIcon id={deity.id} color={deity.color} imageUrl={deity.avatarUrl} size={130} borderRadius={32} />
        </div>
        <div className="dt-name">{deity.name}</div>
        <div className="dt-blessing">{deity.blessing}</div>
      </div>

      {/* Rising particles from bottom */}
      <div className="dt-particles">
        {PARTICLES.map(i => (
          <div
            key={i}
            className="dt-p"
            style={{
              left: `${(i / PARTICLES.length) * 100}%`,
              background: deity.color,
              animationDelay: `${i * 0.07}s`,
              width: i % 3 === 0 ? '10px' : i % 2 === 0 ? '6px' : '4px',
              height: i % 3 === 0 ? '10px' : i % 2 === 0 ? '6px' : '4px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default DeityTransition;
