/* ===== analytics.js ===== */

import http from "../../../shared/services/http";

export function getTodayAnalytics() {
  return http("/esp/analytics/today", {
    method: "GET",
  });
}

