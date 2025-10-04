import React, { useEffect, useMemo, useState } from "react";

// ===========================
// IdleRise • DTG – Cross‑platform PWA
// ===========================
// Features in this single file:
// - k/p/h subdomain level detection
// - Region + Language selectors (world‑ready)
// - JSON content loader: content.global.json + content.{region}.json overrides
// - Ad‑free toggle via cookie or ?adfree=1
// - Responsive layout (mobile → desktop), touch/keyboard friendly
// - Safe‑area support for iOS notches
// - Prefers‑reduced‑motion tweaks
// - Basic compatibility banner for very old browsers
// - PWA registration (service worker)
//
// To finish PWA setup, files are in /public:
//  - manifest.webmanifest
//  - sw.js

// --- Theme (IdleRise / DTG) ---
const THEME = {
  brandName: "IdleRise • DTG",
  accent: {
    light: "from-indigo-50 to-sky-100",
    dark: "from-neutral-900 to-neutral-950",
  },
};

// --- Regions & Languages (world‑ready) ---
const REGIONS = [
  { id: "global", label: "Global" },
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "eu", label: "Europe" },
  { id: "ca", label: "Canada" },
  { id: "au", label: "Australia" },
  { id: "in", label: "India" },
  { id: "sg", label: "Singapore" },
  { id: "za", label: "South Africa" },
  { id: "nz", label: "New Zealand" },
];

const LANGS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "pt", label: "Português" },
  { id: "ar", label: "العربية" },
  { id: "hi", label: "हिन्दी" },
  { id: "zh", label: "中文" },
  { id: "ja", label: "日本語" },
];

// --- Simple icons (inline SVG) ---
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M10 14a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 6"/>
    <path d="M14 10a5 5 0 0 0-7.07 0L4.1 12.83a5 5 0 1 0 7.07 7.07L13 18"/>
  </svg>
);

const LogoIdleRise = () => (
  <svg viewBox="0 0 64 64" className="w-6 h-6" aria-hidden>
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M16 36c6-10 26-10 32 0" fill="none" stroke="url(#g)" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="24" cy="26" r="2.5" fill="currentColor"/>
    <circle cx="40" cy="26" r="2.5" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="11" cy="11" r="7"/>
    <path d="M21 21l-4.3-4.3"/>
  </svg>
);

// --- Thumbnails ---
// If a link object has `img`, we show it. Otherwise we fall back to favicon.
const getHost = (url) => {
  try { return new URL(url).hostname; } catch { return ""; }
};
const getFavicon = (url, size = 64) => {
  const host = getHost(url);
  // Google favicon service (fast, reliable, HTTPS)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
};


// --- Content Config (JSON‑driven) ---
// App loads /content.global.json and optional /content.{region}.json to override.
// DEFAULT_CONTENT is a safe fallback.
const DEFAULT_CONTENT = {
  k: {
    label: "Kindergarten",
    subjects: {
      Maths: [
        { t: "Numberblocks (BBC)", u: "https://www.bbc.co.uk/cbeebies/shows/numberblocks", d: "Counting & number sense games." },
        { t: "Coolmath4Kids Jr.", u: "https://www.coolmath4kids.com/", d: "Foundations: shapes, counting, patterns." },
        { t: "Toy Theater", u: "https://toytheater.com/category/math/", d: "Manipulatives & simple puzzles." },
        { t: "SplashLearn K", u: "https://www.splashlearn.com/math-games-for-kindergarteners", d: "Progressive K maths games." },
        { t: "PBS Kids Maths", u: "https://pbskids.org/games/math/", d: "Maths mini‑games." },
        { t: "Maths Frame EY", u: "https://mathsframe.co.uk/en/resources/category/364/Early-Years", d: "Early years interactives." },
      ],
      Science: [
        { t: "Sid the Science Kid", u: "https://pbskids.org/sid/", d: "Inquiry mini‑games." },
        { t: "Mystery Science Minis", u: "https://mysteryscience.com/mini-lessons", d: "Short visual explainers." },
        { t: "National Geographic Kids", u: "https://kids.nationalgeographic.com/", d: "Animals, videos, quizzes." },
        { t: "Switch Zoo", u: "https://switchzoo.com/", d: "Animal mixing & facts." },
        { t: "PhET Sim: Balancing", u: "https://phet.colorado.edu/en/simulations/category/new?subjects=physics", d: "Simple sims (adult help)." },
        { t: "BBC Bitesize KS1 Science", u: "https://www.bbc.co.uk/bitesize/subjects/z6svr82", d: "Short games & quizzes." },
      ],
      Geography: [
        { t: "National Geo Kids – Places", u: "https://kids.nationalgeographic.com/places/", d: "Maps & places for kids." },
        { t: "Ducksters Geography", u: "https://www.ducksters.com/geography/", d: "Basic world facts." },
        { t: "Sheppard Software Geography Jr", u: "https://www.sheppardsoftware.com/Geography.htm", d: "Beginner map games." },
        { t: "Google Earth Voyager", u: "https://earth.google.com/web/", d: "Guided tours (with help)." },
        { t: "Seterra Jr.", u: "https://online.seterra.com/en", d: "Map click games (easy)." },
        { t: "BBC Bitesize KS1 Geo", u: "https://www.bbc.co.uk/bitesize/subjects/zx6tfg8", d: "Intro geography." },
      ],
      History: [
        { t: "BBC Bitesize KS1 History", u: "https://www.bbc.co.uk/bitesize/subjects/zkqmhyc", d: "Past & present for kids." },
        { t: "Ducksters History", u: "https://www.ducksters.com/history/", d: "Simple history pages." },
        { t: "Smithsonian for Kids", u: "https://www.si.edu/kids", d: "Museum interactives." },
        { t: "British Museum – Young Explorers", u: "https://www.britishmuseum.org/learn/young-explorers", d: "Objects & stories." },
        { t: "UNESCO – Education", u: "https://en.unesco.org/themes/education", d: "Global culture & heritage." },
        { t: "Storyline Online", u: "https://www.storylineonline.net/", d: "Read‑alouds with context." },
      ],
    },
  },
  p: {
    label: "Primary",
    subjects: {
      Maths: [
        { t: "Khan Academy Maths", u: "https://www.khanacademy.org/math", d: "Self‑paced mastery." },
        { t: "NRICH", u: "https://nrich.maths.org/primary", d: "Rich tasks & puzzles." },
        { t: "Math Playground", u: "https://www.mathplayground.com/", d: "Games by topic." },
        { t: "ThatQuiz", u: "https://www.thatquiz.org/", d: "Quick drills." },
        { t: "Transum", u: "https://www.transum.org/", d: "Starter activities." },
        { t: "Times Tables", u: "https://www.timestables.com/", d: "Fluency practice." },
      ],
      Science: [
        { t: "PhET Simulations", u: "https://phet.colorado.edu/", d: "Interactive science sims." },
        { t: "BBC Bitesize Science", u: "https://www.bbc.co.uk/bitesize/primary", d: "Short lessons & quizzes." },
        { t: "Mystery Science", u: "https://mysteryscience.com/", d: "Open‑and‑go lessons." },
        { t: "BrainPOP", u: "https://www.brainpop.com/", d: "Animated explainers." },
        { t: "National Geographic Kids", u: "https://kids.nationalgeographic.com/", d: "Explore science & nature." },
        { t: "Science Kids", u: "https://www.sciencekids.co.nz/", d: "Experiments & games." },
      ],
      Geography: [
        { t: "Seterra Maps", u: "https://online.seterra.com/", d: "World map quizzes." },
        { t: "GeoGuessr (Edu)", u: "https://www.geoguessr.com/", d: "Where in the world?" },
        { t: "Google Earth", u: "https://earth.google.com/web/", d: "3D globe exploration." },
        { t: "BBC Bitesize Geo", u: "https://www.bbc.co.uk/bitesize/primary", d: "Units & quizzes." },
        { t: "World Atlas for Kids", u: "https://kids.worldatlas.com/", d: "Countries & facts." },
        { t: "Sheppard Software Geo", u: "https://www.sheppardsoftware.com/Geography.htm", d: "Country & capital games." },
      ],
      History: [
        { t: "BBC Bitesize History", u: "https://www.bbc.co.uk/bitesize/primary", d: "Ancient to modern." },
        { t: "Ducksters History", u: "https://www.ducksters.com/history/", d: "Student‑friendly articles." },
        { t: "Smithsonian History", u: "https://history.si.edu/", d: "Objects & stories." },
        { t: "British Museum – Schools", u: "https://www.britishmuseum.org/learn/schools", d: "Resources & activities." },
        { t: "Europeana Classroom", u: "https://www.europeana.eu/en/education", d: "Primary sources (EU)." },
        { t: "Library of Congress – Kids", u: "https://www.loc.gov/education/", d: "US primary sources." },
      ],
    },
  },
  h: {
    label: "High School",
    subjects: {
      Maths: [
        { t: "Khan Academy Maths", u: "https://www.khanacademy.org/math", d: "Algebra to calculus." },
        { t: "Desmos", u: "https://www.desmos.com/", d: "Graphing & activities." },
        { t: "MathsIsFun", u: "https://www.mathsisfun.com/", d: "Readable explanations." },
        { t: "Brilliant", u: "https://brilliant.org/", d: "Interactive problem solving." },
        { t: "Transum Secondary", u: "https://www.transum.org/Software/Menu/", d: "Starters & challenges." },
        { t: "OpenStax Maths", u: "https://openstax.org/subjects/math", d: "Free textbooks." },
      ],
      Science: [
        { t: "PhET Simulations", u: "https://phet.colorado.edu/", d: "Physics, chemistry, bio." },
        { t: "ChemCollective", u: "https://chemcollective.org/", d: "Virtual labs." },
        { t: "HHMI BioInteractive", u: "https://www.biointeractive.org/", d: "Stories + interactives." },
        { t: "NOVA Labs", u: "https://www.pbs.org/wgbh/nova/labs/", d: "Interactive labs." },
        { t: "OpenStax Science", u: "https://openstax.org/subjects/science", d: "Free textbooks." },
        { t: "PhET HTML5 filter", u: "https://phet.colorado.edu/en/simulations/filter?type=html,prototype", d: "Device‑friendly sims." },
      ],
      Geography: [
        { t: "Seterra Maps", u: "https://online.seterra.com/", d: "Advanced map quizzes." },
        { t: "GeoGuessr", u: "https://www.geoguessr.com/", d: "Street‑view deduction." },
        { t: "Our World in Data", u: "https://ourworldindata.org/", d: "Dataviz for topics." },
        { t: "World Mapper", u: "https://worldmapper.org/", d: "Cartogram maps." },
        { t: "Gapminder Tools", u: "https://www.gapminder.org/tools/", d: "Animated datasets." },
        { t: "Google Earth Projects", u: "https://earth.google.com/web/", d: "Make tours & layers." },
      ],
      History: [
        { t: "Facing History", u: "https://www.facinghistory.org/", d: "Inquiry & civics." },
        { t: "Smithsonian", u: "https://www.si.edu/", d: "Collections & exhibits." },
        { t: "British Library – Learning", u: "https://www.bl.uk/learning", d: "Primary sources (UK)." },
        { t: "Europeana", u: "https://www.europeana.eu/", d: "Digitised collections (EU)." },
        { t: "Library of Congress", u: "https://www.loc.gov/collections/", d: "Primary sources (US)." },
        { t: "BBC Bitesize GCSE History", u: "https://www.bbc.co.uk/bitesize/subjects/zk26n39", d: "Study guides & quizzes." },
      ],
    },
  },
};

// --- Helpers ---
function mergeContent(base, override) {
  const out = JSON.parse(JSON.stringify(base));
  for (const lvl of ["k", "p", "h"]) {
    if (!override[lvl]) continue;
    out[lvl].label = override[lvl].label || out[lvl].label;
    const subj = override[lvl].subjects || {};
    for (const s of Object.keys(subj)) out[lvl].subjects[s] = subj[s];
  }
  return out;
}

// Detect level from subdomain
function detectLevelFromHostname(hostname) {
  if (!hostname) return "h";
  const first = hostname.split(".")[0];
  if (["k", "kindergarten"].includes(first)) return "k";
  if (["p", "primary"].includes(first)) return "p";
  if (["h", "high"].includes(first)) return "h";
  return "h";
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function LinkCard({ title, url, desc, img }) {
  const fallback = getFavicon(url, 128);
  return (
    <a
      href={url}
      className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 p-4 shadow-sm hover:shadow-md transition-all bg-white/70 dark:bg-neutral-900/70 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-700/60">
          <img
            src={img || fallback}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = fallback; }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:underline underline-offset-4">
            {title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
            {desc}
          </p>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {getHost(url)}
          </div>
        </div>
      </div>
    </a>
  );
}


// Small pill button
function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
        active
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
          : "bg-white/60 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// Tab button
function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 h-10 rounded-xl text-sm font-medium border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
        active
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
          : "bg-white/60 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// --- Main App ---
export default function App() {
  const [level, setLevel] = useState("h");
  const [subject, setSubject] = useState("Science");
  const [query, setQuery] = useState("");
  const [adFree, setAdFree] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [region, setRegion] = useState("global");
  const [lang, setLang] = useState("en");
  const [compatWarning, setCompatWarning] = useState("");

  const getAdFreeFromSource = () => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (["1", "true", "yes"].includes((params.get("adfree") || "").toLowerCase())) return true;
    return document.cookie.split(";").some((c) => c.trim() == "dtg_adfree=true");
  };

  // On mount
  useEffect(() => {
    const detected = detectLevelFromHostname(typeof window !== "undefined" ? window.location.hostname : "");
    setLevel(detected);
    setSubject("Science");
    setAdFree(getAdFreeFromSource());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("region");
      const l = params.get("lang");
      if (r) setRegion(r.toLowerCase());
      if (l) setLang(l.toLowerCase());
    }

    // Compatibility check
    const ok = typeof window !== "undefined" &&
               "fetch" in window &&
               "Promise" in window &&
               typeof window.requestAnimationFrame === "function";
    if (!ok) setCompatWarning("Some features may not work in this old browser.");

    // Register service worker for PWA (best‑effort)
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Persist adFree cookie
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `dtg_adfree=${adFree ? "true" : "false"}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  }, [adFree]);

  // Load global + region override
  useEffect(() => {
    (async () => {
      try {
        let base = DEFAULT_CONTENT;
        try {
          const baseRes = await fetch("/content.global.json", { cache: "no-store" });
          if (baseRes.ok) base = await baseRes.json();
        } catch {}
        let merged = base;
        if (region !== "global") {
          try {
            const regRes = await fetch(`/content.${region}.json`, { cache: "no-store" });
            if (regRes.ok) {
              const reg = await regRes.json();
              merged = mergeContent(base, reg);
            }
          } catch {}
        }
        setContent(merged);
      } catch {}
    })();
  }, [region]);

  const levelObj = content[level];
  const subjects = Object.keys(levelObj.subjects);

  const filteredLinks = useMemo(() => {
    const links = levelObj.subjects[subject] || [];
    if (!query) return links;
    const q = query.toLowerCase();
    return links.filter((l) => [l.t, l.d, l.u].some((x) => (x || "").toLowerCase().includes(q)));
  }, [levelObj, subject, query]);

  // i18n-able labels (UI only)
  const STR = ({
    en: { search: "Search links…", adfree: "Ad‑free", privacy: "Privacy", contact: "Contact", warning: compatWarning },
    es: { search: "Buscar enlaces…", adfree: "Sin anuncios", privacy: "Privacidad", contact: "Contacto", warning: compatWarning },
    fr: { search: "Rechercher des liens…", adfree: "Sans pub", privacy: "Confidentialité", contact: "Contact", warning: compatWarning },
    de: { search: "Links suchen…", adfree: "Werbefrei", privacy: "Datenschutz", contact: "Kontakt", warning: compatWarning },
    pt: { search: "Pesquisar links…", adfree: "Sem anúncios", privacy: "Privacidade", contact: "Contato", warning: compatWarning },
    ar: { search: "ابحث عن الروابط…", adfree: "بدون إعلانات", privacy: "الخصوصية", contact: "اتصال", warning: compatWarning },
    hi: { search: "लिंक खोजें…", adfree: "विज्ञापन‑रहित", privacy: "गोपनीयता", contact: "संपर्क", warning: compatWarning },
    zh: { search: "搜索链接…", adfree: "无广告", privacy: "隐私", contact: "联系", warning: compatWarning },
    ja: { search: "リンクを検索…", adfree: "広告なし", privacy: "プライバシー", contact: "連絡先", warning: compatWarning },
  }[lang] || { search: "Search links…", adfree: "Ad‑free", privacy: "Privacy", contact: "Contact", warning: compatWarning });

  return (
    <div className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${THEME.accent.light} dark:${THEME.accent.dark} text-neutral-900 dark:text-neutral-100`} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-neutral-950/60 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800"><LogoIdleRise /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Downtime Games</div>
              <h1 className="text-lg font-bold leading-tight">{THEME.brandName}</h1>
            </div>
          </div>

          {/* Ad toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm">{STR.adfree}</span>
            <button
              onClick={() => setAdFree((x) => !x)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${adFree ? "bg-green-600" : "bg-neutral-300 dark:bg-neutral-700"}`}
              aria-label="Toggle ad‑free"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${adFree ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Compatibility banner */}
        {compatWarning && (
          <div className="bg-amber-100/90 text-amber-900 text-sm py-2">
            <div className="max-w-6xl mx-auto px-4">{STR.warning}</div>
          </div>
        )}
      </header>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Level Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "k", label: "Kindergarten" },
            { id: "p", label: "Primary" },
            { id: "h", label: "High School" },
          ].map((lv) => (
            <Tab key={lv.id} active={level === lv.id} onClick={() => setLevel(lv.id)}>
              {lv.label}
            </Tab>
          ))}
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {subjects.map((s) => (
            <Pill key={s} active={subject === s} onClick={() => setSubject(s)}>
              {s}
            </Pill>
          ))}
        </div>

        {/* Search + Region/Lang */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STR.search}
              className="bg-transparent outline-none text-sm w-full placeholder:text-neutral-500"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-11 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 text-sm"
            aria-label="Select region"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-11 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 text-sm"
            aria-label="Select language"
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content grid */}
{/* Section heading */}
<h2 className="sr-only">Links</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
  {filteredLinks.map((link) => (
    <LinkCard
      key={slug(link.u)}
      title={link.t}
      url={link.u}
      desc={link.d}
      img={link.img}
    />
  ))}
</div>


        {/* Placeholder Ad area (hidden if adFree) */}
        {!adFree && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm text-neutral-500">
              Ad slot 300×250
            </div>
            <div className="h-32 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm text-neutral-500">
              Ad slot 300×250
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} {THEME.brandName} • Built for school‑safe downtime
          </div>
          <div className="flex gap-2 text-xs">
            <a className="underline underline-offset-4 hover:no-underline" href="#">{/* TODO */}Privacy</a>
            <span>•</span>
            <a className="underline underline-offset-4 hover:no-underline" href="#">{/* TODO */}Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
