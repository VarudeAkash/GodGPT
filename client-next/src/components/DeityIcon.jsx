import { useId, useState } from 'react';

function AvatarKrishna({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#8fd2ff" />
          <stop offset="60%" stopColor="#3e7fdc" />
          <stop offset="100%" stopColor="#234b8f" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.22)" />
      <circle cx="50" cy="50" r="31" fill="rgba(255,255,255,0.08)" />
      <path d="M52 84 C49 70,45 53,44 37 C43 27,45 18,50 12" stroke="#f5fbff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M46 71 C36 68,29 63,23 57" stroke="rgba(245,251,255,0.72)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
      <path d="M46 59 C34 54,26 47,22 39" stroke="rgba(245,251,255,0.72)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
      <path d="M46 47 C35 42,28 35,26 27" stroke="rgba(245,251,255,0.66)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M48 67 C60 64,69 58,76 52" stroke="rgba(245,251,255,0.72)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
      <path d="M47 55 C60 50,70 43,77 35" stroke="rgba(245,251,255,0.72)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
      <path d="M47 43 C58 38,67 30,72 21" stroke="rgba(245,251,255,0.66)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="48" cy="16" rx="16" ry="11" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.62)" strokeWidth="2" />
      <ellipse cx="48" cy="16" rx="10" ry="7" fill="rgba(255,255,255,0.24)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" />
      <circle cx="48" cy="16" r="4.2" fill="#f5fbff" />
      <circle cx="48" cy="16" r="1.8" fill="#2f4c87" />
    </svg>
  );
}

function AvatarShiva({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#a58aff" />
          <stop offset="62%" stopColor="#6f4ee5" />
          <stop offset="100%" stopColor="#3b2b8a" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="50" r="31" fill="rgba(255,255,255,0.08)" />
      <line x1="50" y1="86" x2="50" y2="43" stroke="#f4f3ff" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="43" x2="50" y2="16" stroke="#f8f7ff" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M50 40 C43 31,39 24,35 16" stroke="#f5f3ff" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d="M50 40 C57 31,61 24,65 16" stroke="#f5f3ff" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="14.5" rx="4.8" ry="5.8" fill="#f8f7ff" />
      <ellipse cx="34.5" cy="15.8" rx="4.1" ry="5.1" fill="#f4f3ff" />
      <ellipse cx="65.5" cy="15.8" rx="4.1" ry="5.1" fill="#f4f3ff" />
      <path d="M33 57 C43 54,57 54,67 57" stroke="rgba(248,247,255,0.92)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="57" r="3.3" fill="rgba(248,247,255,0.75)" />
      <circle cx="67" cy="57" r="3.3" fill="rgba(248,247,255,0.75)" />
      <ellipse cx="50" cy="77" rx="7" ry="2.8" fill="none" stroke="rgba(248,247,255,0.6)" strokeWidth="2" />
    </svg>
  );
}

function AvatarLakshmi({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffd26d" />
          <stop offset="60%" stopColor="#f3a61a" />
          <stop offset="100%" stopColor="#b46d11" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.22)" />
      <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.08)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 12;
        const cx = 50 + Math.cos(a) * 19;
        const cy = 50 + Math.sin(a) * 19;
        return <ellipse key={i} cx={cx} cy={cy} rx="7.8" ry="13" transform={`rotate(${(i * 30) + 6} ${cx} ${cy})`} fill="rgba(255,255,255,0.84)" />;
      })}
      <circle cx="50" cy="50" r="11.5" fill="#fff7df" stroke="rgba(187,121,29,0.35)" strokeWidth="1.8" />
      <circle cx="50" cy="44.8" r="2.3" fill="rgba(178,116,27,0.48)" />
      <circle cx="55.2" cy="52.8" r="2.2" fill="rgba(178,116,27,0.48)" />
      <circle cx="44.6" cy="52.8" r="2.2" fill="rgba(178,116,27,0.48)" />
    </svg>
  );
}

function AvatarHanuman({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ff8d72" />
          <stop offset="60%" stopColor="#ea373e" />
          <stop offset="100%" stopColor="#9f191e" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="50" r="31" fill="rgba(255,255,255,0.08)" />
      <line x1="50" y1="86" x2="50" y2="44" stroke="#fff5f2" strokeWidth="5.2" strokeLinecap="round" />
      <ellipse cx="50" cy="30" rx="18" ry="16.5" fill="rgba(255,255,255,0.2)" stroke="#fff5f2" strokeWidth="3.2" />
      <ellipse cx="50" cy="30" rx="13.3" ry="12.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,245,242,0.5)" strokeWidth="1.8" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        const x1 = 50 + Math.cos(a) * 12.5;
        const y1 = 30 + Math.sin(a) * 12.5;
        const x2 = 50 + Math.cos(a) * 16;
        const y2 = 30 + Math.sin(a) * 16;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,245,242,0.62)" strokeWidth="2.1" />;
      })}
      <circle cx="50" cy="30" r="4.4" fill="#fff5f2" />
      <circle cx="50" cy="30" r="1.9" fill="rgba(122,31,27,0.45)" />
      <ellipse cx="50" cy="70" rx="8" ry="3.1" fill="none" stroke="rgba(255,245,242,0.62)" strokeWidth="2.1" />
      <ellipse cx="50" cy="77.5" rx="6.2" ry="2.5" fill="none" stroke="rgba(255,245,242,0.44)" strokeWidth="1.8" />
    </svg>
  );
}

function AvatarSaraswati({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#73d9cf" />
          <stop offset="60%" stopColor="#179f91" />
          <stop offset="100%" stopColor="#0d645c" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="52" r="30" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="56" cy="63" rx="24" ry="14" fill="rgba(244,251,255,0.18)" stroke="rgba(244,251,255,0.88)" strokeWidth="3" />
      <path d="M36 59 C29 49,28 39,35 29 C39 22,47 20,53 23" stroke="#f4fbff" strokeWidth="4.8" fill="none" strokeLinecap="round" />
      <circle cx="58" cy="22.5" r="8" fill="rgba(244,251,255,0.16)" stroke="#f4fbff" strokeWidth="3" />
      <path d="M64 22 L75 23.2 L64 27" fill="rgba(244,251,255,0.85)" />
      <circle cx="59.7" cy="21.4" r="1.5" fill="#f4fbff" />
      <circle cx="60.4" cy="21.6" r="0.7" fill="rgba(22,101,94,0.52)" />
      <path d="M34 67 C43 58,58 57,74 62" stroke="rgba(244,251,255,0.58)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M33 73 C44 64,60 63,77 69" stroke="rgba(244,251,255,0.46)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M78 58 C88 51,90 42,88 34" stroke="rgba(244,251,255,0.72)" strokeWidth="3.1" fill="none" strokeLinecap="round" />
      <path d="M80 64 C91 58,94 50,93 42" stroke="rgba(244,251,255,0.55)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AvatarGanesha({ uid }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#83dcff" />
          <stop offset="60%" stopColor="#30afd9" />
          <stop offset="100%" stopColor="#167aa5" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill={`url(#${uid}-bg)`} />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="51" r="31" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="24" cy="48" rx="12.2" ry="18.5" fill="rgba(241,250,255,0.15)" stroke="rgba(241,250,255,0.82)" strokeWidth="2.8" />
      <ellipse cx="76" cy="48" rx="12.2" ry="18.5" fill="rgba(241,250,255,0.15)" stroke="rgba(241,250,255,0.82)" strokeWidth="2.8" />
      <ellipse cx="50" cy="44" rx="24" ry="27" fill="rgba(241,250,255,0.14)" stroke="#f1faff" strokeWidth="3" />
      <circle cx="41" cy="36.5" r="5.3" fill="#f1faff" />
      <circle cx="59" cy="36.5" r="5.3" fill="#f1faff" />
      <circle cx="41.7" cy="37.1" r="2" fill="rgba(19,106,145,0.45)" />
      <circle cx="59.7" cy="37.1" r="2" fill="rgba(19,106,145,0.45)" />
      <path d="M50 53 C42 62,42 76,50 80 C56 83,63 80,62 73" stroke="#f1faff" strokeWidth="5.2" fill="none" strokeLinecap="round" />
      <ellipse cx="61.5" cy="73.2" rx="2.3" ry="2" fill="rgba(241,250,255,0.74)" />
      <path d="M62 52 C70 56,74 62,72 68" stroke="#f1faff" strokeWidth="3.3" fill="none" strokeLinecap="round" />
      <path d="M38 52 C32 54,29 57,30 60" stroke="rgba(241,250,255,0.58)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="26.5" r="2.4" fill="rgba(241,250,255,0.9)" />
    </svg>
  );
}

function DeitySvgAvatar({ id, uid }) {
  if (id === 'shiva') return <AvatarShiva uid={uid} />;
  if (id === 'lakshmi') return <AvatarLakshmi uid={uid} />;
  if (id === 'hanuman') return <AvatarHanuman uid={uid} />;
  if (id === 'saraswati') return <AvatarSaraswati uid={uid} />;
  if (id === 'ganesha') return <AvatarGanesha uid={uid} />;
  return <AvatarKrishna uid={uid} />;
}

function DeityIcon({ id, color, size = 80, borderRadius = 20, imageUrl = '' }) {
  const uidRaw = useId();
  const uid = `deity-${String(uidRaw).replace(/:/g, '')}`;
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedImage = imageUrl && !imageUrl.startsWith('/deities/') ? imageUrl : '';
  const showImage = Boolean(resolvedImage) && !imageFailed;

  return (
    <div
      style={{
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
        boxShadow: '0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {showImage ? (
        <img
          src={resolvedImage}
          alt={`${id} avatar`}
          onError={() => setImageFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
      ) : (
        <DeitySvgAvatar id={id} uid={uid} />
      )}
    </div>
  );
}

export default DeityIcon;
