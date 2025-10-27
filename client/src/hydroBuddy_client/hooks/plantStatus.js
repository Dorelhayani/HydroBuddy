/* ===== PlantStatus.js ===== */

import { useEffect, useRef, useState } from "react";

const fmt = (d) =>
    new Intl.DateTimeFormat("he-IL", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).format(d ?? new Date());

export default function PumpStatus() {
    const [pump, setPump] = useState({ on: false, updatedAt: null });
    const [loading, setLoading] = useState(false);

    const prevOnRef = useRef(pump.on);
    const [events, setEvents] = useState([]);

    async function fetchState() {
        try {
            setLoading(true);
            const res = await fetch("/esp/state", { credentials: "include" });
            const json = await res.json();
            const next = json?.pump ?? { on: false, updatedAt: null };

            const prev = prevOnRef.current;
            const curr = !!next.on;
            if (prev !== curr) {
                const when = next.updatedAt ? new Date(next.updatedAt) : new Date();
                const msg = curr ? "turned ON" : "turned OFF";
                console.info(`[PUMP] ${msg} @ ${fmt(when)}`);
                setEvents((arr) => [{ at: when.toISOString(), on: curr, text: msg }, ...arr].slice(0, 10));
                prevOnRef.current = curr;
            }
            setPump(next);
        } catch (e) {
            console.warn("Failed to fetch /esp/state", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchState();
        const id = setInterval(fetchState, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="pump-status " aria-busy={loading}>
            <span className={`pump-status__badge ${pump.on ? "is-on" : "is-off"}`}>
        <span className="pump-status__dot" />
        pump: {pump.on ? "ON" : "OFF"}
      </span>

            {events.length > 0 && (
                <ul className="pump-status__events text-truncate text-xs">
                    {events.map((e, i) => (
                        <li key={i}> {e.text}  {fmt(new Date(e.at))}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
