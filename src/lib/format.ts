import { DAYS } from "./constants";
import type { OpeningHoursDay } from "./types";

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 165 → "₺165", 42.5 → "₺42,5" */
export function formatPrice(value: number) {
  return `₺${priceFormatter.format(value)}`;
}

export function trLower(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

/** Turkish-aware, accent-insensitive normalisation for search. */
export function normalizeSearch(value: string) {
  return trLower(value)
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

export function initials(nameOrEmail: string) {
  const base = nameOrEmail.split("@")[0].replace(/[._-]+/g, " ").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toLocaleUpperCase("tr-TR");
}

/** Istanbul-local weekday index where 0 = Monday. */
export function istanbulNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hour = Number(get("hour")) % 24;
  return {
    day: Math.max(0, weekdays.indexOf(get("weekday"))),
    minutes: hour * 60 + Number(get("minute")),
    hour,
  };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function todayStatus(hours: OpeningHoursDay[], date = new Date()) {
  const now = istanbulNow(date);
  const today = hours.find((h) => h.day === now.day);
  if (!today || !today.open) return { open: false, label: "Bugün kapalıyız" };
  const from = toMinutes(today.from);
  const to = toMinutes(today.to);
  const range = `${today.from} – ${today.to}`;
  if (now.minutes < from) return { open: false, label: `Bugün ${range}` };
  if (now.minutes >= to) return { open: false, label: `Bugünlük kapandık · ${range}` };
  return { open: true, label: `Bugün açığız · ${range}` };
}

export function greeting(date = new Date()) {
  const { hour } = istanbulNow(date);
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

/**
 * Collapses consecutive days with identical hours into rows such as
 * "Salı – Cuma · 08:00 – 22:00", as shown on the public site.
 */
export function groupOpeningHours(hours: OpeningHoursDay[]) {
  const sorted = [...hours].sort((a, b) => a.day - b.day);
  const key = (h: OpeningHoursDay) => (h.open ? `${h.from}-${h.to}` : "closed");
  const groups: { days: number[]; value: string }[] = [];
  for (const h of sorted) {
    const last = groups[groups.length - 1];
    const prevDay = last?.days[last.days.length - 1];
    if (last && last.value === key(h) && prevDay === h.day - 1) last.days.push(h.day);
    else groups.push({ days: [h.day], value: key(h) });
  }
  // Show open groups first, closed days last (as in the design).
  return groups
    .map((g) => {
      const first = DAYS[g.days[0]];
      const lastDay = DAYS[g.days[g.days.length - 1]];
      const d = g.days.length > 1 ? `${first} – ${lastDay}` : first;
      const t = g.value === "closed" ? "Kapalı" : g.value.replace("-", " – ");
      return { d, t, closed: g.value === "closed" };
    })
    .sort((a, b) => Number(a.closed) - Number(b.closed));
}

export function instagramUrl(handle: string | null | undefined) {
  if (!handle) return null;
  const clean = handle.replace(/^@/, "").trim();
  return clean ? `https://instagram.com/${encodeURIComponent(clean)}` : null;
}

export function directionsUrl(address: string | null | undefined) {
  if (!address) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function telUrl(phone: string | null | undefined) {
  if (!phone) return null;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Turkish accusative suffix with vowel harmony and apostrophe for names:
 * "Latte" → "Latte’yi", "Sahlep" → "Sahlep’i", "Cold Brew" → "Cold Brew’u".
 */
export function accusative(name: string) {
  const lower = trLower(name.trim());
  const vowels = lower.match(/[aeıioöuü]/g);
  const last = vowels?.[vowels.length - 1] ?? "e";
  const suffix = { a: "ı", ı: "ı", e: "i", i: "i", o: "u", u: "u", ö: "ü", ü: "ü" }[last] ?? "i";
  const endsWithVowel = /[aeıioöuü]$/.test(lower);
  return `${name.trim()}’${endsWithVowel ? "y" : ""}${suffix}`;
}
