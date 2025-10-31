/* ===== ModStatus.js ===== */

import React from "react";

export default function ModStatus({ isActive, name, temp, light, moist }) {
    const loading = false;

    return (
        <span
            className={`mod-status__badge mod-status__${name.toLowerCase()} ${isActive ? "is-on" : "is-off"}`}
            aria-busy={loading}>
            <span className="mod-status__dot" />
            {isActive ? "Active" : "Inactive"}

            <div> temp: {temp ?? '-'}</div>
            <div> Light: {light ?? '-'} </div>
            <div> Moisture: {moist ?? '-'}</div>
        </span>
    );
}