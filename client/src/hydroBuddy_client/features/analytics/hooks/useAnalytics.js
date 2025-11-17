/* ===== useAnalytics.js ===== */

import { useCallback,useEffect, useState } from "react";
import { getTodayAnalytics } from "../services/analytics";

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTodayAnalytics();
      setData(res);
    } catch (err) {
      console.error("[Analytics] fetch failed", err);
      setError(err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}
