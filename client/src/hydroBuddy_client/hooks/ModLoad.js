import { esp } from "../services/esp";
import { useRequestStatus } from "./RequestStatus";
import { useState, useCallback, useEffect } from "react";
import {toInputDate, toServerDate, validateClient} from "../domain/formatters";

export function StateLoad() {
    const { loading, ok, err, message, start, succeed, fail, run } = useRequestStatus();
    const [state, setState] = useState(null);
    const [form, setForm] = useState({ state: ""});

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.dataMode();
            const current = Number(res?.CurrentStatus ?? NaN );
            setState(current);

            setForm({ state: Number.isFinite(current) ? String(current) : "" });
            succeed();
        } catch (e) { fail(e); }
    }, [start, succeed, fail]);

    const save = useCallback(async () => {
        const payload = Number(form.state);
        if(!Number.isFinite(payload)) {throw new Error("Choose a Valid state number");}
        const result = await run(() => esp.setState({state: payload}), { successMessage: "State saved" });

        const committed = Number(result?.CurrentStatus ?? payload);
        setState(committed);

    }, [form, run]);

    useEffect(() => { load(); }, [load]);
    return { state, form, setForm, load, save, loading, ok, err, message };
}

export function TemperatureLoad(){
    const { loading, ok, err, message, start, succeed, fail, run } = useRequestStatus();
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ moisture: "", moistureLVL: "", minMoisture: "" });

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.getSensors();
            setSensors(res);

            const temp = res?.TEMP_MODE?.temp  || "";
            const tempLVL = res?.TEMP_MODE?.tempLVL || "";
            const minTime  = res?.TEMP_MODE?.minTime ?? "";
            const maxTime  = res?.TEMP_MODE?.maxTime ?? "";
            const light  = res?.TEMP_MODE?.light ?? "";
            const lightThresHold  = res?.TEMP_MODE?.lightThresHold ?? "";
            const minLight  = res?.TEMP_MODE?.minLight ?? "";
            const maxLight  = res?.TEMP_MODE?.maxLight ?? "";

            setForm({
                temp: temp,
                tempLVL: tempLVL,
                minTime: minTime,
                maxTime: maxTime,
                light: light,
                lightThresHold: lightThresHold,
                minLight: minLight,
                maxLight: maxLight,
            });

            succeed();
        } catch (e) {
            fail(e);
        }
    }, [start, succeed, fail]);

    const save = useCallback(async () => {
        const payload = {
            temp: parseFloat(form.temp),
            tempLVL: parseFloat(form.tempLVL),
            minTime: parseInt(form.minTime),
            maxTime: parseInt(form.maxTime),
            light: parseInt(form.light),
            lightThresHold: parseInt(form.lightThresHold),
            minLight: parseInt(form.minLight),
            maxLight: parseInt(form.maxLight),
        };

        await run(() => esp.setTemp(payload), { successMessage: "temperature mode saved" });

        // עדכון מקומי של התצוגה
        setSensors((s) => ({
            ...s,
            TEMP_MODE: { ...(s?.TEMP_MODE || {}),
                temp: payload.temp,
                tempLVL: payload.tempLVL,
                minTime: payload.minTime,
                maxTime: payload.maxTime,
                light: payload.light,
                lightThresHold: payload.lightThresHold,
                minLight: payload.minLight,
                maxLight: payload.maxLight,
            },
        }));
    }, [form, run]);

    useEffect(() => { load(); }, [load]);

    return { sensors, form, setForm, load, save, loading, ok, err, message };
}


export function MoistureLoad(){
    const { loading, ok, err, message, start, succeed, fail, run } = useRequestStatus();
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ moisture: "", moistureLVL: "", minMoisture: "" });

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.getSensors();
            setSensors(res);

            const moisture = res?.SOIL_MOISTURE_MODE?.moisture  || "";
            const moistureLVL = res?.SOIL_MOISTURE_MODE?.moistureLVL || "";
            const minMoisture  = res?.SOIL_MOISTURE_MODE?.minMoisture ?? "";
            const maxMoisture  = res?.SOIL_MOISTURE_MODE?.maxMoisture ?? "";

            setForm({
                moisture: moisture,
                moistureLVL: moistureLVL,
                minMoisture: minMoisture,
                maxMoisture: maxMoisture,
            });

            succeed();
        } catch (e) {
            fail(e);
        }
    }, [start, succeed, fail]);

    const save = useCallback(async () => {
        const payload = {
            moisture: parseInt(form.moisture),
            moistureLVL: parseInt(form.moistureLVL),
            minMoisture: parseInt(form.minMoisture),
            maxMoisture: parseInt(form.maxMoisture),
        };

        await run(() => esp.setMoist(payload), { successMessage: "moisture mode saved" });

        setSensors((s) => ({
            ...s,
            SOIL_MOISTURE_MODE: { ...(s?.SOIL_MOISTURE_MODE || {}),
                moisture: payload.moisture,
                moistureLVL: payload.moistureLVL,
                minMoisture: payload.minMoisture,
                maxMoisture: payload.maxMoisture,
            },
        }));
    }, [form, run]);

    useEffect(() => { load(); }, [load]);

    return { sensors, form, setForm, load, save, loading, ok, err, message };
}


export function SaturdayLoad() {
    const { loading, ok, err, message, start, succeed, fail, run } = useRequestStatus();
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ date: "", time: "", duration: "" });

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.getSensors();
            setSensors(res);

            const dateFromServer = res?.SATURDAY_MODE?.dateAct || "";
            const timeFromServer = res?.SATURDAY_MODE?.timeAct || "";
            const durFromServer  = res?.SATURDAY_MODE?.duration ?? "";

            setForm({
                date: toInputDate(dateFromServer),
                time: timeFromServer,
                duration: String(durFromServer),
            });
            succeed();
        } catch (e) {
            fail(e);
        }
    }, [start, succeed, fail]);

    const save = useCallback(async () => {
        const payload = {
            dateAct: toServerDate(form.date),
            timeAct: form.time,
            duration: parseInt(form.duration, 10),
        };

        if (!validateClient(payload)) {
            throw new Error("בדוק תאריך/שעה/משך: פורמט לא תקין");
        }

        await run(() => esp.setSaturday(payload), { successMessage: "Saturday mode saved" });

        // עדכון מקומי של התצוגה
        setSensors((s) => ({
            ...s,
            SATURDAY_MODE: {
                ...(s?.SATURDAY_MODE || {}),
                dateAct: payload.dateAct,
                timeAct: payload.timeAct,
                duration: payload.duration,
            },
        }));
    }, [form, run]);

    useEffect(() => { load(); }, [load]);

    return { sensors, form, setForm, load, save, loading, ok, err, message };
}


export function ManualLoad(){
    const { loading, ok, err, message, start, succeed, fail, run } = useRequestStatus();
    const [sensors, setSensors] = useState(null);
    const [enabled, setEnabled] = useState(false);

    const load = useCallback(async () => {
        start();
        try {
            const res = await esp.getSensors();
            setSensors(res);
            setEnabled(Boolean(res?.MANUAL_MODE?.enabled));
            succeed();
        } catch (e) {
            fail(e);
        }
    }, [start, succeed, fail]);

    const save = useCallback(async (nextEnabled) => {
        const value = typeof nextEnabled === "boolean" ? nextEnabled : enabled;
        await run(() => esp.setEnabled(value), {
        });
        setSensors((s) => ({...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: value },}));
    }, [enabled, run]);

    useEffect(() => { load(); }, [load]);

    return { sensors, enabled, setEnabled, load, save, loading, ok, err, message };
}