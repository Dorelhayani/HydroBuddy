import { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";
import { esp } from "../services/esp";
import { useRequestStatus } from "./RequestStatus";
import { toInputDate, toServerDate, validateClient } from "../domain/formatters";

export function useSensors() {
    const { loading, start, succeed, fail } = useRequestStatus();
    const [sensors, setSensors] = useState(null);

    const refreshSensors = useCallback(async () => {
        start();
        try {
            const res = await esp.getSensors();
            setSensors(res);
            succeed();
        } catch (e) { fail(e); }
    }, [start, succeed, fail]);

    useEffect(() => { refreshSensors(); }, [refreshSensors]);
    return { sensors, setSensors, refreshSensors, loadingSensors: loading };
}

export function useModState() {
    const { loading, start, succeed, fail, run } = useRequestStatus();
    const [state, setState] = useState(null);
    const [form, setForm] = useState({ state: "" });

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.dataMode();
            const current = Number(res?.CurrentStatus ?? NaN);
            setState(current);
            setForm({ state: Number.isFinite(current) ? String(current) : "" });
            succeed();
        } catch (e) { fail(e); }
    }, [start, succeed, fail]);

    useEffect(() => { load(); }, [load]);

    const saveState = useCallback(async () => {
        const n = Number(form.state);
        if (!Number.isFinite(n)) throw new Error("Choose a valid state number");
        const result = await run(() => esp.setState({ state: n }), { successMessage: "State saved" });
        const committed = Number(result?.CurrentStatus ?? n);
        setState(committed);
        return committed;
    }, [form, run]);

    return { state, form, setForm, saveState, reloadState: load, loadingState: loading };
}

const ModDataCtx = createContext(null);

export function ModDataProvider({ children }) {
    const sensorsApi = useSensors();
    const stateApi   = useModState();

    const value = useMemo(
        () => ({ ...sensorsApi, ...stateApi }),
        [sensorsApi.sensors, sensorsApi.loadingSensors, stateApi.state, stateApi.loadingState, stateApi.form]
    );

    return <ModDataCtx.Provider value={value}>{children}</ModDataCtx.Provider>;
}

export function useModData() {
    const ctx = useContext(ModDataCtx);
    if (!ctx) throw new Error("useModData must be used inside <ModDataProvider>");
    return ctx;
}


export function TempFormFromSensors(s) {
    const t = s?.TEMP_MODE || {};
    return {
        temp: t.temp ?? "",
        tempLVL: t.tempLVL ?? "",
        minTime: t.minTime ?? "",
        maxTime: t.maxTime ?? "",
        light: t.light ?? "",
        lightThresHold: t.lightThresHold ?? "",
        minLight: t.minLight ?? "",
        maxLight: t.maxLight ?? "",
    };
}

export function MoistureFormFromSensors(s) {
    const m = s?.SOIL_MOISTURE_MODE || {};
    return {
        moisture: m.moisture ?? "",
        moistureLVL: m.moistureLVL ?? "",
        minMoisture: m.minMoisture ?? "",
        maxMoisture: m.maxMoisture ?? "",
    };
}

export function SaturdayFormFromSensors(s) {
    const d = s?.SATURDAY_MODE || {};
    return {
        date: toInputDate(d.dateAct || ""),
        time: d.timeAct || "",
        duration: String(d.duration ?? ""),
    };
}


export function useSaveTemperature() {
    const { run, loading } = useRequestStatus();
    const save = useCallback(async (form) => {
        const payload = {
            temp: parseFloat(form.temp),
            tempLVL: parseFloat(form.tempLVL),
            minTime: parseInt(form.minTime, 10),
            maxTime: parseInt(form.maxTime, 10),
            light: parseInt(form.light, 10),
            lightThresHold: parseInt(form.lightThresHold, 10),
            minLight: parseInt(form.minLight, 10),
            maxLight: parseInt(form.maxLight, 10),
        };
        await run(() => esp.setTemp(payload), { successMessage: "Temperature mode saved" });
        return payload;
    }, [run]);
    return { save, saving: loading };
}

export function useSaveMoisture() {
    const { run, loading } = useRequestStatus();
    const save = useCallback(async (form) => {
        const payload = {
            moisture: parseInt(form.moisture, 10),
            moistureLVL: parseInt(form.moistureLVL, 10),
            minMoisture: parseInt(form.minMoisture, 10),
            maxMoisture: parseInt(form.maxMoisture, 10),
        };
        await run(() => esp.setMoist(payload), { successMessage: "Moisture mode saved" });
        return payload;
    }, [run]);
    return { save, saving: loading };
}

export function useSaveSaturday() {
    const { run, loading } = useRequestStatus();
    const save = useCallback(async (form) => {
        const payload = {
            dateAct: toServerDate(form.date),
            timeAct: form.time,
            duration: parseInt(form.duration, 10),
        };
        if (!validateClient(payload)) throw new Error("בדוק תאריך/שעה/משך: פורמט לא תקין");
        await run(() => esp.setSaturday(payload), { successMessage: "Saturday mode saved" });
        return payload;
    }, [run]);
    return { save, saving: loading };
}

export function useSaveManual() {
    const { run, loading } = useRequestStatus();
    const save = useCallback(async (enabled) => {
        await run(() => esp.setEnabled(enabled), { successMessage: "Manual mode saved" });
        return enabled;
    }, [run]);
    return { save, saving: loading };
}