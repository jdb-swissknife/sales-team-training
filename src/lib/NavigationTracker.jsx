import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tracks page navigation. Local-only (no analytics server).
 */
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Simple local page tracking
    try {
      const visits = JSON.parse(localStorage.getItem("mv_page_visits") || "[]");
      visits.push({
        page: location.pathname,
        timestamp: new Date().toISOString(),
      });
      // Keep last 100 visits
      if (visits.length > 100) visits.shift();
      localStorage.setItem("mv_page_visits", JSON.stringify(visits));
    } catch {
      // ignore
    }
  }, [location.pathname]);

  return null;
}
