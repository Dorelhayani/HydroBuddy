/* ===== esp.js ===== */

import http from "./http";

export const esp = {

    /* ===== ESP data ===== */
    getState: () => http(`/esp/state?_=${Date.now()}`, { method: "GET", credentials: "include" }),
    dataMode: (state) => http(`/esp/dataMode${state ? `?state=${encodeURIComponent(state)}` : ""}`, { method: "GET" }),
    setState: (payload) => http("/esp/state", { method: "PATCH", body: payload }),

    /* ===== config ===== */
    setTempConfig:  (payload) => http("/esp/temp",     { method: "PATCH", body: payload }),
    setMoistConfig: (payload) => http("/esp/moisture", { method: "PATCH", body: payload }),
    setSaturday:    (payload) => http("/esp/saturday", { method: "PATCH", body: payload }),
    setEnabled(enabled) {
        return http("/esp/manual", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body:{ enabled: !!enabled },
            credentials: "include",
        });
    },

    /* ===== sensors reading ===== */
    TempReading:  (payload) => http("/esp/temp-config",  { method: "PATCH", body: payload }),
    LightReading: (payload) => http("/esp/light-config", { method: "PATCH", body: payload }),
    MoistReading: (payload) => http("/esp/moist-config", { method: "PATCH", body: payload }),
};
