/* ===== useEsp.js ===== */

import { startTransition, useCallback, useEffect,useMemo, useRef, useState } from "react";

import { toServerDate } from "../../../shared/domain/formatters";
import { useRequestStatus } from "../../../shared/hooks/RequestStatus";
import { esp } from "../services/esp";

function shallowEqual(a, b) {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

    const ak = Object.keys(a), bk = Object.keys(b);
    if (ak.length !== bk.length) return false;

    for (const k of ak) { if (a[k] !== b[k]) return false; }
    return true;
}

export function useEsp() {
    const [form, setForm] = useState({ state: "" });
    const [sensors, setSensors] = useState(null);

    const wsRef = useRef(null);
    const lastRef = useRef(null);
    const [wsError, setWsError] = useState(null);

    const pickDefined = (obj) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

    const mutate = useRequestStatus();
    const toFiniteInt   = (v) => Number.isFinite(+v) ? parseInt(v,10) : undefined;
    const toFiniteFloat = (v) => Number.isFinite(+v) ? parseFloat(v) : undefined;

    const fetchState = useCallback(async () => {
        try {
            const data = await esp.getState();
            if (!shallowEqual(lastRef.current, data)) {
                lastRef.current = data;
                startTransition(() => setSensors(data));
            }
        } catch (e) {
            console.error("Failed to fetch initial ESP state:", e);
        }
    }, []);

    const fetchStateSave = useCallback(async ({ state }) => {
        return mutate.run(async () => {
            await esp.setState({ state: state })
            setForm({ state: String(state) });
            return state;
        }, { successMessage: "state saved", errorMessage: "failed to save state." });
    }, [mutate]);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsHost = window.location.hostname;
        const wsPort = 5050;
        const wsUrlFinal = `${wsProtocol}://${wsHost}:${wsPort}/ws/sensors`;
        wsRef.current = new WebSocket(wsUrlFinal);

        wsRef.current.onopen = () => {
            console.log("WebSocket connected. Fetching initial state...");
            setWsError(null);
            fetchState();
        };

        wsRef.current.onmessage = (event) => {
            try {
                const raw = JSON.parse(event.data);
                const data = raw?.type === 'SENSORS_UPDATE' ? raw.payload : raw;

                if (!shallowEqual(lastRef.current, data)) {
                    lastRef.current = data;
                    startTransition(() => setSensors(data));
                }
            } catch (e) {
                console.error("Failed to parse WS message:", e);
            }
        };


        wsRef.current.onerror = (error) => {
            console.error("WebSocket Error:", error);
            setWsError("Connection Error");
        };

        wsRef.current.onclose = () => {
            console.warn("WebSocket closed. Attempting reconnect in 5s...");
            setWsError("Disconnected");
        };

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                wsRef.current.close(1000, "Component unmounted");
            }
        };
    }, [fetchState]);

    const fetchEspState = fetchState;
    const fetchDataMod = useCallback(async () => { return sensors?.dataMode ?? null; }, [sensors]);
    const currentState = sensors?.state ?? form.state ?? "";

    const temp = useCallback(async (formPayload) => {
        const payload = pickDefined({
            tempTarget: toFiniteFloat(formPayload.tempTarget),
            hysteresis: toFiniteFloat(formPayload.hysteresis),
            runMin: toFiniteInt(formPayload.runMin),
            cooldown: toFiniteInt(formPayload.cooldown),
            daylightOnly: formPayload.daylightOnly === true ||
              formPayload.daylightOnly === 'true' || formPayload.daylightOnly === 1,
            lightGate: toFiniteInt(formPayload.lightGate),
        });

        await mutate.run(async () => {
            await esp.setTempConfig(payload);
            await fetchEspState();
            },
          { successMessage: "Temperature mode saved" });
        }, [mutate, fetchEspState]);

    const moist = useCallback(async (formPayload) => {
        const payload = {
            moistureTarget: toFiniteFloat(formPayload.moistureTarget),
            hysteresis: toFiniteFloat(formPayload.hysteresis),
            runMin: toFiniteInt(formPayload.runMin),
            cooldown: toFiniteInt(formPayload.cooldown),
            daylightOnly: formPayload.daylightOnly === true ||
              formPayload.daylightOnly === 'true' || formPayload.daylightOnly === 1,
            lightGate: toFiniteInt(formPayload.lightGate),
        };
        await mutate.run(async () => {
              await esp.setMoistConfig(payload);
              await fetchEspState();
          },
          { successMessage: "Moisture mode saved" });
    }, [mutate, fetchEspState]);

    const saturday = useCallback(async (formPayload) => {
        const payload = {
            dateAct: toServerDate(formPayload.date),
            timeAct: formPayload.time,
            duration: parseInt(formPayload.duration, 10),
        };
        await mutate.run(async () => {
            await esp.setSaturday(payload);
            await fetchEspState();
        },
          { successMessage: "Saturday mode saved" });
    }, [mutate, fetchEspState]);

    const manual = useCallback(async (enabled) => {
        return mutate.run(async () => {
            const res = await esp.setEnabled(enabled);
            await fetchEspState();
            return !!res?.MANUAL_MODE?.enabled;
        },
          { successMessage: "Manual mode saved" });
    }, [mutate,fetchEspState]);

        const temp_sensor = useCallback(async (tempValue) => {
        const t = toFiniteFloat(tempValue);
        if (t === undefined) throw new Error("Insert valid temp");
        await mutate.run(async () => {
            await esp.TempReading({ temp: t });
            await fetchEspState();
        },
          { successMessage: "Temp reading updated" });
    }, [mutate, fetchEspState]);

    const light_sensor = useCallback(async (lightValue) => {
        const payload = { light: parseInt(lightValue, 10) };
        if (!Number.isInteger(payload.light)) throw new Error("Insert valid light (int)");
        await mutate.run(async () => {
            await esp.LightReading(payload);
            await fetchEspState();
        },
          { successMessage: "Light reading updated" });
    }, [mutate, fetchEspState]);

    const moisture_sensor = useCallback(async (moistValue) => {
        const payload = { moisture: parseInt(moistValue, 10) };
        if (!Number.isInteger(payload.moisture)) throw new Error("Insert valid moisture (int)");
        await mutate.run(async () => {
            await esp.MoistReading(payload);
            await fetchEspState();
        }, { successMessage: "Moisture reading updated" });
    }, [mutate, fetchEspState]);

    const refetch = useMemo(() => ({ fetchEspState, fetchDataMod, fetchStateSave })
      ,[fetchEspState, fetchDataMod, fetchStateSave]);

    return {
        sensors, setSensors, currentState,
        temp, moist, saturday, manual, updateTemp: temp_sensor, updateMoist: moisture_sensor, updateLight: light_sensor,
        form, setForm,

        loading: mutate.loading,
        err: mutate.err,
        error: mutate.err,

        pollLoading: false,
        pollErr: wsError,

        refetch,
    };
}