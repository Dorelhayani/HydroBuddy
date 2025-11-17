/* ===== esp.js ===== */

// src/features/dashboard/components/AnalyticsPanel.js
import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import Card, { useBorderFlash } from "../../../ui/Card";

function secondsToMin(sec) {
  if (!sec || sec <= 0) return "0 min";
  const minutes = sec / 60;
  return `${minutes.toFixed(1)} min`;
}

const AnalyticsPanel = React.memo(function AnalyticsPanel({ variant = "default" }) {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading && !data) {
    return (
      <Card
        variant={variant}
        header={<span className="text-sm fw-600">Today analytics</span>}
        body={<p className="loading">Loading analytics...</p>}
      />
    );
  }

  if (error && !data) {
    return (
      <Card
        variant={variant}
        header={<span className="text-sm fw-600">Today analytics</span>}
        body={
          <div>
            <p className="msg">Failed to load analytics.</p>
            <button className="btn" onClick={refetch}>Retry</button>
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

  return (
    <Card
      variant={variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">
            Today analytics {date && `· ${date}`}
          </small>
        </div>
      }
      body={
        <div className="grid analytics-grid">
          {/* סיכום המשאבה */}
          <div className="analytics-section">
            <div className="sub-title">Pump summary</div>
            <div className="txt">
              Total ON time: <strong>{secondsToMin(pumpTotalOnSec)}</strong>
            </div>
            <div className="txt">
              Cycles: <strong>{pumpCycles}</strong>
            </div>
          </div>

          {/* חלוקה לפי מצב */}
          <div className="analytics-section">
            <div className="sub-title">By mode</div>
            {byMode.length === 0 && (
              <div className="txt">No pump cycles logged today.</div>
            )}
            {byMode.map((m) => (
              <div key={m.mode} className="txt">
                <span>{m.mode}:</span>{" "}
                <strong>{secondsToMin(m.totalOnSec)}</strong>
              </div>
            ))}
          </div>

          {/* ממוצעי חיישנים */}
          <div className="analytics-section">
            <div className="sub-title">Average sensors</div>
            <div className="txt">
              Temp:{" "}
              <strong>
                {avgTemp != null ? `${avgTemp.toFixed(1)} °C` : "—"}
              </strong>
            </div>
            <div className="txt">
              Moisture:{" "}
              <strong>
                {avgMoisture != null ? `${avgMoisture.toFixed(1)} %` : "—"}
              </strong>
            </div>
            <div className="txt">
              Light:{" "}
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
