const DEFAULT_API_BASE = "https://route-erica.trustmvs.com/api";

export function getRouteBlitzerContext(user) {
  const params = new URLSearchParams(window.location.search);
  const apiFromUrl = params.get("api");
  const repFromUrl = params.get("repName");

  if (apiFromUrl) localStorage.setItem("mv_route_blitzer_api", apiFromUrl);
  if (repFromUrl) localStorage.setItem("mv_route_blitzer_rep", repFromUrl);

  const apiBase = apiFromUrl || localStorage.getItem("mv_route_blitzer_api") || DEFAULT_API_BASE;
  const repName = repFromUrl || localStorage.getItem("mv_route_blitzer_rep") || user?.full_name || "";

  return {
    enabled: Boolean(repName),
    apiBase: apiBase.replace(/\/$/, ""),
    repName,
    source: params.get("source") || (repFromUrl ? "route-blitzer" : null),
  };
}

export async function fetchRouteBlitzerXpSummary({ apiBase, repName, days = 30 }) {
  if (!repName) return null;

  const url = `${apiBase}/coach/xp-summary?repName=${encodeURIComponent(repName)}&days=${days}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}
