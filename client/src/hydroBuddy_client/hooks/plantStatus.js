// plantStatus.js

import { useEffect, useState } from "react";
import { formatDateDDMMYYYY } from "../domain/formatters";

export default function PumpBadge() {
    const [pump, setPump] = useState({ on: false, updatedAt: null });
    const [loading, setLoading] = useState(false);

    async function fetchState() {
        try {
            setLoading(true);
            const res = await fetch("/esp/state", { credentials: "include" }); // או headers של device אם צריך
            const json = await res.json();
            setPump(json?.pump ?? { on: false, updatedAt: null });
        } finally { setLoading(false); }
    }

    useEffect(() => {
        fetchState();
        const id = setInterval(fetchState, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <span className={`badge ${pump.on ? "ok" : "neutral"}`} aria-busy={loading}>
      <span className="dot" /> pump: {pump.on ? "ON" : "OFF"}
    </span>
    );
}