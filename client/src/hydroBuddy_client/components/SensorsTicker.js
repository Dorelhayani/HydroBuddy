// SensorsTicker.js

import React, { useEffect } from "react";
import { useEsp } from "../hooks/useEsp";

export default function SensorsTicker() {
    const { sensors, refetch } = useEsp();

    useEffect(() => {
        const id = setInterval(() => {
            refetch.fetchEspState();
        }, 5000);
        return () => clearInterval(id);
    }, [refetch]);

    const temp  = sensors?.TEMP_MODE?.temp ?? "-";
    const light = sensors?.TEMP_MODE?.light ?? "-";
    const moist = sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-";

    return (
        <div className="grid">
            <div className="txt">Temperature</div><div className="valueBox">{String(temp)}</div>
            <div className="txt">Light</div><div className="valueBox">{String(light)}</div>
            <div className="txt">Soil Moisture</div><div className="valueBox">{String(moist)}</div>
        </div>
    );
}
