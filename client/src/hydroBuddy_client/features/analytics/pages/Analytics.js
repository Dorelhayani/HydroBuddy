/* ===== AnalyticsPanel.js ===== */

import React from "react";

import { useAnalytics } from "../hooks/useAnalytics";
import Card, { useBorderFlash } from "../../../ui/Card";
import {useT} from "../../../../local/useT";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function secondsToMin(sec) {
  if (!sec || sec <= 0) return "0 min";
  const minutes = sec / 60;
  return `${minutes.toFixed(1)} min`;
}


const PIE_COLORS = [
  "#63E6BE",
  "#ADE2F4",
  "#FFD166",
  "#FF7B7B",
];

function modeLabel(mode, t) {

  switch (mode) {
    case "TEMP":      return t("analytics.mode.temp", "Temperature");
    case "MOISTURE":  return t("analytics.mode.moisture", "Moisture");
    case "SATURDAY":  return t("analytics.mode.saturday", "Saturday");
    case "MANUAL":    return t("analytics.mode.manual", "Manual");
    case "IDLE":      return t("analytics.mode.idle", "Idle");
    default:          return mode || t("analytics.mode.unknown", "Unknown");
  }
}

const AnalyticsPanel = React.memo(function AnalyticsPanel({ variant = "default" }) {
  const { data, loading, error, refetch } = useAnalytics();
  const { t } = useT();

  const title = t("analytics.title", "Today analytics");

  if (loading && !data) {
    return (
      <Card
        variant={variant}
        header={<span className="text-sm fw-600">{title}</span>}
        body={<p className="loading">{t("analytics.loading", "Loading analytics...")}</p>}
      />
    );
  }

  if (error && !data) {
    return (
      <Card
        variant={variant}
        header={<span className="text-sm fw-600">{title}</span>}
        body={
          <div>
            <p className="msg">{t("analytics.error", "Failed to load analytics.")}</p>
            <button className="btn" onClick={refetch}>
              {t("analytics.retry", "Retry")}
            </button>
          </div>
        }
      />
    );
  }

  const date = data?.date ?? "";
  const pumpTotalOnSec = data?.pump?.totalOnSec ?? 0;
  const pumpCycles = data?.pump?.cycles ?? 0;
  const byMode = data?.pump?.byMode ?? [];
  const sensors = data?.sensors ?? {};
  const avgTemp = sensors.avgTemp;
  const avgMoisture = sensors.avgMoisture;
  const avgLight = sensors.avgLight;

  // נתוני הפאי – דקות ולא שניות, יותר אינטואיטיבי למשתמש
  const pieData = byMode.map((m) => ({
    name: modeLabel(m.mode, t),
    value: m.totalOnSec / 60, // דקות
  })).filter(d => d.value > 0);

  const hasPie = pieData.length > 0;

  return (
    <Card
      variant={variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">
            {title} {date && `· ${date}`}
          </small>
        </div>
      }
      body={
        <div className="analytics-grid">
          {/* סיכום המשאבה */}
          <div className="analytics-section">
            <div className="sub-title">
              {t("analytics.pumpSummary.title", "Pump summary")}
            </div>
            <div className="txt">
              {t("analytics.pumpSummary.totalOn", "Total ON time")}:{" "}
              <strong>{secondsToMin(pumpTotalOnSec)}</strong>
            </div>
            <div className="txt">
              {t("analytics.pumpSummary.cycles", "Cycles")}:{" "}
              <strong>{pumpCycles}</strong>
            </div>
          </div>

          {/* גרף פאי – חלוקה לפי מצב */}
          <div className="analytics-section analytics-chart">
            <div className="sub-title">
              {t("analytics.byMode.title", "By mode")}
            </div>
            {!hasPie && (
              <div className="txt">
                {t("analytics.byMode.empty", "No pump cycles logged today.")}
              </div>
            )}
            {hasPie && (
              <div className="pie-wrapper">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      labelLine={false}
                      label={(entry) =>
                        `${entry.name}: ${entry.value.toFixed(1)} min`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toFixed(1)} min`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ממוצעי חיישנים */}
          <div className="analytics-section">
            <div className="sub-title">
              {t("analytics.sensors.title", "Average sensors")}
            </div>
            <div className="txt">
              {t("analytics.sensors.temp", "Temperature")}:{" "}
              <strong>
                {avgTemp != null ? `${avgTemp.toFixed(1)} °C` : "—"}
              </strong>
            </div>
            <div className="txt">
              {t("analytics.sensors.moisture", "Soil moisture")}:{" "}
              <strong>
                {avgMoisture != null ? `${avgMoisture.toFixed(1)} %` : "—"}
              </strong>
            </div>
            <div className="txt">
              {t("analytics.sensors.light", "Light")}:{" "}
              <strong>
                {avgLight != null ? `${avgLight.toFixed(1)} %` : "—"}
              </strong>
            </div>
          </div>
        </div>
      }
    />
  );
});

export default AnalyticsPanel;
