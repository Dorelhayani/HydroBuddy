import React from "react";
import { formatDateDDMMYYYY } from "../domain/formatters";

const MATERIAL_ICON_MAP = {
    tomato: "local_florist",
    basil: "spa",
    pepper: "local_florist",
    mint: "eco",
    cactus: "yard",           // אין "cactus" רשמי; 'yard' נותן וייב צמח/עץ
    lemon: "energy_savings_leaf",
    rose: "local_florist",

    // עברית (אם יש לך planttype_name בעברית)
    "עגבניה": "local_florist",
    "בזיליקום": "spa",
    "פלפל": "local_florist",
    "נענע": "eco",
    "קקטוס": "yard",
    "לימון": "energy_savings_leaf",
    "ורד": "local_florist",

    _default: "potted_plant", // קיים ב-Material Symbols
};

function normalize(name = "") { return String(name).trim().toLowerCase(); }

export function iconNameFor(planttypeName = "") {
    const key = normalize(planttypeName);
    return MATERIAL_ICON_MAP[key] || MATERIAL_ICON_MAP._default;
}

export function PlantIcon({ name, size = 20, fill = 1, weight = 400, grade = 0, opsz = 24, className = "" }) {
    const sym = iconNameFor(name);
    return (
        <span
            className={`msr ${className}`}
            aria-hidden="true"
            style={{
                fontSize: size,
                fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`,
            }}
        >
      {sym}
    </span>
    );
}

export function moistureLevel(moisture) {
    if (moisture == null || !Number.isFinite(moisture)) return "neutral";
    if (moisture < 25) return "alert";
    if (moisture < 40) return "warn";
    return "ok";
}

export function plantRenderer({ espState, espLoading }) {
    return function renderPlantRow(p) {
        const moisture = espState?.moisture;
        const pumpOn   = !!espState?.isPumpON;
        const updatedAt = espState?.updatedAt;
        const level = moistureLevel(moisture);

        return (
            <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PlantIcon name={p.planttype_name} size={20} fill={1} weight={400} />
                    <h6>{p.planttype_name}</h6>
                </div>

                <div className={`badge ${level}`} aria-busy={espLoading ? "true" : "false"}>
                    {espLoading || espState == null ? (
                        <>…</>
                    ) : (
                        <>
                            <span className="dot" />
                            <span>moisture: {Number.isFinite(moisture) ? `${moisture}%` : "—"}</span>
                            <span className="sep">·</span>
                            <span>pump: {pumpOn ? "ON" : "OFF"}</span>
                            {updatedAt && (
                                <>
                                    <span className="sep">·</span>
                                    <span>updated: {formatDateDDMMYYYY(new Date(updatedAt))}</span>
                                </>
                            )}
                        </>
                    )}
                </div>
            </>
        );
    };
}