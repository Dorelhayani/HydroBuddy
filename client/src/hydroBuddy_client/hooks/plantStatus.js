// plantStatus.js

import { useEffect, useRef, useState } from "react";

// עוזר לתאריך קצר (אם כבר יש לך formatDateDDMMYYYY – אפשר להחליף בו)
const fmt = (d) =>
    new Intl.DateTimeFormat("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(d ?? new Date());

export default function PumpBadge() {
    const [pump, setPump] = useState({ on: false, updatedAt: null });
    const [loading, setLoading] = useState(false);

    // נשמור מצב קודם לזיהוי שינוי
    const prevOnRef = useRef(pump.on);
    // היסטוריית אירועים (למשל 10 אחרונים)
    const [events, setEvents] = useState([]);

    async function fetchState() {
        try {
            setLoading(true);
            const res = await fetch("/esp/state", { credentials: "include" });
            const json = await res.json();
            const next = json?.pump ?? { on: false, updatedAt: null };

            // --- דיטקציה של שינוי מצב ---
            const prev = prevOnRef.current;
            const curr = !!next.on;
            if (prev !== curr) {
                const when = next.updatedAt ? new Date(next.updatedAt) : new Date();
                const msg = curr ? "Pump turned ON" : "Pump turned OFF";
                // לוג לקונסול
                console.info(`[PUMP] ${msg} @ ${fmt(when)}`);

                // נעדכן היסטוריה להצגה/דיבוג
                setEvents((arr) => [
                    { at: when.toISOString(), on: curr, text: msg },
                    ...arr,
                ].slice(0, 10));
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

    const lastChange =
        pump.updatedAt ? fmt(new Date(pump.updatedAt)) : "—";

    return (
        <div className="flex flex-col gap-2">
      <span className={`badge ${pump.on ? "ok" : "neutral"}`} aria-busy={loading}>
        <span className="dot" /> pump: {pump.on ? "ON" : "OFF"}
      </span>

            {/* שורת מידע קטנה על מתי עודכן */}
            <small className="text-subtle">
                last change: {lastChange}
            </small>

            {/* אופציונלי: היסטוריית אירועים (אפשר להסתיר אם לא צריך) */}
            {events.length > 0 && (
                <ul className="text-subtle text-xs space-y-1">
                    {events.map((e, i) => (
                        <li key={i}>
                            {e.text} · {fmt(new Date(e.at))}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
