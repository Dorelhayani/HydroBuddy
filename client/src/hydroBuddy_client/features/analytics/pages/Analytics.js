/* ===== AnalyticsPanel.js ===== */

import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {useT} from "../../../../local/useT";
import { formatDateTime } from "../../../shared/domain/formatters";
import Card from "../../../ui/Card";
import { useAnalytics } from "../hooks/useAnalytics";

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

const Pumpsummary = React.memo(function Pumpsummary({ variant = "default" }) {
  const { t } = useT();
  const { data } = useAnalytics();
  const pumpTotalOnSec = data?.pump?.totalOnSec ?? 0;
  const pumpCycles = data?.pump?.cycles ?? 0;
  const pumpTitle = t("analytics.pumpSummary.title", "Pump summary");

  return(
    <Card
      className="analytics-section"
      variant = {variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">{pumpTitle}</small>
        </div>
      }
      body={
        <>
          <div className="txt">
            {t("analytics.pumpSummary.totalOn", "Total ON time")}:{" "}
            <strong>{secondsToMin(pumpTotalOnSec)}</strong>
          </div>
          <div className="txt">
            {t("analytics.pumpSummary.cycles", "Cycles")}:{" "}
            <strong>{pumpCycles}</strong>
          </div>
        </>
      }
      footer={" "}
    />
  );
});

const PiChart = React.memo(function PiChart({ variant = "default" }) {
  const { t } = useT();
  const { data } = useAnalytics();
  const piCartTitle = t("analytics.byMode.title", "By mode");

  const byMode = data?.pump?.byMode ?? [];
  const pieData = byMode.map((m) => ({
    name: modeLabel(m.mode, t),
    value: m.totalOnSec / 60, })).filter(d => d.value > 0);

  const hasPie = pieData.length > 0;

  return (
    <Card
      className="analytics-section"
      variant = {variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">{piCartTitle}</small>
        </div>
      }
      body={
          <div className="analytics-chart">
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
                      formatter={(value) => `${Number(value).toFixed(1)} min`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      }
      footer={" "}
    />
  );
});

const SensorsAVG = React.memo(function SensorsAVG({ variant = "default" }) {
  const { t } = useT();
  const { data } = useAnalytics();

  const SensorsAVGTitle = t("analytics.sensors.title", "Average sensors");
  const sensors = data?.sensors ?? {};
  const avgTemp = sensors.avgTemp;
  const avgMoisture = sensors.avgMoisture;
  const avgLight = sensors.avgLight;

  return(
    <Card
      className="analytics-section"
      variant = {variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">{SensorsAVGTitle}</small>
        </div>
      }
      body={
          <>
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
          </>
      }
      footer={" "}
    />
  );
});

export default function Analytics({variant, embed = false}) {
  const { data, loading, error, refetch } = useAnalytics();
  const { t } = useT();
  const date = formatDateTime(data?.date);
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
  const content = (
    <Card
      className="analytics-main"
      variant={variant}
      header={
        <div className="mx-auto-flex mb-8">
          <small className="text-lg fw-600 mb-8 stack-8">{title}</small>
          <small className="text-xs text-muted-500 btn-row mid">{`${date}`}</small>
        </div>
      }
      body={
        <section className="analytics-main">
          <Pumpsummary/>
          <PiChart/>
          <SensorsAVG/>
        </section>
      }
      footer={ <div/> }
    />
  );

  return embed ? content : (
    <>
      {content}
    </>
  );
}
