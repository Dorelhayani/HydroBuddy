/* ===== Icon.js ===== */

import React from "react";

export const PLANT_ICON_MAP = {
    tomato: "local_florist",
    basil: "spa",
    pepper: "local_florist",
    mint: "eco",
    cactus: "yard",
    lemon: "energy_savings_leaf",
    rose: "local_florist",

    // עברית
    "עגבניה": "local_florist",
    "בזיליקום": "spa",
    "פלפל": "local_florist",
    "נענע": "eco",
    "קקטוס": "yard",
    "לימון": "energy_savings_leaf",
    "ורד": "local_florist",

    _default: "potted_plant",
};

const norm = (s="") => String(s).trim().toLowerCase();

export function iconName({ name="", tab="" } = {}) {
    const k1 = norm(name);
    const k2 = norm(tab);
    return ( PLANT_ICON_MAP[k1] || PLANT_ICON_MAP[k2] || PLANT_ICON_MAP._default || "help" );
}

export default function Icon({
                                 name,
                                 size = 20,
                                 fill = 0,
                                 weight = 400,
                                 grade = 0,
                                 opsz = 24,
                                 className = "",
                                 title,
                                 ariaLabel
                             }) {
    return (
        <span
            className={`msr ${className}`}
            role="img"
            aria-label={ariaLabel || title || name}
            title={title}
            style={{
                display: "inline-block",
                lineHeight: 1,
                fontSize: size,
                fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`
            }}
        >
      {name}
    </span>
    );
}