// Run: node src/app/api/contributions/route.test.mjs
// Hits GitHub live — fails loudly if their calendar markup changes.
import assert from "node:assert";

const html = await fetch(
  "https://github.com/users/nickolastran/contributions",
).then((r) => r.text());

const counts = new Map();
for (const [, id, text] of html.matchAll(
  /<tool-tip[^>]*for="(contribution-day-component-[^"]+)"[^>]*>([^<]*)<\/tool-tip>/g,
)) {
  counts.set(id, text.startsWith("No ") ? 0 : parseInt(text, 10) || 0);
}

const days = [
  ...html.matchAll(
    /data-date="(\d{4}-\d{2}-\d{2})" id="(contribution-day-component-[^"]+)" data-level="(\d)"/g,
  ),
].map(([, date, id, level]) => ({
  date,
  count: counts.get(id) ?? 0,
  level: Number(level),
}));

assert.ok(days.length > 360, `expected a year of days, got ${days.length}`);
assert.ok(counts.size > 360, `no tooltips parsed (${counts.size})`);
assert.ok(
  days.some((d) => d.count > 0),
  "every day parsed as 0 contributions",
);
assert.ok(
  days.every((d) => d.level >= 0 && d.level <= 4),
  "level out of range",
);
console.log(`ok — ${days.length} days parsed`);
