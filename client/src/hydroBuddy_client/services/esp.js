// esp.js

import { http } from "./http";

export const esp = {

    // getStateJson: () => http(`/esp/getJSON?_=${Date.now()}`, { method: "GET" }),
    // getState: () => http(`/esp/getJSON?_=${Date.now()}`, { method: "GET", credentials: "include" }),

    getState: () => http(`/esp/state?_=${Date.now()}`, { method: "GET", credentials: "include" }),
    dataMode: (state) => http(`/esp/dataMode${state ? `?state=${encodeURIComponent(state)}` : ""}`, { method: "GET" }),
    setState: (payload) => http("/esp/state", { method: "PATCH", body: payload }),

    // קונפיגים
    setTempConfig:  (payload) => http("/esp/temp",     { method: "PATCH", body: payload }),
    setMoistConfig: (payload) => http("/esp/moisture", { method: "PATCH", body: payload }),
    setSaturday:    (payload) => http("/esp/saturday", { method: "PATCH", body: payload }),

    // קריאות חיישנים ידניות
    updateTempReading:  (payload) => http("/esp/temp-config",  { method: "PATCH", body: payload }),
    updateLightReading: (payload) => http("/esp/light-config", { method: "PATCH", body: payload }),
    updateMoistReading: (payload) => http("/esp/moist-config", { method: "PATCH", body: payload }),

    // ידני
    setEnabled(enabled) {
        return http("/esp/manual", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: !!enabled }), // boolean
            credentials: "include",
        });
    },

};
