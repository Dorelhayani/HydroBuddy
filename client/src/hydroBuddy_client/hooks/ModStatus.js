/* ===== ModStatus.js ===== */

import React from "react";
import {useT} from "../../local/useT";

export default function ModStatus({ isActive, name, temp, light, moist }) {
    const {t} = useT();
    const loading = false;

    return (
        <span
            className={`mod-status__badge mod-status__${name.toLowerCase()} ${isActive ? "is-on" : "is-off"}`}
            aria-busy={loading}>
            <span className="mod-status__dot" />
            {isActive ? `${t("mod.active")}` : `${t("mod.inactive")}`}
            {/*{isActive ? "Active" : "Inactive"}*/}

            {/*<div> temp: {temp ?? '-'}</div>*/}
            {/*<div> Light: {light ?? '-'} </div>*/}
            {/*<div> Moisture: {moist ?? '-'}</div>*/}


            <div> {t("mod.temp_label")}: {temp ?? '-'}</div>
            <div> {t("mod.light_label")}: {light ?? '-'} </div>
            <div> {t("mod.moisture_label")}: {moist ?? '-'}</div>
        </span>
    );
}

