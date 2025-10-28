/* ===== useEsp.js ===== */

import { useRef, useState, useCallback, startTransition, useMemo } from "react";
import { esp } from "../services/esp";
import { useRequestStatus } from "./RequestStatus";
import { toServerDate } from "../domain/formatters";

// השוואה רדודה כדי לעדכן state רק כשיש שינוי אמיתי
function shallowEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    const ak = Object.keys(a), bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (a[k] !== b[k]) return false;
    return true;
}

export function useEsp() {
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ state: "" }); // נשמר API זהה
    const lastRef = useRef(null);
    const pickDefined = (obj) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

    // שני מצבי סטטוס: פולינג (קריאות רקע), ומוטציות (פעולות יזומות ע"י המשתמש)
    const poll = useRequestStatus();
    const mutate = useRequestStatus();

    const toFiniteInt   = (v) => Number.isFinite(+v) ? parseInt(v,10) : undefined;
    const toFiniteFloat = (v) => Number.isFinite(+v) ? parseFloat(v) : undefined;


    const fetchEspState = useCallback(async () => {
        return poll.run(async () => {
            const data = await esp.getState();
            if (!shallowEqual(lastRef.current, data)) {
                lastRef.current = data;
                startTransition(() => setSensors(data));
            }
            return data;
        });
    }, [poll]);

    // ===  קריאה שמחזירה dataMode ===
    const fetchDataMod = useCallback(async () => {
        const data = await fetchEspState();
        return data?.dataMode ?? null;
    }, [fetchEspState]);

    // === שמירת מצב (מוטציה) — רץ תחת mutate.run כדי להציג loading אמיתי בכפתורים ===
    const fetchStateSave = useCallback(async ({ state }) => {
        return mutate.run(async () => {
            await esp.setState({ state: state })
            setForm({ state: String(state) });
            return state;
        }, { successMessage: "" });
    }, [mutate]);

    const currentState = sensors?.dataMode ?? form.state ?? "";

        // ---- פעולות שמורות (Configs) ----
    const temp = useCallback(async (formPayload) => {
        const payload = pickDefined({
            temp:           toFiniteFloat(formPayload.temp),
            tempLVL:        toFiniteFloat(formPayload.tempLVL),
            minTime:        toFiniteInt(formPayload.minTime),
            maxTime:        toFiniteInt(formPayload.maxTime),
            lightThresHold: toFiniteInt(formPayload.lightThresHold),
            minLight:       toFiniteInt(formPayload.minLight),
            maxLight:       toFiniteInt(formPayload.maxLight),
        });

        await mutate.run(async () => {
            await esp.setTempConfig(payload);
            await fetchEspState();
        }, { successMessage: "Temperature mode saved" });

    }, [mutate, fetchEspState]);


    // moisture
    const moist = useCallback(async (formPayload) => {
        const payload = {
            moistureLVL: parseInt(formPayload.moistureLVL, 10),
            minMoisture: parseInt(formPayload.minMoisture, 10),
            maxMoisture: parseInt(formPayload.maxMoisture, 10),
        };
        await mutate.run(async () => {
            await esp.setMoistConfig(payload);
            await fetchEspState();
        }, { successMessage: "Moisture mode saved" }); }, [mutate, fetchEspState]);

    // saturday
    const saturday = useCallback(async (formPayload) => {
        const payload = {
            dateAct: toServerDate(formPayload.date),
            timeAct: formPayload.time,
            duration: parseInt(formPayload.duration, 10),
        };
        await mutate.run(async () => {
            await esp.setSaturday(payload);
            await fetchEspState();
        }, { successMessage: "Saturday mode saved" });
    }, [mutate, fetchEspState]);

    const manual = useCallback(async (enabled) => {
        return mutate.run(async () => {
            const res = await esp.setEnabled(enabled);
            await fetchEspState();
            console.log("Response from /esp/manual:", res);
            return !!res?.MANUAL_MODE?.enabled;
        }, { successMessage: "Manual mode saved" });
    }, [mutate]);

    const updateTemp = useCallback(async (tempValue) => {
        const t = toFiniteFloat(tempValue);
        if (t === undefined) throw new Error("Insert valid temp");
        await mutate.run(async () => {
            await esp.TempReading({ temp: t });
            await fetchEspState();
        }, { successMessage: "Temp reading updated" });
    }, [mutate, fetchEspState]);

    // updateLight
    const updateLight = useCallback(async (lightValue) => {
        const payload = { light: parseInt(lightValue, 10) };
        if (!Number.isInteger(payload.light)) throw new Error("Insert valid light (int)");
        await mutate.run(async () => {
            await esp.LightReading(payload);
            await fetchEspState();
        }, { successMessage: "Light reading updated" });
    }, [mutate, fetchEspState]);

    // updateMoist
    const updateMoist = useCallback(async (moistValue) => {
        const payload = { moisture: parseInt(moistValue, 10) };
        if (!Number.isInteger(payload.moisture)) throw new Error("Insert valid moisture (int)");
        await mutate.run(async () => {
            await esp.MoistReading(payload);
            await fetchEspState();
        }, { successMessage: "Moisture reading updated" });
    }, [mutate, fetchEspState]);


    // אם יש לך enable אמיתי—תחליף; שומר API
    const enable = true;
    const setEnable = () => {};

    // שמירה על אותו API: refetch כאובייקט
    const refetch = useMemo(() => ({
        fetchEspState,
        fetchDataMod,
        fetchStateSave,
    }), [fetchEspState, fetchDataMod, fetchStateSave]);

    return {
        sensors, setSensors,  currentState,
        temp, moist, saturday, manual, updateTemp, updateMoist, updateLight,
        enable, setEnable,
        form, setForm,

        // למעלה בטפסים/כפתורים:
        loading: mutate.loading,
        err: mutate.err,
        error: mutate.err,

        // אופציונלי לשקט רקע:
        pollLoading: poll.loading,
        pollErr: poll.err,

        refetch,
    };
}