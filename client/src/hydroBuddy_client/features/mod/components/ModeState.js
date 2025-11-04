/* ===== ModState.js ===== */

export default function decideModeState(modeId, readings = {}, thresholds = {}, flags = {}) {
    if (flags.loading)  return { state: "loading",  tone: "neutral", aria: "Loading" };
    if (flags.disabled) return { state: "disabled", tone: "neutral", aria: "Disabled" };
    if (flags.pending)  return { state: "pending",  tone: "neutral", aria: "Pending" };

    const isNum = (v) => typeof v === "number" && Number.isFinite(v);

    switch (modeId) {
        case "temp": {
            const t = readings?.temp;
            const low  = thresholds?.temp?.low;
            const high = thresholds?.temp?.high;

            if (!isNum(t)) return { state: "missing", tone: "neutral", aria: "Temperature missing" };
            if (!isNum(low) || !isNum(high)) {
                return { state: "ok", tone: "ok", aria: "Temperature available" };
            }

            if (t > high) return { state: "hot", tone: "hot", delta: +(t - high).toFixed(1), aria: "Temperature above threshold" };
            if (t < low)  return { state: "cold", tone: "cold", delta: +(low - t).toFixed(1), aria: "Temperature below threshold" };
            return { state: "ok", tone: "ok", aria: "Temperature in range" };
        }

        case "moisture": {
            const m = readings?.moisture;
            const low  = thresholds?.moisture?.low;
            const high = thresholds?.moisture?.high;

            if (!isNum(m)) return { state: "missing", tone: "neutral", aria: "Soil moisture missing" };
            if (!isNum(low) || !isNum(high)) {
                return { state: "ok", tone: "ok", aria: "Soil moisture available" };
            }

            if (m < low)  return { state: "dry", tone: "dry", aria: "Soil too dry" };
            if (m > high) return { state: "wet", tone: "wet", aria: "Soil too wet" };
            return { state: "ok", tone: "ok", aria: "Soil moisture in range" };
        }

        case "saturday": {
            const enabled = !!readings?.enabled;
            const running = !!readings?.isRunningNow;
            const hasSchedule = !!(readings?.dateAct && readings?.timeAct) || !!(readings?.window?.start);

            if (enabled && running) return { state: "running", tone: "ok", aria: "Saturday mode running" };
            if (enabled && hasSchedule) return { state: "scheduled", tone: "neutral", aria: "Saturday mode scheduled" };
            if (!enabled) return { state: "idle", tone: "neutral", aria: "Saturday mode off" };
            return { state: "missing", tone: "neutral", aria: "Saturday data missing" };
        }

        case "manual": {
            const en = !!readings?.enabled;
            if (en)  return { state: "on", tone: "ok", aria: "Manual mode on"  };
            return    { state: "off", tone: "neutral", aria: "Manual mode off" };
        }

        default:
            return { state: "missing", tone: "neutral", aria: "Unknown mode" };
    }
}
