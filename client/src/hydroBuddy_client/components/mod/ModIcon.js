// components/mod/ModIcon.jsx
import React from "react";
import decideModeState from "./ModeState";

// Map state → Font Awesome classes
const ICONS = {
    temp: {
        hot: "fa-solid fa-temperature-arrow-up fa-bounce",
        cold: "fa-solid fa-temperature-arrow-down fa-bounce",
        ok: "fa-solid fa-temperature-three-quarters",
        loading: "fa-solid fa-spinner fa-spin",
        disabled: "fa-solid fa-ban",
        pending: "fa-solid fa-clock-rotate-left fa-spin",
        missing: "fa-regular fa-temperature-empty",
    },
    moisture: {
        wet: "fa-solid fa-droplet fa-beat",
        dry: "fa-solid fa-droplet-slash fa-bounce",
        ok: "fa-solid fa-droplet",
        loading: "fa-solid fa-spinner fa-spin",
        disabled: "fa-solid fa-ban",
        pending: "fa-solid fa-clock-rotate-left fa-spin",
        missing: "fa-regular fa-droplet",
    },

    saturday: {
        running: "fa-solid fa-calendar-check fa-beat-fade",
        scheduled: "fa-solid fa-calendar-days fa-beat-fade",
        idle: "fa-regular fa-calendar-minus",
        invalid: "fa-solid fa-triangle-exclamation",
        loading: "fa-solid fa-spinner fa-spin",
        disabled: "fa-solid fa-ban",
        pending: "fa-solid fa-clock-rotate-left fa-spin",
        missing: "fa-regular fa-calendar",
    },
    manual: {
        on: "fa-solid fa-hand fa-beat",
        armed: "fa-solid fa-hand-back-fist",
        off: "fa-regular fa-hand",
        loading: "fa-solid fa-spinner fa-spin",
        disabled: "fa-solid fa-ban",
        pending: "fa-solid fa-clock-rotate-left fa-spin",
        missing: "fa-regular fa-hand",
    },
};

const TONES = {
    hot: "status--hot",
    cold: "status--cold",
    ok: "status--ok",
    wet: "status--wet",
    dry: "status--dry",
    neutral: "status--neutral",
};

export default function ModIcon({ modeId, readings, thresholds, flags, meta, className = "" }) {
    const desc = decideModeState(modeId, readings, thresholds, flags);
    const faClass = ICONS?.[modeId]?.[desc.state] || "fa-solid fa-gauge";
    const toneClass = TONES?.[desc.tone || "neutral"] || "status--neutral";

    return (
        <span
            className={`mod-icon ${toneClass} ${flags?.isActive ? "is-active" : ""} ${className}`}
            aria-label={desc.aria}
            title={desc.aria}
        >
      <i className={`mod-icon__glyph ${faClass}`} aria-hidden="true" />
    </span>
    );
}
