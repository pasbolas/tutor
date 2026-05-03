const DEFAULT_GREETING = {
  title: "Good evening, note explorer.",
  subtitle: "Pick up right where you left off.",
};

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

  return normalizeGreeting(entries[randomIndex(entries.length)]);
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
