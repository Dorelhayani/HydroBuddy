/* ===== Mod.js ===== */

import React, { useCallback, useEffect,useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import {useT} from "../../../../local/useT";
import { toInputDate } from "../../../shared/domain/formatters";
import { useRequestStatus } from "../../../shared/hooks/RequestStatus";
import { useSnapshotOnOpen } from "../../../shared/hooks/useSnapshotOnOpen";
import FlashButton from "../../../ui/ButtonGenerate";
import Card, { useBorderFlash } from "../../../ui/Card";
import ClickableList from "../../../ui/ClickableList";
import FlipCard from "../../../ui/FlipCard";
import GenericForm from "../../../ui/FormGenerate";
import RequestBanner from "../../../ui/RequestBanner";
import ToggleSwitch from "../../../ui/ToggleSwitch";
import { useAuth } from "../../auth/hooks/useAuth";
import ModIcon from "../components/ModIcon";
import ModStatus from "../components/ModStatus";
import { useEsp } from "../hooks/useEsp";


const ModDisplay = React.memo(function ModDisplay({
                                                      variant,
                                                      MODS,
                                                      currentState,
                                                      sensors,
                                                      loading,
                                                      authLoading,
                                                      authErr,
                                                      onPickMode,
                                                  }) {
    const { t, dir } = useT();
    const [pendingValue, setPendingValue] = useState(null);
    const selectedItem = useMemo(
        () => MODS.find(m => m.value === Number(currentState)) ?? null,
        [MODS, currentState]
    );

    function onKeyActivate(e, action) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); action(); } }

    return (
        <Card
            variant={variant}
            header={
                <div className="mx-auto-flex mb-8">
                    <small className="text-lg fw-600 mb-8 stack-8">{t("mod.title")}</small>
                </div>
            }
            body={
                <>
                    <RequestBanner loading={authLoading || loading} errorText={authErr} />
                    <ClickableList
                        items={MODS}
                        role="button"
                        tabIndex={0}
                        itemKey="value"
                        className="text-muted"
                        selected={selectedItem}
                        onItemClick={(m) => onPickMode(m, setPendingValue)}
                        onKeyDown={(e) => onKeyActivate(e, () => onPickMode(e, setPendingValue))}
                        getDisabled={(m) => pendingValue === m.value || loading || authLoading}
                        renderItem={(m) => {
                            const isActive = Number(currentState) === m.value;
                            const te = sensors?.TEMP_MODE;
                            const mo = sensors?.SOIL_MOISTURE_MODE;
                            const sa = sensors?.SATURDAY_MODE;
                            const ma = sensors?.MANUAL_MODE;
                            const modeId = m.id;

                            const readings =
                                modeId === "temp" ? { temp: te?.temp, light: te?.light } :
                                    modeId === "moisture" ? { moisture: mo?.moisture } :
                                        modeId === "saturday" ? { enabled: !!sa?.enabled, dateAct: sa?.dateAct,
                                                timeAct: sa?.timeAct, duration: sa?.duration,
                                                isRunningNow: !!sa?.isRunningNow, window: sa?.window } :
                                            modeId === "manual" ? { enabled: !!ma?.enabled, pump: sensors?.pump }
                                                : {};
                            let thresholds = {};
                            let txt = "";
                            if (modeId === "temp") {
                                const tempLVL = Number(te?.tempLVL);
                                const H = Number.isFinite(tempLVL) ? 1 : 0;
                                thresholds = Number.isFinite(tempLVL)
                                    ? { temp: { low: tempLVL - H, high: tempLVL + H, hysteresis: H } }  : {};

                            } else if (modeId === "moisture") {
                                thresholds = mo?.min !== undefined && mo?.max !== undefined
                                    ? { moisture: { low: Number(mo.min), high: Number(mo.max) } } : {};

                            } else if (modeId === "saturday") {
                                // txt = `Set to: ${sa?.dateAct} at ${sa?.timeAct} for ${sa?.duration} minutes`;
                                txt = `${t("mod_status.set_to")} ${sa?.dateAct} ${t("mod_status.at")} ${sa?.timeAct} 
                                ${t("mod_status.for")} ${sa?.duration} ${t("mod_status.minutes")}`;
                            } else { thresholds = {}; }

                            const flags = {
                                isActive,
                                loading: !!(authLoading || loading),
                                pending: pendingValue === m.value,
                                disabled: false,
                            };

                            const meta = { updatedAt: sensors?.updatedAt || te?.updatedAt ||
                                    mo?.updatedAt || sa?.txt || ma?.updatedAt };

                            return (
                                <div className="tile tile--sm" onClick={() => onPickMode(m, setPendingValue)}>
                                    <div className={`mod__avatar ${m.id}`}>
                                        <ModIcon modeId={modeId} readings={readings} thresholds={thresholds} txt={txt}
                                                 flags={flags} meta={meta}  className="mod-icon" />
                                    </div>

                                    <div className="tile tile--free">
                                        <div className="tile__title title text-muted-500">{m.label}</div>
                                        <div className="text-muted-500">
          <span className="mod-status">
              <ModStatus
                  isActive={isActive}
                  modeId={modeId}
                  readings={readings}
                  thresholds={thresholds}
                  flags={flags}
                  txt={txt}
                  meta={meta}
                  name={m.id}
                  temp={te?.temp}
                  light={te?.light}
                  moisture={mo?.moisture} />
          </span>
                                        </div>
                                    </div>
                                    <i className={`tile__chev fa-solid 
                                    ${dir === "rtl" ? "fa-caret-left" : "fa-caret-right"} fa-beat-fade`} />
                                </div>
                            );
                        }}
                        emptyContent="No mods yet"
                    />
                </>
            }
            footer=" "
        />
    );
});

const Temperature = React.memo(function Temperature({ variant, unflip, isOpen, sensors, authLoading, authErr,
                                                        onSubmitTemp }) {
    const {t} = useT();
    const stts = useRequestStatus();
    const tmp  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

    useEffect(() => {}, [isOpen, tmp, sensors?.TEMP_MODE]);

    const fields = useMemo(() => ([
        { name: "temp", label: `${t("mod.temp_label")}`, placeholder: tmp?.temp, disabled:true},
        { name: "tempLVL", label: `${t("mod.tempLVL_label")}`, placeholder: tmp?.tempLVL, type:"number" },
        { name: "minTime", label: `${t("mod.minTime_label")}`, placeholder: tmp?.minTime, type:"number" },
        { name: "maxTime", label: `${t("mod.maxTime_label")}`, placeholder: tmp?.maxTime, type:"number" },
        { name: "light", label: `${t("mod.light_label")}`, placeholder: tmp?.light, disabled:true },
        { name: "lightThresHold", label: `${t("mod.lightThresHold_label")}`, placeholder: tmp?.lightThresHold, type:"number" },
        { name: "minLight", label: `${t("mod.minLight_label")}`, placeholder: tmp?.minLight, type:"number" },
        { name: "maxLight", label: `${t("mod.maxLight_label")}`, placeholder: tmp?.maxLight, type:"number" },
    ]), [t,tmp]);

    const initValsTemp = useMemo(() => ({
        temp: tmp?.temp ?? "",
        tempLVL: tmp?.tempLVL ?? "",
        minTime: tmp?.minTime ?? "",
        maxTime: tmp?.maxTime ?? "",
        light: tmp?.light ?? "",
        lightThresHold: tmp?.lightThresHold ?? "",
        minLight: tmp?.minLight ?? "",
        maxLight: tmp?.maxLight ?? "",
    }), [tmp]);

    const onSubmit = useCallback((values) => {
        return stts.run(async () => {
            await onSubmitTemp(values);
        }, {
            successMessage: t("mod.temp_saved_success") || "Temperature mode saved",
            errorMessage:   t("mod.temp_saved_error")   || "Failed to save temperature mode",
        });
    }, [stts, onSubmitTemp, t]);

    return (
        <Card variant={variant}
              header={
                  <>
                      <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                          <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                      </FlashButton>
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">{t("mod.temp_title")}</h5></div>
                  </>
              }
              body={
                  <>
                      <RequestBanner loading={authLoading || stts.loading} errorText={authErr || stts.error} />
                      <GenericForm
                          className="form--inline form--roomy stack-16"
                          labelClassNameAll="label-muted"
                          placeholderClassAll="ph-muted ph-lg"
                          rowClassNameAll="text-sm fw-600"
                          fields={fields}
                          initialValues={initValsTemp}
                          onSubmit={onSubmit}
                          submitLabel="Save Temperature Mode"
                          customButton={({ onClick, loading }) => (
                              <FlashButton
                                  size="sm"
                                  className="btn btn--primary btn--block shadow-md"
                                  onClickAsync={() => { unflip(); onClick(); }}
                                  loading={loading || authLoading}
                                  disabled={authLoading}
                              >{t("mod.update")}</FlashButton>
                          )}
                      />
                  </>
              }
              footer={<div className="m-0" />}
        />
    );
});

const Moisture = React.memo(function Moisture({
                                                  variant, unflip, isOpen,
                                                  sensors, authLoading, authErr,
                                                  onSubmitMoist,
                                              }) {
    const {t} = useT();
    const stts = useRequestStatus();
    const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);

    useEffect(() => {
        console.log("[ESP-DBG][Moisture] open?", isOpen, { snapshot: m, current: sensors?.SOIL_MOISTURE_MODE });
    }, [isOpen, m, sensors?.SOIL_MOISTURE_MODE]);

    const fields = useMemo(() => ([
        { name: "moisture", label: `${t("mod.moisture_label")}`, placeholder: m?.moisture, type: "number", disabled:true },
        { name: "moistureLVL", label: `${t("mod.moistureLVL_label")}`, placeholder: m?.moistureLVL, type: "number" },
        { name: "minMoisture", label: `${t("mod.minMoisture_label")}`, placeholder: m?.minMoisture, type: "number" },
        { name: "maxMoisture", label: `${t("mod.maxMoisture_label")}`, placeholder: m?.maxMoisture, type: "number" },
    ]), [m,t]);

    const initValsMoist = useMemo(() => ({
        moisture: m?.moisture ?? "",
        moistureLVL: m?.moistureLVL ?? "",
        minMoisture: m?.minMoisture ?? "",
        maxMoisture: m?.maxMoisture ?? "",
    }), [m]);


    const onSubmit = useCallback((values) => {
        return stts.run(async () => {
            await onSubmitMoist(values);
        }, {
            successMessage: t("mod.moisture_saved_success") || "Moisture mode saved",
            errorMessage:   t("mod.moisture_saved_error")   || "Failed to save Moisture mode",
        });
    }, [stts, onSubmitMoist, t]);


    return (
        <Card variant={variant}
              header={
                  <>
                      <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                          <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                      </FlashButton>
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">{t("mod.moisture_title")}</h5></div>
                  </>
              }
              body={
                  <>
                      <RequestBanner loading={authLoading || stts.loading} errorText={authErr || stts.error} />
                      <GenericForm
                          key="moisture"
                          fields={fields}
                          className="form--inline form--roomy stack-16"
                          labelClassNameAll="label-muted"
                          placeholderClassAll="ph-muted ph-lg"
                          rowClassNameAll="text-sm fw-600"
                          initialValues={initValsMoist}
                          onSubmit={onSubmit}
                          submitLabel="Save Moisture Mode"
                          customButton={({ onClick, loading }) => (
                              <FlashButton
                                  size="sm"
                                  className="btn btn--primary btn--block shadow-md"
                                  onClickAsync={() => { unflip(); onClick(); }}
                                  loading={loading || authLoading}
                                  disabled={authLoading}
                              >{t("mod.update")}</FlashButton>
                          )}
                      />
                  </>
              }
              footer={<div className="m-0" />}
        />
    );
});

const Saturday = React.memo(function Saturday({
                                                  variant, unflip, isOpen,
                                                  sensors, authLoading, authErr,
                                                  onSubmitSaturday,
                                              }) {
    const {t} = useT();
    const stts = useRequestStatus();
    const s = useSnapshotOnOpen(sensors?.SATURDAY_MODE, isOpen);
    const safe = s ?? sensors?.SATURDAY_MODE ?? {};

    useEffect(() => {
        console.log("[ESP-DBG][Saturday] open?", isOpen, { snapshot: s, current: sensors?.SATURDAY_MODE });
    }, [isOpen, s, sensors?.SATURDAY_MODE]);

    const fields = useMemo(() => ([
        { name: "date", label: `${t("mod.date_label")}`, placeholder: s?.dateAct, type: "date", required: true,},
        { name: "time", label: `${t("mod.time_label")}`, placeholder: s?.timeAct, type: "time", required: true },
        { name: "duration", label: `${t("mod.duration_label")}`, placeholder: s?.duration,
            type: "number", required: true, min: 1, step: 1  },
    ]), [s,t]);

    const initValsSat = useMemo(() => ({
        date: toInputDate(safe?.dateAct || ""),
        time: safe?.timeAct || "",
        duration: safe?.duration != null ? String(safe.duration) : "",
    }), [safe]);

    const onSubmit = useCallback((values) => {
        return stts.run(async () => {
            await onSubmitSaturday(values);
        }, {
            successMessage: t("mod.saturday_saved_success") || "Saturday mode saved",
            errorMessage:   t("mod.saturday_saved_error")   || "Failed to save Saturday mode",
        });
    }, [stts, onSubmitSaturday, t]);

    return (
        <Card variant={variant}
              header={
                  <>
                      <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                          <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                      </FlashButton>
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">{t("mod.saturday_title")}</h5></div>
                  </>
              }
              body={
                  <>
                      <RequestBanner loading={authLoading || stts.loading} errorText={authErr || stts.error} />
                      <GenericForm
                          key="Saturday"
                          fields={fields}
                          className="form--inline form--roomy"
                          labelClassNameAll="label-muted "
                          placeholderClassAll="ph-muted ph-lg"
                          rowClassNameAll="text-sm fw-600"
                          initialValues={initValsSat}
                          onSubmit={onSubmit}
                          submitLabel="Save Staurday Mode"
                          text={
                              <span className="txt">
                Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"}
                                  at {sensors?.SATURDAY_MODE?.timeAct ?? "-"}
                                  for {sensors?.SATURDAY_MODE?.duration ?? "-"}
              </span>
                          }
                          customButton={({ onClick, loading }) => (
                              <FlashButton
                                  size="sm"
                                  className="btn btn--primary btn--block shadow-md"
                                  onClickAsync={() => { unflip(); onClick(); }}
                                  loading={loading || authLoading}
                                  disabled={authLoading}
                              >{t("mod.update")}</FlashButton>
                          )}
                      />
                  </>
              }
              footer={<div className="footer-row" />}
        />
    );
});

const Manual = React.memo(function Manual({
                                              variant, unflip, isOpen,
                                              sensors, setSensors, authLoading, authErr,
                                              wsLoading,
                                              manualToggle,
                                          }) {
    const {t} = useT();
    const stts = useRequestStatus();
    const mSnap  = useSnapshotOnOpen(sensors?.MANUAL_MODE, isOpen);
    const [enabled, setEnabled] = React.useState(Boolean(mSnap?.enabled));

    React.useEffect(() => {
        const next = Boolean(sensors?.MANUAL_MODE?.enabled);
        if (enabled !== next) {
            console.log("[ESP-DBG][Manual] enabled changed (sensors)", { prev: enabled, next });
        }
        setEnabled(prev => (prev === next ? prev : next));
    }, [enabled]);

    const handleToggle = async (next) => {
        console.groupCollapsed("[ESP-DBG][Manual] toggle");
        console.log("click next:", next);
        setEnabled(next);
        setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));
        console.log("optimistic setSensors enabled:", next);

        try {
            const committed = await manualToggle(next);
            console.log("committed from server:", committed);
            setEnabled(committed);
            setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed }}));
        } catch (e) {
            console.log("toggle failed, revert:", e);
            setEnabled(prev => !prev);
            setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: !next } }));
        } finally {
            console.groupEnd();
        }
    };

    useEffect(() => {
        console.log("[ESP-DBG][Manual] open?", isOpen, { snapshot: mSnap, current: sensors?.MANUAL_MODE });
    }, [isOpen, mSnap, sensors?.MANUAL_MODE]);

    return (
        <Card
            variant={variant}
            header={
                <>
                    <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                        <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                    </FlashButton>
                    <div className="mx-auto-flex" >
                        <h5 className="m-0 text-2xl">{t("mod.manual_title")}</h5>
                    </div>
                </>
            }
            body={
                <>
                    <RequestBanner loading={authLoading || stts.loading} errorText={authErr || stts.error} />
                    <div className="manual-row">
                        <div className="label">{t("mod.pump_enabled")}</div>
                        <div className="push-right ">
                            <ToggleSwitch
                                checked={enabled}
                                onToggle={handleToggle}
                                disabled={authLoading || wsLoading}
                            />
                        </div>
                    </div>
                </>
            }
            footer={<div className="" />}
        />
    );
});

/* ================
   Main Mod component
   ================ */

export default function Mod({ embed = false }) {
    const {t} = useT();
    const [flipped, setFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState("mod_display");
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const { loading: authLoading, err: authErr } = useAuth();

    const {
        temp, moist, saturday, manual,
        sensors, setSensors, currentState,
        setForm: setModeForm,
        refetch, loading, err } = useEsp();

    const { fetchStateSave } = refetch;

    useEffect(() => {
        console.log("[ESP-DBG][Mod] render", {
            flipped, activeTab, currentState,
            sensorsSummary: sensors ? {
                state: sensors.state,
                TEMP_MODE: !!sensors.TEMP_MODE,
                SOIL_MOISTURE_MODE: !!sensors.SOIL_MOISTURE_MODE,
                SATURDAY_MODE: !!sensors.SATURDAY_MODE,
                MANUAL_MODE: !!sensors.MANUAL_MODE,
            } : null
        });
    });

    const MODS = useMemo(() => ([
        { id: "temp", label: `${t("mod.temp_title")}`, value: 61, tab: "temperature" },
        { id: "moisture", label: `${t("mod.moisture_title")}`, value: 62, tab: "moisture" },
        { id: "saturday", label: `${t("mod.saturday_title")}`, value: 63, tab: "saturday" },
        { id: "manual", label: `${t("mod.manual_title")}`, value: 64, tab: "manual" }
    ]), [t]);

    const onPickMode = useCallback(async (m, setPendingValue) => {
        console.groupCollapsed("[ESP-DBG][ModDisplay] pick mode");
        console.log("picked", m);
        try {
            setPendingValue?.(m.value);
            setActiveTab(m.tab);
            console.log("setActiveTab =>", m.tab);
            setSensors(s => ({ ...s, state: Number(m.value) }));
            await fetchStateSave({ state: Number(m.value) });
            console.log("fetchStateSave done");
            setModeForm({ state: String(m.value) });
            setFlipped(true);
            console.log("flip -> true");
            flashSuccess();
        } catch (e) {
            console.log("handlePickMode error:", e);
            flashDanger();
        } finally {
            setPendingValue?.(null);
            console.groupEnd();
        }
    }, [setSensors,fetchStateSave, setModeForm, flashSuccess, flashDanger]);

    const front = ({ flip }) => (
        <ModDisplay
            variant={variant}
            MODS={MODS}
            currentState={sensors?.state ?? currentState}
            sensors={sensors}
            loading={loading}
            authLoading={authLoading}
            authErr={authErr || err}
            onPickMode={(m, setPending) => {
                if (!flipped) { console.log("[ESP-DBG][Mod] front.flip()"); flip?.(); }
                onPickMode(m, setPending);
            }}
        />
    );

    const isTempOpen = activeTab === "temperature" && flipped;
    const isMoistOpen = activeTab === "moisture" && flipped;
    const isSatOpen   = activeTab === "saturday" && flipped;
    const isManOpen   = activeTab === "manual" && flipped;

    const back = ({ unflip }) => (
        activeTab === "temperature" ? (
            <Temperature
                variant={variant}
                unflip={() => { if (flipped) { console.log("[ESP-DBG][Mod] back.unflip()"); unflip(); } }}
                isOpen={isTempOpen} sensors={sensors} authLoading={authLoading} authErr={authErr} onSubmitTemp={temp}
            />
        ) : activeTab === "moisture" ? (
            <Moisture
                variant={variant}
                unflip={() => { if (flipped) { console.log("[ESP-DBG][Mod] back.unflip()"); unflip(); } }}
                isOpen={isMoistOpen} sensors={sensors} authLoading={authLoading} authErr={authErr} onSubmitMoist={moist}
            />
        ) : activeTab === "saturday" ? (
            <Saturday
                variant={variant}
                unflip={() => { if (flipped) { console.log("[ESP-DBG][Mod] back.unflip()"); unflip(); } }}
                isOpen={isSatOpen} sensors={sensors} authLoading={authLoading} authErr={authErr}
                onSubmitSaturday={saturday}
            />
        ) : activeTab === "manual" ? (
            <Manual
                variant={variant}
                unflip={() => { if (flipped) { console.log("[ESP-DBG][Mod] back.unflip()"); unflip(); } }}
                isOpen={isManOpen} sensors={sensors} setSensors={setSensors} authLoading={authLoading}
                err={authErr || err} wsLoading={loading} manualToggle={manual}
            />
        ) : null
    );

    const content = (
        <div className="cards-grid">
            <FlipCard
                front={front}
                back={back}
                flippable
                isFlipped={flipped}
                onFlip={(v) => { console.log("[ESP-DBG][Mod] onFlip", v); setFlipped(v); }}
            />
        </div>
    );

    return embed ? content : (
        <div className="main-container">
            {content}
            <Outlet />
        </div>
    );
}
