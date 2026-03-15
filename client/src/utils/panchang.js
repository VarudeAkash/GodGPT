// Vedic Panchang — pure JS astronomical calculations
// Formulas from Jean Meeus "Astronomical Algorithms" (simplified for practical accuracy)

const AYANAMSHA_2000 = 23.853; // Lahiri ayanamsha at J2000
const AYANAMSHA_RATE = 0.0136; // degrees per year

export const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
];

const TITHI_PAKSHA = [
  ...Array(15).fill('Shukla Paksha'),
  ...Array(15).fill('Krishna Paksha'),
];

export const NAKSHATRA_NAMES = [
  { name: 'Ashwini',           ruler: 'Ketu',    deity: 'Ashwini Kumaras' },
  { name: 'Bharani',           ruler: 'Venus',   deity: 'Yama' },
  { name: 'Krittika',          ruler: 'Sun',     deity: 'Agni' },
  { name: 'Rohini',            ruler: 'Moon',    deity: 'Brahma' },
  { name: 'Mrigashira',        ruler: 'Mars',    deity: 'Soma' },
  { name: 'Ardra',             ruler: 'Rahu',    deity: 'Rudra' },
  { name: 'Punarvasu',         ruler: 'Jupiter', deity: 'Aditi' },
  { name: 'Pushya',            ruler: 'Saturn',  deity: 'Brihaspati' },
  { name: 'Ashlesha',          ruler: 'Mercury', deity: 'Sarpa' },
  { name: 'Magha',             ruler: 'Ketu',    deity: 'Pitru' },
  { name: 'Purva Phalguni',    ruler: 'Venus',   deity: 'Bhaga' },
  { name: 'Uttara Phalguni',   ruler: 'Sun',     deity: 'Aryaman' },
  { name: 'Hasta',             ruler: 'Moon',    deity: 'Savitar' },
  { name: 'Chitra',            ruler: 'Mars',    deity: 'Vishwakarma' },
  { name: 'Swati',             ruler: 'Rahu',    deity: 'Vayu' },
  { name: 'Vishakha',          ruler: 'Jupiter', deity: 'Indragni' },
  { name: 'Anuradha',          ruler: 'Saturn',  deity: 'Mitra' },
  { name: 'Jyeshtha',          ruler: 'Mercury', deity: 'Indra' },
  { name: 'Mula',              ruler: 'Ketu',    deity: 'Nirrti' },
  { name: 'Purva Ashadha',     ruler: 'Venus',   deity: 'Apas' },
  { name: 'Uttara Ashadha',    ruler: 'Sun',     deity: 'Vishvadevas' },
  { name: 'Shravana',          ruler: 'Moon',    deity: 'Vishnu' },
  { name: 'Dhanishtha',        ruler: 'Mars',    deity: 'Ashta Vasus' },
  { name: 'Shatabhisha',       ruler: 'Rahu',    deity: 'Varuna' },
  { name: 'Purva Bhadrapada',  ruler: 'Jupiter', deity: 'Aja Ekapada' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn',  deity: 'Ahir Budhnya' },
  { name: 'Revati',            ruler: 'Mercury', deity: 'Pushan' },
];

export const YOGA_NAMES = [
  { name: 'Vishkambha',  quality: 'inauspicious' },
  { name: 'Priti',       quality: 'auspicious' },
  { name: 'Ayushman',    quality: 'auspicious' },
  { name: 'Saubhagya',   quality: 'auspicious' },
  { name: 'Shobhana',    quality: 'auspicious' },
  { name: 'Atiganda',    quality: 'inauspicious' },
  { name: 'Sukarma',     quality: 'auspicious' },
  { name: 'Dhriti',      quality: 'auspicious' },
  { name: 'Shula',       quality: 'inauspicious' },
  { name: 'Ganda',       quality: 'inauspicious' },
  { name: 'Vriddhi',     quality: 'auspicious' },
  { name: 'Dhruva',      quality: 'auspicious' },
  { name: 'Vyaghata',    quality: 'inauspicious' },
  { name: 'Harshana',    quality: 'auspicious' },
  { name: 'Vajra',       quality: 'inauspicious' },
  { name: 'Siddhi',      quality: 'auspicious' },
  { name: 'Vyatipata',   quality: 'inauspicious' },
  { name: 'Variyan',     quality: 'neutral' },
  { name: 'Parigha',     quality: 'inauspicious' },
  { name: 'Shiva',       quality: 'auspicious' },
  { name: 'Siddha',      quality: 'auspicious' },
  { name: 'Sadhya',      quality: 'auspicious' },
  { name: 'Shubha',      quality: 'auspicious' },
  { name: 'Shukla',      quality: 'auspicious' },
  { name: 'Brahma',      quality: 'auspicious' },
  { name: 'Indra',       quality: 'auspicious' },
  { name: 'Vaidhriti',   quality: 'inauspicious' },
];

export const VARA_NAMES = [
  { name: 'Ravivara',    english: 'Sunday',    planet: 'Sun' },
  { name: 'Somavara',    english: 'Monday',    planet: 'Moon' },
  { name: 'Mangalavara', english: 'Tuesday',   planet: 'Mars' },
  { name: 'Budhavara',   english: 'Wednesday', planet: 'Mercury' },
  { name: 'Guruvara',    english: 'Thursday',  planet: 'Jupiter' },
  { name: 'Shukravara',  english: 'Friday',    planet: 'Venus' },
  { name: 'Shanivara',   english: 'Saturday',  planet: 'Saturn' },
];

// Rahukala: which 1/8 segment of the day (1-indexed from sunrise)
const RAHUKALA_PART = [8, 2, 7, 5, 6, 4, 3]; // Sun Mon Tue Wed Thu Fri Sat

const KARANA_NAMES = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];

export const RASHI_NAMES = [
  { id: 'mesh',      name: 'Mesh',      english: 'Aries',       symbol: '♈' },
  { id: 'vrishabh',  name: 'Vrishabh',  english: 'Taurus',      symbol: '♉' },
  { id: 'mithun',    name: 'Mithun',    english: 'Gemini',       symbol: '♊' },
  { id: 'kark',      name: 'Kark',      english: 'Cancer',       symbol: '♋' },
  { id: 'simha',     name: 'Simha',     english: 'Leo',          symbol: '♌' },
  { id: 'kanya',     name: 'Kanya',     english: 'Virgo',        symbol: '♍' },
  { id: 'tula',      name: 'Tula',      english: 'Libra',        symbol: '♎' },
  { id: 'vrishchik', name: 'Vrishchik', english: 'Scorpio',      symbol: '♏' },
  { id: 'dhanu',     name: 'Dhanu',     english: 'Sagittarius',  symbol: '♐' },
  { id: 'makar',     name: 'Makar',     english: 'Capricorn',    symbol: '♑' },
  { id: 'kumbh',     name: 'Kumbh',     english: 'Aquarius',     symbol: '♒' },
  { id: 'meen',      name: 'Meen',      english: 'Pisces',       symbol: '♓' },
];

const HINDU_MONTHS = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha',
  'Shravana','Bhadrapada','Ashwin','Kartik',
  'Margashirsha','Pausha','Magha','Phalguna',
];

// ── Core Astronomy ──────────────────────────────────────────

function getJulianDay(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440;
  let year = y, month = m;
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5;
}

function getSunLongitudeTropical(jd) {
  const n = jd - 2451545.0;
  const L = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360 + 360) % 360) * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return ((lambda % 360) + 360) % 360;
}

function getMoonLongitudeTropical(jd) {
  const n = jd - 2451545.0;
  const L = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
  const M = (((134.963 + 13.064993 * n) % 360 + 360) % 360) * Math.PI / 180;
  const F = (((93.272  + 13.229350 * n) % 360 + 360) % 360) * Math.PI / 180;
  const lambda = L
    + 6.289 * Math.sin(M)
    - 1.274 * Math.sin(2 * F - M)
    + 0.658 * Math.sin(2 * F)
    - 0.186 * Math.sin(M)
    - 0.059 * Math.sin(2 * F - 2 * M)
    + 0.053 * Math.sin(2 * F + M);
  return ((lambda % 360) + 360) % 360;
}

function getAyanamsha(jd) {
  const yearsSince2000 = (jd - 2451545.0) / 365.25;
  return AYANAMSHA_2000 + AYANAMSHA_RATE * yearsSince2000;
}

function toSidereal(tropicalLong, jd) {
  return ((tropicalLong - getAyanamsha(jd)) % 360 + 360) % 360;
}

// ── Sunrise / Sunset ────────────────────────────────────────

function getSunTimings(date, lat, lng) {
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const jd = getJulianDay(noon);
  const n = jd - 2451545.0;
  const L = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360 + 360) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180;
  const decl = Math.asin(Math.sin(23.45 * Math.PI / 180) * Math.sin(lambda));
  const latRad = lat * Math.PI / 180;
  const cosH = (Math.cos(90.833 * Math.PI / 180) - Math.sin(latRad) * Math.sin(decl))
              / (Math.cos(latRad) * Math.cos(decl));
  if (cosH < -1 || cosH > 1) return { sunrise: null, sunset: null };
  const H = Math.acos(cosH) * 180 / Math.PI;
  const B = (360 / 365) * (n - 81) * Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solarNoon = 12 - lng / 15 - eot / 60;
  const srDecimal = solarNoon - H / 15 + 5.5; // IST
  const ssDecimal = solarNoon + H / 15 + 5.5;
  return {
    sunrise: { hours: Math.floor(srDecimal) % 24, minutes: Math.round((srDecimal % 1) * 60) },
    sunset:  { hours: Math.floor(ssDecimal) % 24, minutes: Math.round((ssDecimal % 1) * 60) },
  };
}

function formatTime(t) {
  if (!t) return '--:--';
  const h = ((t.hours % 24) + 24) % 24;
  const m = Math.max(0, Math.min(59, t.minutes));
  const suffix = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2,'0')} ${suffix}`;
}

function addMins(t, mins) {
  const total = t.hours * 60 + t.minutes + mins;
  return { hours: Math.floor(total / 60) % 24, minutes: total % 60 };
}

function getRahukala(vara, sunrise, sunset) {
  if (!sunrise || !sunset) return { start: '--', end: '--' };
  const dayMins = (sunset.hours * 60 + sunset.minutes) - (sunrise.hours * 60 + sunrise.minutes);
  const part = dayMins / 8;
  const partIdx = RAHUKALA_PART[vara] - 1;
  const startMins = sunrise.hours * 60 + sunrise.minutes + partIdx * part;
  return {
    start: formatTime({ hours: Math.floor(startMins / 60), minutes: Math.round(startMins % 60) }),
    end:   formatTime({ hours: Math.floor((startMins + part) / 60), minutes: Math.round((startMins + part) % 60) }),
  };
}

// ── Main export ──────────────────────────────────────────────

export function getTodayPanchang(date = new Date(), lat = 28.6139, lng = 77.2090) {
  // Use noon for stable daily values
  const calcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const jd = getJulianDay(calcDate);

  const sunTrop  = getSunLongitudeTropical(jd);
  const moonTrop = getMoonLongitudeTropical(jd);
  const sunSid   = toSidereal(sunTrop, jd);
  const moonSid  = toSidereal(moonTrop, jd);

  // Tithi — 12° elongation each
  const elongation   = ((moonTrop - sunTrop) % 360 + 360) % 360;
  const tithiIndex   = Math.floor(elongation / 12);
  const tithi = {
    index:  tithiIndex + 1,
    name:   TITHI_NAMES[tithiIndex],
    paksha: TITHI_PAKSHA[tithiIndex],
    pct:    Math.round((elongation % 12) / 12 * 100),
  };

  // Nakshatra — 13°20' each (sidereal moon)
  const nakshatraIndex = Math.floor(moonSid / (360 / 27));
  const nakshatra = {
    index: nakshatraIndex + 1,
    ...NAKSHATRA_NAMES[nakshatraIndex],
    pct: Math.round((moonSid % (360 / 27)) / (360 / 27) * 100),
  };

  // Yoga — (sun + moon) / (360/27)
  const yogaLong  = ((sunSid + moonSid) % 360 + 360) % 360;
  const yogaIndex = Math.floor(yogaLong / (360 / 27));
  const yoga = { index: yogaIndex + 1, ...YOGA_NAMES[yogaIndex] };

  // Karana — half-tithi
  const halfTithi = Math.floor(elongation / 6);
  const karana = { name: KARANA_NAMES[halfTithi % 7], index: halfTithi + 1 };

  // Vara
  const vara = date.getDay();
  const varaInfo = VARA_NAMES[vara];

  // Sunrise / Sunset
  const { sunrise, sunset } = getSunTimings(date, lat, lng);

  // Abhijit Muhurta (midday ± 24 min)
  let abhijit = null;
  if (sunrise && sunset) {
    const midMins = (sunrise.hours * 60 + sunrise.minutes + sunset.hours * 60 + sunset.minutes) / 2;
    const mid = { hours: Math.floor(midMins / 60), minutes: Math.round(midMins % 60) };
    abhijit = { start: formatTime(addMins(mid, -24)), end: formatTime(addMins(mid, 24)) };
  }

  const rahukala = getRahukala(vara, sunrise, sunset);
  const hinduMonth = HINDU_MONTHS[Math.floor(sunSid / 30)];

  return {
    date: date.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
    hinduMonth,
    vara: varaInfo,
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise: formatTime(sunrise),
    sunset:  formatTime(sunset),
    abhijit,
    rahukala,
    sunRashi:  Math.floor(sunSid  / 30),
    moonRashi: Math.floor(moonSid / 30),
  };
}
