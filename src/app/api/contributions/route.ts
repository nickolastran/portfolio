const USERNAME = "nickolastran";

// GitHub's own calendar HTML — no token, no third-party API.
export async function GET() {
  const html = await fetch(
    `https://github.com/users/${USERNAME}/contributions`,
    { next: { revalidate: 3600 } },
  ).then((r) => r.text());

  const counts = new Map<string, number>();
  for (const [, id, text] of html.matchAll(
    /<tool-tip[^>]*for="(contribution-day-component-[^"]+)"[^>]*>([^<]*)<\/tool-tip>/g,
  )) {
    counts.set(id, text.startsWith("No ") ? 0 : parseInt(text, 10) || 0);
  }

  const days = [
    ...html.matchAll(
      /data-date="(\d{4}-\d{2}-\d{2})" id="(contribution-day-component-[^"]+)" data-level="(\d)"/g,
    ),
  ]
    .map(([, date, id, level]) => ({
      date,
      count: counts.get(id) ?? 0,
      level: Number(level),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (days.length === 0) return Response.json([], { status: 502 });
  return Response.json(days);
}
