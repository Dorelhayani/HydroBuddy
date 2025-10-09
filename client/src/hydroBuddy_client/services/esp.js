// import {http} from "./http";
// const JSON_HEADERS = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
//
// export const esp = {
//     dataMode: () => http("/esp/dataMode"),
//
//     getSensors: () => http("/esp/sendJSON"),
//
//     setState: ({state}) =>
//         http("/esp/state", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: new URLSearchParams({ state }),
//         }),
//
//     setTemp: ({ temp, tempLVL, minTime, maxTime, light, lightThresHold, minLight, maxLight}) =>
//         http("/esp/temp", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: new URLSearchParams({ temp, tempLVL, minTime, maxTime, light, lightThresHold, minLight, maxLight}),
//         }),
//
//     setMoist: ({ moisture, minMoisture, maxMoisture,moistureLVL }) =>
//         http("/esp/moisture", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: new URLSearchParams({moisture, minMoisture, maxMoisture, moistureLVL}),
//         }),
//
//     setSaturday: ({ dateAct, timeAct, duration }) =>
//         http("/esp/Saturday", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: new URLSearchParams({dateAct, timeAct, duration: String(duration)}),
//         }),
//
//     setEnabled: (enabled) =>
//         http("/esp/manual", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: new URLSearchParams({ enabled: String(enabled) }),
//         })
// }

import {http} from "./http";

export const esp = {
    dataMode: () => http("/esp/dataMode", { method:"GET" }),

    StateData: () => http("/esp/sendJSON", { method:"GET" }),

    setState: (payload) =>  http("/esp/state", { method: "PATCH",  body: payload }),

    setTemp: (payload) =>  http("/esp/temp", { method: "PATCH", body: payload }),
    setMoist: (payload) => http("/esp/moisture", { method: "PATCH", body: payload }),
    setSaturday: (payload) => http("/esp/Saturday", { method: "PATCH", body: payload }),

    setEnabled: (payload) => http("/esp/manual", { method: "PATCH",  body: new URLSearchParams({ enabled: String(payload) }) })
}