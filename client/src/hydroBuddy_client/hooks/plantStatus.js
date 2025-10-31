/* ===== PlantStatus.js ===== */

import { useEffect, useRef, useState } from "react";
import { useEsp } from "./useEsp";

const fmt = (d) =>
    new Intl.DateTimeFormat("he-IL", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).format(d ?? new Date());


export default function PumpStatus() {
    const { sensors, loading: espLoading, pollErr: wsError } = useEsp();
    const pump = sensors?.pump ?? { on: false, updatedAt: null };
    const loading = espLoading;

    const prevOnRef = useRef(pump.on);
    const [events, setEvents] = useState([]);


    useEffect(() => {
        const prev = prevOnRef.current;
        const curr = !!pump.on;

        if (prev !== curr) {
            const when = pump.updatedAt ? new Date(pump.updatedAt) : new Date();
            const msg = curr ? "turned ON" : "turned OFF";
            console.info(`[PUMP] ${msg} @ ${fmt(when)}`);
            setEvents((arr) => [{ at: when.toISOString(), on: curr, text: msg }, ...arr].slice(0, 10));
            prevOnRef.current = curr;
        } else { prevOnRef.current = curr; }
    }, [pump.on, pump.updatedAt]);

    const statusText = wsError ? `WS Error: ${wsError}` : `pump: ${pump.on ? "ON" : "OFF"}`;

    return (
        <div className="pump-status " aria-busy={loading}>
            <span className={`pump-status__badge ${pump.on ? "is-on" : "is-off"}`}>
                <span className="pump-status__dot" />
                {statusText}
            </span>

            {events.length > 0 && (
                <ul className="pump-status__events text-truncate text-xs">
                    {events.map((e, i) => (
                        <li key={i}> {e.text} {fmt(new Date(e.at))}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}