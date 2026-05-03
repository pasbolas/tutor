const DEFAULT_GREETING = {
  title: "Good evening, note explorer.",
  subtitle: "Pick up right where you left off.",
};

const GREETING_STORAGE_KEY = "tutor-dashboard-greeting";

const FALLBACK_GREETINGS = {
  morning: [
    {
      title: "Good morning, bright mind.",
      subtitle: "Warm up the brain and pick up where you left off.",
    },
  ],
  afternoon: [
    {
      title: "Good afternoon, brain fully online.",
      subtitle: "Pick up right where you left off.",
    },
  ],
  evening: [
    {
      title: "Good evening, note explorer.",
      subtitle: "Settle in and pick up where you left off.",
    },
  ],
  night: [
    {
      title: "Night owl mode, but make it useful.",
      subtitle: "One clean note is enough to call it progress.",
    },
  ],
};

function getGreetingPeriod(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "evening";
  }

  return "night";
}

function normalizeGreeting(entry) {
  if (typeof entry === "string") {
    return {
      title: entry,
      subtitle: DEFAULT_GREETING.subtitle,
    };
  }

  return {
    title: typeof entry?.title === "string" && entry.title.trim()
      ? entry.title
      : DEFAULT_GREETING.title,
    subtitle: typeof entry?.subtitle === "string" && entry.subtitle.trim()
      ? entry.subtitle
      : DEFAULT_GREETING.subtitle,
  };
}

function randomIndex(length) {
  if (length <= 1) {
    return 0;
  }

  const cryptoApi = window.crypto || window.msCrypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const values = new Uint32Array(1);
    cryptoApi.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function loadStoredGreeting() {
  try {
    const raw = window.sessionStorage.getItem(GREETING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const data = JSON.parse(raw);
    if (!data || typeof data.key !== "string" || typeof data.period !== "string") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function storeGreeting({ period, key }) {
  try {
    window.sessionStorage.setItem(GREETING_STORAGE_KEY, JSON.stringify({ period, key }));
  } catch {
    // Storage failures should not block the greeting from rendering.
  }
}

function getGreetingKey(entry) {
  const normalized = normalizeGreeting(entry);
  return {
    greeting: normalized,
    key: `${normalized.title}||${normalized.subtitle}`,
  };
}

function pickGreeting(entries, period) {
  const previous = loadStoredGreeting();
  const lastKey = previous && previous.period === period ? previous.key : null;

  if (!Array.isArray(entries) || entries.length === 0) {
    const fallback = normalizeGreeting(DEFAULT_GREETING);
    storeGreeting({ period, key: `${fallback.title}||${fallback.subtitle}` });
    return fallback;
  }

  const attemptLimit = Math.min(entries.length + 2, 8);
  let selection = null;
  let selectionKey = null;

  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const candidate = entries[randomIndex(entries.length)];
    const { greeting, key } = getGreetingKey(candidate);
    selection = greeting;
    selectionKey = key;

    if (!lastKey || entries.length === 1 || key !== lastKey) {
      break;
    }
  }

  if (!selection) {
    const { greeting, key } = getGreetingKey(entries[0]);
    selection = greeting;
    selectionKey = key;
  }

  storeGreeting({ period, key: selectionKey });
  return selection;
}

async function fetchGreetings() {
  try {
    const response = await fetch("./greetings.json", { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // The fallback keeps the dashboard usable if the JSON is mid-edit or unavailable.
  }

  return FALLBACK_GREETINGS;
}

export async function getRandomGreetingForTime(date = new Date()) {
  const period = getGreetingPeriod(date);
  const greetings = await fetchGreetings();
  const entries = Array.isArray(greetings?.[period]) && greetings[period].length
    ? greetings[period]
    : FALLBACK_GREETINGS[period] || [DEFAULT_GREETING];

  return pickGreeting(entries, period);
}

export async function initDashboardGreeting() {
  const greeting = document.querySelector("[data-dashboard-greeting]");
  const subtitle = document.querySelector("[data-dashboard-greeting-subtitle]");

  if (!greeting) {
    return;
  }

  const entry = await getRandomGreetingForTime();
  greeting.textContent = entry.title;

  if (subtitle) {
    subtitle.textContent = entry.subtitle;
  }
}
