/**
 * Thin CORS/proxy for personal NYT Connections testing (ADR 0009 / 0013).
 * Proxies `GET /api/connections-nyt/YYYY-MM-DD` → NYT `svc/connections/v2/{date}.json`.
 * Soft dependency — client falls back to Tonni packs on failure.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: (body?: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600",
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const raw = req.query?.date;
  const dateKey = Array.isArray(raw) ? raw[0] : raw;
  if (typeof dateKey !== "string" || !DATE_RE.test(dateKey)) {
    res.status(400).json({ error: "Expected /api/connections-nyt/YYYY-MM-DD" });
    return;
  }

  const upstream = `https://www.nytimes.com/svc/connections/v2/${dateKey}.json`;

  try {
    const upstreamRes = await fetch(upstream, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TonniGames-personal-spike/0.1",
      },
    });
    const text = await upstreamRes.text();
    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).json({
        error: "Upstream Connections fetch failed",
        status: upstreamRes.status,
      });
      return;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).end(text);
  } catch {
    res.status(502).json({ error: "Upstream Connections fetch error" });
  }
}
