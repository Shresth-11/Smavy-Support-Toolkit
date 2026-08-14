/* ==========================================================================
   SPLASH SCREEN CONTROLLER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const progressBar = document.getElementById('splash-progress-bar');
  
  if (splash && progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        progressBar.style.width = '100%';
        clearInterval(interval);
        setTimeout(hideSplash, 300);
      } else {
        progressBar.style.width = progress + '%';
      }
    }, 120);

    const hideSplash = () => {
      splash.classList.add('fade-out');
      clearInterval(interval);
    };

    splash.addEventListener('click', hideSplash);
  }
});

/* ==========================================================================
   TAB SWITCHING
   ========================================================================== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    
    const targetView = document.getElementById('view-' + tab.dataset.view);
    if (targetView) {
      targetView.classList.add('active');
    }
    
    if (tab.dataset.view === 'templates' && typeof autoGrow === 'function') {
      autoGrow();
    }
  });
});

/* ==========================================================================
   TIME CONVERTER MODULE
   ========================================================================== */
const ZONES = [
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Australia/Sydney", label: "Australia — Sydney/Melbourne (AEST/AEDT)" },
  { id: "Australia/Brisbane", label: "Australia — Brisbane (AEST)" },
  { id: "Australia/Perth", label: "Australia — Perth (AWST)" },
  { id: "Australia/Adelaide", label: "Australia — Adelaide (ACST/ACDT)" },
  { id: "Europe/London", label: "UK (GMT/BST)" },
  { id: "Asia/Riyadh", label: "Saudi Arabia (AST)" },
  { id: "Asia/Singapore", label: "Singapore (GMT+8)" },
  { id: "America/New_York", label: "USA — Eastern (ET)" },
  { id: "America/Chicago", label: "USA — Central (CT)" },
  { id: "America/Los_Angeles", label: "USA — Pacific (PT)" },
];

const sourceSearch = document.getElementById('sourceSearch');
const sourceTz = document.getElementById('sourceTz');

let customZones = [];
let removedDefaultIds = new Set();

/* Major cities mapping for polished city & country display */
const KNOWN_CITIES = {
  "Asia/Kolkata": { city: "India (IST)", country: "India" },
  "Asia/Calcutta": { city: "India (IST)", country: "India" },
  "Asia/Dubai": { city: "Dubai", country: "United Arab Emirates" },
  "Asia/Tokyo": { city: "Tokyo", country: "Japan" },
  "Asia/Singapore": { city: "Singapore (GMT+8)", country: "Singapore" },
  "Asia/Riyadh": { city: "Saudi Arabia (AST)", country: "Saudi Arabia" },
  "Asia/Bangkok": { city: "Bangkok", country: "Thailand" },
  "Asia/Hong_Kong": { city: "Hong Kong", country: "Hong Kong SAR" },
  "Asia/Shanghai": { city: "Shanghai / Beijing", country: "China" },
  "Asia/Seoul": { city: "Seoul", country: "South Korea" },
  "Asia/Taipei": { city: "Taipei", country: "Taiwan" },
  "Asia/Jakarta": { city: "Jakarta", country: "Indonesia" },
  "Asia/Manila": { city: "Manila", country: "Philippines" },
  "Asia/Karachi": { city: "Karachi", country: "Pakistan" },
  "Asia/Dhaka": { city: "Dhaka", country: "Bangladesh" },
  "Asia/Colombo": { city: "Colombo", country: "Sri Lanka" },
  "Asia/Kathmandu": { city: "Kathmandu", country: "Nepal" },
  "Asia/Tashkent": { city: "Tashkent", country: "Uzbekistan" },
  "Asia/Almaty": { city: "Almaty", country: "Kazakhstan" },
  "Europe/London": { city: "UK (GMT/BST)", country: "United Kingdom" },
  "Europe/Berlin": { city: "Berlin", country: "Germany" },
  "Europe/Paris": { city: "Paris", country: "France" },
  "Europe/Rome": { city: "Rome", country: "Italy" },
  "Europe/Madrid": { city: "Madrid", country: "Spain" },
  "Europe/Amsterdam": { city: "Amsterdam", country: "Netherlands" },
  "Europe/Zurich": { city: "Zurich", country: "Switzerland" },
  "Europe/Vienna": { city: "Vienna", country: "Austria" },
  "Europe/Athens": { city: "Athens", country: "Greece" },
  "Europe/Istanbul": { city: "Istanbul", country: "Turkey" },
  "Europe/Dublin": { city: "Dublin", country: "Ireland" },
  "Europe/Brussels": { city: "Brussels", country: "Belgium" },
  "Europe/Copenhagen": { city: "Copenhagen", country: "Denmark" },
  "Europe/Stockholm": { city: "Stockholm", country: "Sweden" },
  "Europe/Oslo": { city: "Oslo", country: "Norway" },
  "Europe/Helsinki": { city: "Helsinki", country: "Finland" },
  "Europe/Warsaw": { city: "Warsaw", country: "Poland" },
  "Europe/Prague": { city: "Prague", country: "Czech Republic" },
  "Europe/Budapest": { city: "Budapest", country: "Hungary" },
  "America/New_York": { city: "USA — Eastern (ET)", country: "USA" },
  "America/Chicago": { city: "USA — Central (CT)", country: "USA" },
  "America/Los_Angeles": { city: "USA — Pacific (PT)", country: "USA" },
  "America/Denver": { city: "USA — Mountain (MT)", country: "USA" },
  "America/Phoenix": { city: "Phoenix (Arizona)", country: "USA" },
  "America/Toronto": { city: "Toronto", country: "Canada" },
  "America/Vancouver": { city: "Vancouver", country: "Canada" },
  "America/Sao_Paulo": { city: "São Paulo", country: "Brazil" },
  "America/Buenos_Aires": { city: "Buenos Aires", country: "Argentina" },
  "America/Mexico_City": { city: "Mexico City", country: "Mexico" },
  "Australia/Sydney": { city: "Australia — Sydney/Melbourne (AEST/AEDT)", country: "Australia" },
  "Australia/Melbourne": { city: "Melbourne", country: "Australia" },
  "Australia/Brisbane": { city: "Australia — Brisbane (AEST)", country: "Australia" },
  "Australia/Perth": { city: "Australia — Perth (AWST)", country: "Australia" },
  "Australia/Adelaide": { city: "Australia — Adelaide (ACST/ACDT)", country: "Australia" },
  "Pacific/Auckland": { city: "Auckland", country: "New Zealand" },
  "Pacific/Honolulu": { city: "Honolulu (Hawaii)", country: "USA" },
  "Africa/Cairo": { city: "Cairo", country: "Egypt" },
  "Africa/Johannesburg": { city: "Johannesburg", country: "South Africa" },
  "Africa/Nairobi": { city: "Nairobi", country: "Kenya" },
  "Africa/Lagos": { city: "Lagos", country: "Nigeria" },
  "Africa/Casablanca": { city: "Casablanca", country: "Morocco" }
};

function getUtcOffsetString(tz) {
  try {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const parts = dtf.formatToParts(now).reduce((a, p) => { a[p.type] = p.value; return a; }, {});
    const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const diffMin = Math.round((asUTC - now.getTime()) / 60000);
    const sign = diffMin >= 0 ? '+' : '-';
    const abs = Math.abs(diffMin);
    const hrs = String(Math.floor(abs / 60)).padStart(2, '0');
    const mins = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hrs}:${mins}`;
  } catch (e) {
    return 'UTC';
  }
}

function buildZoneDataset() {
  let allTzs = [];
  try {
    allTzs = Intl.supportedValuesOf('timeZone');
  } catch (e) {
    allTzs = Object.keys(KNOWN_CITIES);
  }

  return allTzs.map(id => {
    const offsetStr = getUtcOffsetString(id);
    if (KNOWN_CITIES[id]) {
      const info = KNOWN_CITIES[id];
      return {
        id,
        display: `${info.city}, ${info.country}`,
        label: `${info.city} — ${info.country}`,
        offset: offsetStr,
        searchKey: `${info.city} ${info.country} ${id} ${offsetStr}`.toLowerCase()
      };
    }
    const parts = id.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const region = parts.length > 1 ? parts[0].replace(/_/g, ' ') : '';
    const display = region ? `${city} (${region})` : city;
    return {
      id,
      display,
      label: display,
      offset: offsetStr,
      searchKey: `${display} ${id} ${offsetStr}`.toLowerCase()
    };
  });
}

const zoneDataset = buildZoneDataset();

if (sourceSearch && sourceTz) {
  const initItem = zoneDataset.find(z => z.id === sourceTz.value) || zoneDataset.find(z => z.id === "Asia/Kolkata");
  if (initItem) {
    sourceSearch.value = initItem.display;
    sourceTz.value = initItem.id;
  }
}



const zoneSearch = document.getElementById('zoneSearch');
const addZoneBtn = document.getElementById('addZoneBtn');
const dropdownEl = document.getElementById('autocomplete-dropdown');
let highlightedIndex = -1;

const SEARCH_ALIASES = {
  "Asia/Kolkata": [
    "ist", "india", "indian", "kolkata", "calcutta", "delhi", "new delhi", 
    "mumbai", "bombay", "bangalore", "bengaluru", "hyderabad", "chennai", 
    "madras", "pune", "ahmedabad", "jaipur", "surat", "lucknow", "gurgaon", 
    "gurugram", "noida", "chandigarh", "indore"
  ],
  "Asia/Calcutta": [
    "ist", "india", "indian", "kolkata", "calcutta", "delhi", "new delhi", 
    "mumbai", "bombay", "bangalore", "bengaluru", "hyderabad", "chennai", 
    "madras", "pune", "ahmedabad", "jaipur", "surat", "lucknow", "gurgaon", 
    "gurugram", "noida", "chandigarh", "indore"
  ],
  "Europe/London": [
    "gmt", "bst", "uk", "united kingdom", "london", "england", "britain", "great britain"
  ],
  "America/New_York": [
    "et", "est", "edt", "eastern", "new york", "ny", "nyc", "washington", "dc", "boston", "miami", "atlanta"
  ],
  "America/Chicago": [
    "ct", "cst", "cdt", "central", "chicago", "dallas", "houston", "austin"
  ],
  "America/Los_Angeles": [
    "pt", "pst", "pdt", "pacific", "los angeles", "la", "san francisco", "sf", "seattle", "california"
  ],
  "America/Denver": [
    "mt", "mst", "mdt", "mountain", "denver", "salt lake city"
  ],
  "America/Phoenix": [
    "phoenix", "arizona"
  ],
  "Australia/Sydney": [
    "aest", "aedt", "sydney", "melbourne", "australia", "nsw", "vic"
  ],
  "Australia/Brisbane": [
    "brisbane", "queensland"
  ],
  "Australia/Perth": [
    "awst", "perth"
  ],
  "Australia/Adelaide": [
    "acst", "acdt", "adelaide"
  ],
  "Asia/Riyadh": [
    "ast", "saudi", "saudi arabia", "riyadh", "jeddah", "mecca"
  ],
  "Asia/Dubai": [
    "gst", "dubai", "uae", "united arab emirates", "abu dhabi"
  ],
  "Asia/Singapore": [
    "sgt", "singapore", "sg"
  ],
  "Asia/Tokyo": [
    "jst", "tokyo", "japan"
  ],
  "Europe/Berlin": [
    "cet", "cest", "berlin", "germany", "frankfurt", "munich"
  ],
  "Europe/Paris": [
    "paris", "france"
  ],
  "Asia/Hong_Kong": [
    "hkt", "hong kong", "hk"
  ],
  "Asia/Shanghai": [
    "cst", "china", "shanghai", "beijing"
  ],
  "Asia/Seoul": [
    "kst", "seoul", "korea"
  ],
  "Asia/Bangkok": [
    "ict", "bangkok", "thailand"
  ],
  "America/Toronto": [
    "toronto", "canada", "ontario"
  ],
  "America/Vancouver": [
    "vancouver", "bc"
  ],
  "Pacific/Auckland": [
    "nzst", "nzdt", "auckland", "new zealand", "nz"
  ]
};

function getFilteredMatches(query) {
  query = query.trim().toLowerCase();
  if (!query) return zoneDataset.slice(0, 14);

  const scored = [];

  zoneDataset.forEach(item => {
    let score = 0;
    const dispLower = item.display.toLowerCase();
    const idLower = item.id.toLowerCase();
    const aliases = SEARCH_ALIASES[item.id] || [];

    // Special check for India (IST)
    const isIndiaTz = item.id === "Asia/Kolkata" || item.id === "Asia/Calcutta";
    if (isIndiaTz && (query === "ist" || query === "india" || query === "indian" || query === "delhi" || query === "mumbai" || query === "kolkata" || query === "calcutta" || query === "bangalore")) {
      score += 1000; // Absolute top priority!
    }

    // 1. Alias scoring (World Time Buddy style)
    if (aliases.includes(query)) {
      score += 500; // Perfect match for alias like "ist", "gmt", "india", "delhi", "london"
    } else if (aliases.some(a => a.startsWith(query))) {
      score += 300;
    } else if (aliases.some(a => a.includes(query))) {
      score += 150;
    }

    // 2. Display / Name scoring
    if (dispLower.startsWith(query)) {
      score += 200;
    } else if (dispLower.split(/[\s,()—]+/).some(w => w.startsWith(query))) {
      score += 100;
    } else if (dispLower.includes(query)) {
      score += 50;
    }

    // 3. ID / Search key scoring
    if (idLower.includes(query)) {
      score += 20;
    }

    // 4. Boost known primary cities
    if (KNOWN_CITIES[item.id]) {
      score += 30;
    }

    // 5. Penalty for US Indiana towns (America/Indiana/*) unless explicitly searching Indiana
    if (item.id.startsWith("America/Indiana/") && !query.includes("indiana") && !query.includes("napolis")) {
      score -= 500;
    }

    // 6. Penalty for Indian Ocean territories (Indian/*) unless explicitly searching ocean/island
    if (item.id.startsWith("Indian/") && !query.includes("ocean") && !query.includes("island")) {
      score -= 500;
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.item).slice(0, 14);
}

function renderAutocomplete(query) {
  if (!dropdownEl) return;
  const matches = getFilteredMatches(query);
  
  dropdownEl.innerHTML = '';
  highlightedIndex = -1;

  if (matches.length === 0) {
    dropdownEl.innerHTML = '<div class="ac-empty">No matching city or timezone found</div>';
  } else {
    matches.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'ac-item';
      div.dataset.id = item.id;
      div.dataset.label = item.display;
      div.dataset.index = index;
      div.innerHTML = `
        <div class="ac-main">
          <span class="ac-icon">📍</span>
          <span>${item.display}</span>
        </div>
        <span class="ac-sub">${item.offset}</span>
      `;
      div.addEventListener('click', () => {
        selectZoneItem(item.id, item.display);
      });
      dropdownEl.appendChild(div);
    });
  }
  dropdownEl.classList.add('open');
}

function selectZoneItem(id, display) {
  if (!id) return;
  const alreadyIn = ZONES.some(z => z.id === id) || customZones.some(z => z.id === id);
  if (!alreadyIn) {
    customZones.push({ id, label: display });
    convert();
  }
  if (zoneSearch) zoneSearch.value = '';
  closeDropdown();
}

function closeDropdown() {
  if (dropdownEl) {
    dropdownEl.classList.remove('open');
    dropdownEl.innerHTML = '';
  }
  highlightedIndex = -1;
}

function addZone() {
  if (!zoneSearch) return;
  const val = zoneSearch.value.trim().toLowerCase();
  if (!val) return;

  const matches = getFilteredMatches(val);
  if (matches.length > 0) {
    selectZoneItem(matches[0].id, matches[0].display);
  } else {
    zoneSearch.style.borderColor = '#b4501f';
    setTimeout(() => { zoneSearch.style.borderColor = ''; }, 900);
  }
}

if (addZoneBtn) addZoneBtn.addEventListener('click', addZone);

if (zoneSearch) {
  zoneSearch.addEventListener('input', () => {
    renderAutocomplete(zoneSearch.value);
  });

  zoneSearch.addEventListener('focus', () => {
    renderAutocomplete(zoneSearch.value);
  });

  zoneSearch.addEventListener('keydown', e => {
    const items = dropdownEl ? dropdownEl.querySelectorAll('.ac-item') : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        highlightedIndex = (highlightedIndex + 1) % items.length;
        updateHighlight(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        updateHighlight(items);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        items[highlightedIndex].click();
      } else {
        addZone();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });
}

function updateHighlight(items) {
  items.forEach((item, idx) => {
    if (idx === highlightedIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

const sourceDropdownEl = document.getElementById('source-autocomplete-dropdown');
let sourceHighlightedIndex = -1;

function renderSourceAutocomplete(query) {
  if (!sourceDropdownEl) return;
  const matches = getFilteredMatches(query);
  sourceDropdownEl.innerHTML = '';
  sourceHighlightedIndex = -1;

  if (matches.length === 0) {
    sourceDropdownEl.innerHTML = '<div class="ac-empty">No matching city or timezone found</div>';
  } else {
    matches.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'ac-item';
      div.dataset.id = item.id;
      div.dataset.label = item.display;
      div.dataset.index = index;
      div.innerHTML = `
        <div class="ac-main">
          <span class="ac-icon">📍</span>
          <span>${item.display}</span>
        </div>
        <span class="ac-sub">${item.offset}</span>
      `;
      div.addEventListener('click', () => {
        selectSourceZoneItem(item.id, item.display);
      });
      sourceDropdownEl.appendChild(div);
    });
  }
  sourceDropdownEl.classList.add('open');
}

function selectSourceZoneItem(id, display) {
  if (!id || !sourceTz || !sourceSearch) return;
  sourceTz.value = id;
  sourceSearch.value = display;
  closeSourceDropdown();
  convert();
}

function closeSourceDropdown() {
  if (sourceDropdownEl) {
    sourceDropdownEl.classList.remove('open');
    sourceDropdownEl.innerHTML = '';
  }
  sourceHighlightedIndex = -1;
}

if (sourceSearch) {
  sourceSearch.addEventListener('input', () => {
    renderSourceAutocomplete(sourceSearch.value);
  });

  sourceSearch.addEventListener('focus', () => {
    renderSourceAutocomplete(sourceSearch.value);
  });

  sourceSearch.addEventListener('keydown', e => {
    const items = sourceDropdownEl ? sourceDropdownEl.querySelectorAll('.ac-item') : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        sourceHighlightedIndex = (sourceHighlightedIndex + 1) % items.length;
        updateSourceHighlight(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        sourceHighlightedIndex = (sourceHighlightedIndex - 1 + items.length) % items.length;
        updateSourceHighlight(items);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sourceHighlightedIndex >= 0 && items[sourceHighlightedIndex]) {
        items[sourceHighlightedIndex].click();
      } else {
        const matches = getFilteredMatches(sourceSearch.value);
        if (matches.length > 0) {
          selectSourceZoneItem(matches[0].id, matches[0].display);
        }
      }
    } else if (e.key === 'Escape') {
      closeSourceDropdown();
    }
  });

  sourceSearch.addEventListener('blur', () => {
    setTimeout(() => {
      if (sourceTz && sourceSearch) {
        const cur = zoneDataset.find(z => z.id === sourceTz.value);
        if (cur && (!sourceSearch.value.trim() || sourceDropdownEl?.classList.contains('open'))) {
          sourceSearch.value = cur.display;
        }
      }
    }, 200);
  });
}

function updateSourceHighlight(items) {
  items.forEach((item, idx) => {
    if (idx === sourceHighlightedIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

document.addEventListener('click', e => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    closeDropdown();
    closeSourceDropdown();
  }
});

const dateInput = document.getElementById('dateInput');
const hourInput = document.getElementById('hourInput');
const minInput = document.getElementById('minInput');
const ampmInput = document.getElementById('ampmInput');
const results = document.getElementById('results');

if (hourInput) {
  for (let h = 1; h <= 12; h++) {
    const o = document.createElement('option');
    o.value = h;
    o.textContent = String(h).padStart(2, '0');
    hourInput.appendChild(o);
  }
  hourInput.value = 10;
}

if (minInput) {
  minInput.innerHTML = '';
  for (let m = 0; m < 60; m += 5) {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = String(m).padStart(2, '0');
    minInput.appendChild(o);
  }
  minInput.value = 0;
}

if (ampmInput) ampmInput.value = "AM";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
if (dateInput) dateInput.value = todayStr();

function getOffsetMinutes(tz, date) {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const parts = dtf.formatToParts(date).reduce((a, p) => { a[p.type] = p.value; return a; }, {});
    const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return (asUTC - date.getTime()) / 60000;
  } catch (e) {
    return 330; // fallback +5:30
  }
}

function convert() {
  if (!dateInput || !hourInput || !minInput || !ampmInput || !sourceTz || !results) return;

  const liveToggle = document.getElementById('liveClockToggle');
  const isLive = liveToggle && liveToggle.checked;

  let currentSourceTz = sourceTz.value || "Asia/Kolkata";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: currentSourceTz });
  } catch (e) {
    currentSourceTz = "Asia/Kolkata";
  }

  let instant;
  if (isLive) {
    instant = new Date();
  } else {
    const [y, m, d] = dateInput.value.split('-').map(Number);
    let hh = Number(hourInput.value) % 12;
    if (ampmInput.value === 'PM') hh += 12;
    const mm = Number(minInput.value);

    let guess = Date.UTC(y, m - 1, d, hh, mm);
    for (let i = 0; i < 2; i++) {
      const off = getOffsetMinutes(currentSourceTz, new Date(guess));
      guess = Date.UTC(y, m - 1, d, hh, mm) - off * 60000;
    }
    instant = new Date(guess);
  }

  results.innerHTML = '';
  const allZones = ZONES.filter(z => !removedDefaultIds.has(z.id)).concat(customZones);
  const srcOff = getOffsetMinutes(currentSourceTz, instant);
  
  allZones.forEach(z => {
    try {
      const zOff = getOffsetMinutes(z.id, instant);
      const diffMin = zOff - srcOff;
      let diffStr = '';
      if (z.id === currentSourceTz) {
        diffStr = 'Base Zone';
      } else if (diffMin === 0) {
        diffStr = 'Same time';
      } else {
        const sign = diffMin > 0 ? '+' : '-';
        const abs = Math.abs(diffMin);
        const hours = Math.floor(abs / 60);
        const mins = abs % 60;
        const total = mins ? (hours + Math.round((mins / 60) * 10) / 10) : hours;
        diffStr = `${sign}${total}h ${diffMin > 0 ? 'ahead' : 'behind'}`;
      }

      const dtfOptions = {
        timeZone: z.id, weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      };
      if (isLive) {
        dtfOptions.second = '2-digit';
      }

      const dtf = new Intl.DateTimeFormat('en-US', dtfOptions);
      const parts = dtf.formatToParts(instant).reduce((a, p) => { a[p.type] = (a[p.type] || '') + p.value; return a; }, {});
      const timeStr = isLive 
        ? `${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}`
        : `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
      const dateStr = `${parts.weekday}, ${parts.month} ${parts.day}`;

      const srcDateStr = new Intl.DateTimeFormat('en-US', { timeZone: currentSourceTz, weekday: 'short', month: 'short', day: 'numeric' }).format(instant);
      const dayShift = dateStr !== srcDateStr;

      const card = document.createElement('div');
      card.className = 'card' + (z.id === currentSourceTz ? ' source' : '') + (dayShift ? ' dayshift' : '');
      
      const makeBaseHtml = z.id !== currentSourceTz ? `<button class="make-base-btn" data-id="${z.id}" title="Set as Given In timezone">Make Base</button>` : '';

      card.innerHTML = `
        <button class="remove" data-id="${z.id}" title="Remove">✕</button>
        <div class="label">${z.label}</div>
        <div class="time">${timeStr}</div>
        <div class="card-footer">
          <div class="date">${dateStr}${dayShift ? ' (diff. day)' : ''}</div>
          <div class="card-footer-right">
            <span class="offset-tag">${diffStr}</span>
            ${makeBaseHtml}
          </div>
        </div>
      `;
      results.appendChild(card);
    } catch (err) {
      console.error("Card render error for zone:", z.id, err);
    }
  });

  results.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (customZones.some(z => z.id === id)) {
        customZones = customZones.filter(z => z.id !== id);
      } else {
        removedDefaultIds.add(id);
        if (currentSourceTz === id) {
          const nextId = ZONES.find(z => !removedDefaultIds.has(z.id))?.id || "Asia/Kolkata";
          sourceTz.value = nextId;
          if (sourceSearch) {
            const m = zoneDataset.find(zd => zd.id === nextId);
            if (m) sourceSearch.value = m.display;
          }
        }
      }
      convert();
    });
  });

  results.querySelectorAll('.make-base-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      sourceTz.value = id;
      const m = zoneDataset.find(zd => zd.id === id);
      if (m && sourceSearch) sourceSearch.value = m.display;
      convert();
    });
  });
}

[dateInput, hourInput, minInput, ampmInput, sourceTz].forEach(el => {
  if (el) {
    el.addEventListener('input', convert);
    el.addEventListener('change', convert);
  }
});
convert();

/* ==========================================================================
   MESSAGE TEMPLATES MODULE
   ========================================================================== */
const TEMPLATES = [
  {
    key: "pause_class",
    label: "Pause class — temporarily (until renewal)",
    fields: ["Student Name", "Name"],
    build: f =>
`Mam

Please temporarily pause ${f["Student Name"]} classs 

Once they renew we can resume the class

Keep the slots with you 

Thanks

@${f["Name"]}`
  },
  {
    key: "reminder",
    label: "Parent — class starting reminder (student not joined)",
    fields: [],
    build: () =>
`Dear Parent,

The Smavy instructor is waiting for the student to join the class. Please hurry to avoid missing the session. If you encounter any technical issues, kindly let us know.

Regards,
Support Team`
  },
  {
    key: "tutor_noshow",
    label: "Tutor — no show / late cancellation (owes free class)",
    fields: ["Student Name", "Date"],
    build: f =>
`Dear Tutor,

This is to inform you that your recent class scheduled with ${f["Student Name"]} on ${f["Date"]} will be considered a No Show. As per Smavy Academy's policy, any late cancellation or No Show requires the tutor to provide one compensatory class free of charge to the student.

We request you to kindly schedule this free class at the earliest and share the confirmed timing so we can update the student accordingly.

Please ensure timely communication in the future to avoid inconvenience to students and disruption in class planning.

Thank you for your cooperation.

Regards,
Smavy Support Team`
  },
  {
    key: "parent_noshow",
    label: "Parent — student no show (missed class)",
    fields: ["Student Name", "Subject", "Date"],
    build: f =>
`Dear Parent,

This is to inform you that ${f["Student Name"]} missed the ${f["Subject"]} class scheduled on ${f["Date"]} and it is considered a No Show.

Please ensure cancellations or rescheduling requests are made at least 2 hours before the class time to avoid charges. Late cancellations or no-shows will be charged according to our billing policy.

Similarly, if a teacher cancels a class with less than 2 hours' notice, a complimentary session will be provided.

Thank you for your cooperation.

Best regards,
Support Team
Smavy Academy`
  },
  {
    key: "attendance_discrepancy",
    label: "Tutor — attendance / time discrepancy",
    fields: [
      "Date",
      "Tutor Name",
      "Student Name",
      "Class Scheduled Time (as per calendar)",
      "Class Start Time",
      "Class End Time",
      "Class Duration",
      "Discrepancy Reason",
      "Meeting Link (If class is taken on Zoom or Google Meet)"
    ],
    build: f => {
      const getVal = key => (f[key] && f[key] !== `{${key}}`) ? " " + f[key] : "";
      return `*Attendance*

Date :${getVal("Date")}
Tutor Name :${getVal("Tutor Name")}
Student Name :${getVal("Student Name")}
Class Scheduled Time (as per calendar) :${getVal("Class Scheduled Time (as per calendar)")}
Class Start Time :${getVal("Class Start Time")}
Class End Time :${getVal("Class End Time")}
Class Duration :${getVal("Class Duration")}
Discrepancy Reason :${getVal("Discrepancy Reason")}
Meeting Link (If class is taken on Zoom or Google Meet) :${getVal("Meeting Link (If class is taken on Zoom or Google Meet)")}
*Please fill this and revert after the session, Thankyou.*`;
    }
  },
  {
    key: "tutor_unavailable",
    label: "Parent — tutor unavailable (cancel & reschedule)",
    fields: ["Student Name"],
    build: f =>
`Dear Parent,

We regret to inform you that ${f["Student Name"]}'s English class scheduled today will have to be cancelled as our tutor will be unavailable to conduct the session. We apologize for any inconvenience caused.

May we kindly request your availability to reschedule this class to a later date? Your prompt confirmation would be greatly appreciated.

Thank you for your understanding.

Best regards,
Support Team
Smavy Academy`
  },
  {
    key: "zoom_report",
    label: "Zoom class report (copy-paste form)",
    fields: ["Student", "Subject", "Class", "Date", "Start Time", "End Time", "Duration", "Tutor Name", "Discrepancy Reason", "Link"],
    build: f =>
`Zoom Class
Student: ${f["Student"]}
Subject: ${f["Subject"]}
Class: ${f["Class"]}
Date: ${f["Date"]}
Start time: ${f["Start Time"]}
End time: ${f["End Time"]}
Duration: ${f["Duration"]}
Tutor name: ${f["Tutor Name"]}
Discrepancy reason: ${f["Discrepancy Reason"]}
Link: ${f["Link"]}`
  },
  {
    key: "thanks_report",
    label: "Parent — thank you for class report",
    fields: [],
    build: () =>
`Thank you so much for sharing the class report. 🌸 We truly appreciate your dedication, effort, and the detailed updates on the student's progress. 📚✨ Your timely communication helps us stay informed and better support the child's learning journey. 🌟 Thank you once again for your continued guidance and support. 😊💐`
  },
  {
    key: "no_scheduling_without_parent",
    label: "Tutor — no scheduling without parent request",
    fields: ["Tutor Name"],
    build: f =>
`Hi ${f["Tutor Name"]},

We can only reschedule a class when the request comes from the parent or student. As per our policy, we are not permitted to reschedule classes based on a tutor's request. If you are unavailable at the scheduled class time, the class will need to be cancelled instead.

Thank you for your understanding.`
  },
  {
    key: "email_reminder_feedback",
    label: "Parent — feedback on email reminders (not available yet)",
    fields: [],
    build: () =>
`Hi! Thank you for your valuable feedback.

At the moment, we only have class reminders through the Smavy app. The app automatically sends notifications before each scheduled class. We currently do not have email reminders available.

We will definitely share your suggestion with our development team and explore the possibility of adding email notifications in the future.

Thank you for your feedback and support!`
  },
  {
    key: "how_to_view_homework",
    label: "How to view homework (instructions)",
    fields: [],
    build: () =>
`How to View Homework 📘

You can access homework in two ways:

A. From Course Section
1. Go to Course
2. Select your Subject
3. Open Curriculum
4. View all uploaded materials 📎

B. From Drive
1. Go to Student → Drive
2. Open the uploaded files
3. Download the homework PDF ⬇️

For any help, feel free to reach out here.`
  },
  {
    key: "how_to_upload_homework",
    label: "How to upload homework (instructions)",
    fields: [],
    build: () =>
`How to Upload Homework 📤

You can upload homework using:

A. Web Portal (Drive)
1. Go to Student → Drive
2. Click Upload
3. Select From Local Disk
4. Choose your file and upload 📎

B. Smavy App
1. Take a photo of your answers 📸
2. Open the Smavy app
3. Go to Menu (☰) → Homework
4. Tap + Upload
5. Select and upload images

For any help, feel free to reach out here.`
  },
  {
    key: "parent_late_cancellation",
    label: "Parent — late cancellation (less than 2 hrs notice)",
    fields: ["Student Name", "Subject", "Date"],
    build: f =>
`Dear Parent,

This is to inform you that ${f["Student Name"]}'s ${f["Subject"]} class scheduled on ${f["Date"]} was cancelled less than 2 hours before the scheduled class time and is therefore considered a Late Cancellation.

Please ensure cancellations or rescheduling requests are made at least 2 hours before the class time to avoid charges. Late cancellations or no-shows will be charged according to our billing policy.

Similarly, if a teacher cancels a class with less than 2 hours' notice, a complimentary session will be provided.

Thank you for your cooperation.

Best regards,
Support Team
Smavy Academy`
  },
  {
    key: "smavy_app_intro",
    label: "Parent — Smavy App introduction & download links",
    fields: [],
    build: () =>
`Dear Parents,

🌟 We’re excited to introduce the Smavy App 📱 to make managing your child’s classes easier and more convenient.

With the app, you can:
📌 Receive class updates & reminders
📅 Check class schedules
💬 Communicate with teachers regarding homework and assignments

You can use your existing Smavy login credentials to sign in.

📲 Android: https://play.google.com/store/apps/details?id=com.smavy.smavylms
📲 iOS: https://apps.apple.com/in/app/smavy/id1613489851

For any assistance, please feel free to contact us. 😊

Thank you!`
  }
];

const templateList = document.getElementById('templateList');
const templateSearch = document.getElementById('templateSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const tplCountBadge = document.getElementById('tplCountBadge');
let currentCategory = 'all';
let currentKey = TEMPLATES[0].key;

// Categorize templates
const CAT_MAP = {
  pause_class: "tutor",
  reminder: "parent",
  tutor_noshow: "tutor",
  parent_noshow: "parent",
  attendance_discrepancy: "attendance",
  tutor_unavailable: "parent",
  zoom_report: "attendance",
  thanks_report: "parent",
  no_scheduling_without_parent: "tutor",
  email_reminder_feedback: "guide",
  how_to_view_homework: "guide",
  how_to_upload_homework: "guide",
  parent_late_cancellation: "parent",
  smavy_app_intro: "parent"
};

function renderTemplateList() {
  if (!templateList) return;
  const q = templateSearch ? templateSearch.value.toLowerCase().trim() : '';
  if (clearSearchBtn) clearSearchBtn.style.display = q ? 'block' : 'none';

  const filtered = TEMPLATES.filter(t => {
    const matchesCat = currentCategory === 'all' || (CAT_MAP[t.key] && CAT_MAP[t.key] === currentCategory);
    const matchesQuery = !q || t.label.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  if (tplCountBadge) {
    tplCountBadge.textContent = `${filtered.length}`;
  }

  templateList.innerHTML = '';
  if (filtered.length === 0) {
    templateList.innerHTML = '<div class="tpl-empty">No matching templates found.</div>';
    return;
  }
  if (!filtered.some(t => t.key === currentKey)) {
    currentKey = filtered[0].key;
    renderFields();
  }
  filtered.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tpl-item' + (t.key === currentKey ? ' selected' : '');
    item.textContent = t.label;
    item.addEventListener('click', () => {
      currentKey = t.key;
      renderTemplateList();
      renderFields();
    });
    templateList.appendChild(item);
  });
}

if (templateSearch) {
  templateSearch.addEventListener('input', renderTemplateList);
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    if (templateSearch) {
      templateSearch.value = '';
      renderTemplateList();
    }
  });
}

// Category filter chip clicks
document.querySelectorAll('.cat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = chip.dataset.cat;
    renderTemplateList();
  });
});

// Quick preset chips for Timezone Converter
document.querySelectorAll('.preset-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const id = chip.dataset.id;
    const item = zoneDataset.find(z => z.id === id);
    if (item) {
      selectZoneItem(item.id, item.display);
    }
  });
});

function setInputsDisabled(disabled) {
  if (dateInput) dateInput.disabled = disabled;
  if (hourInput) hourInput.disabled = disabled;
  if (minInput) minInput.disabled = disabled;
  if (ampmInput) ampmInput.disabled = disabled;
  
  const dateWrap = document.getElementById('dateFieldWrap');
  const timeWrap = document.getElementById('timeFieldWrap');
  if (dateWrap) dateWrap.style.opacity = disabled ? '0.55' : '1';
  if (timeWrap) timeWrap.style.opacity = disabled ? '0.55' : '1';
}

function syncLiveClock() {
  const now = new Date();
  if (dateInput) dateInput.value = now.toISOString().slice(0, 10);
  if (hourInput && minInput && ampmInput) {
    let h = now.getHours();
    const m = Math.floor(now.getMinutes() / 5) * 5;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    hourInput.value = h;
    minInput.value = m;
    ampmInput.value = ampm;
  }
  convert();
}

// Live clock toggle listener
const liveClockToggle = document.getElementById('liveClockToggle');
let liveTimer = null;

if (liveClockToggle) {
  liveClockToggle.addEventListener('change', () => {
    const isLive = liveClockToggle.checked;
    setInputsDisabled(isLive);
    if (isLive) {
      syncLiveClock();
      liveTimer = setInterval(syncLiveClock, 1000);
    } else {
      if (liveTimer) clearInterval(liveTimer);
      convert();
    }
  });
}

const fieldsDiv = document.getElementById('fields');
const output = document.getElementById('output');

function currentTemplate() {
  return TEMPLATES.find(t => t.key === currentKey) || TEMPLATES[0];
}

function renderFields() {
  if (!fieldsDiv) return;
  const t = currentTemplate();
  fieldsDiv.innerHTML = '';
  t.fields.forEach(name => {
    const wrap = document.createElement('div');
    const id = 'f_' + name.replace(/\s+/g, '_');
    wrap.innerHTML = `<label for="${id}">${name}</label><input id="${id}" data-field="${name}" placeholder="${name}">`;
    fieldsDiv.appendChild(wrap);
  });
  fieldsDiv.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', renderOutput);
  });
  renderOutput();
}

function renderOutput() {
  if (!output || !fieldsDiv) return;
  const t = currentTemplate();
  const f = {};
  fieldsDiv.querySelectorAll('input').forEach(inp => {
    f[inp.dataset.field] = inp.value.trim() || `{${inp.dataset.field}}`;
  });
  output.value = t.build(f);
  autoGrow();
}

function autoGrow() {
  if (!output) return;
  output.style.height = 'auto';
  output.style.height = Math.min(output.scrollHeight + 4, window.innerHeight * 0.7) + 'px';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  if (toast && toastText) {
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}

function copyOut() {
  if (!output) return;
  output.select();
  document.execCommand('copy');
  const msg = document.getElementById('copiedMsg');
  if (msg) {
    msg.textContent = 'Copied ✓';
    setTimeout(() => msg.textContent = '', 1500);
  }
  showToast('Message copied to clipboard! 📋');
}

// Make copyOut accessible globally for onclick attribute
window.copyOut = copyOut;

renderTemplateList();
renderFields();
