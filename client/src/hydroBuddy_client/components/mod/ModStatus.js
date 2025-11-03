/* ===== ModStatus.js ===== */

import React from "react";
import {useT} from "../../../local/useT";
import decideModeState from "./ModeState";

export default function ModStatus({meta, modeId, readings, thresholds, flags, isActive,
                                      txt, temp, light, moist, className = ""  }) {
    const {t} = useT();
    const loading = false;
    const desc = decideModeState(modeId, readings, thresholds, flags);

    const KEY = {
        temp: {
            hot: `${t("mod_status.hot")}`,
            cold: `${t("mod_status.cold")}`,
            ok: `${t("mod_status.temp_ok")}`,
            loading: `${t("mod_status.loading")}`,
            disabled:`${t("mod_status.disabled")}` ,
            pending: `${t("mod_status.pending")}`,
            missing: `${t("mod_status.missing")}`,
        },
        moisture: {
            wet: `${t("mod_status.wet")}`,
            dry: `${t("mod_status.dry")}`,
            ok: `${t("mod_status.moist_ok")}`,
            loading: `${t("mod_status.loading")}`,
            disabled: `${t("mod_status.disabled")}`,
            pending: `${t("mod_status.pending")}`,
            missing: `${t("mod_status.missing")}`,
        },
        saturday: {
            running: `${t("mod_status.running")}`,
            scheduled: `${t("mod_status.scheduled")}`,
            idle: `${t("mod_status.idle")}`,
            loading: `${t("mod_status.loading")}`,
            disabled: `${t("mod_status.disabled")}`,
            pending: `${t("mod_status.pending")}`,
            missing: `${t("mod_status.missing")}`,
        },
        manual: {
            on: `${t("mod_status.on")}`,
            off: `${t("mod_status.off")}`,
            loading: `${t("mod_status.loading")}`,
            disabled: `${t("mod_status.disabled")}`,
            pending: `${t("mod_status.pending")}`,
            missing: `${t("mod_status.missing")}`,
        },
    };
    const key = KEY?.[modeId]?.[desc.state] || "mod.status.na";
    const displayText = modeId === "saturday" && typeof txt === "string" && txt.trim().length
        ? txt : t(key, typeof desc.delta === "number" ? { delta: desc.delta } : undefined);
    return (
        <>
            <span className={`mod-status__badge mod-status__${className} ${isActive ? "on" : "off"}`}
                aria-busy={loading}>
                <span className="mod-status__dot" />
                <span> {t("mod.temp_label")}: {temp ?? '-'}</span>
                <span> {t("mod.light_label")}: {light ?? '-'} </span>
                <span> {t("mod.moisture_label")}: {moist ?? '-'}</span>
            </span>

            <div className="mod-icon__badge">
                <span className="txt">{displayText}</span>
            {meta?.updatedAt ? (
                <small className="meta"> · {new Date(meta.updatedAt).toLocaleString()}</small>
            ) : null}
            </div>
        </>
    );
}