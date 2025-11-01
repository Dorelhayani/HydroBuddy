/* ===== Mod.js ===== */

import { Outlet } from "react-router-dom";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";
import ClickableList from "../components/ClickableList";

import {useT} from "../../local/useT";
import { useEsp } from "../hooks/useEsp";
import { useAuth } from "../hooks/useAuth";
import Icon,{iconName} from "../components/Icons";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSnapshotOnOpen } from "../hooks/useSnapshotOnOpen";
import { toInputDate } from "../domain/formatters";
import ModStatus from "../hooks/ModStatus";

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
    const {t} = useT();
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
                            return (
                                <div className="tile tile--sm" onClick={() => onPickMode(m, setPendingValue)}>
                                    <div className={`tile__avatar ${m.id}`}>
                                        <Icon
                                            name={iconName({ id: m.id})}
                                            size={24}
                                            fill={1}
                                            weight={600}
                                            className="icon"
                                        />
                                    </div>

                                    <div className="tile tile--free">
                                        <div className="tile__title text-muted-500">{m.label}</div>
                                        <div className="text-muted-500">
                      <span className="mod-status">
                        <ModStatus
                            isActive={isActive}
                            name={m.id}
                            temp={te?.temp}
                            light={te?.light}
                            moisture={mo?.moisture}
                        />
                      </span>
                                        </div>
                                    </div>
                                    <i className="tile__chev fa-solid fa-caret-right fa-beat-fade"/>
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

const Temperature = React.memo(function Temperature({
                                                        variant, unflip, isOpen,
                                                        sensors, authLoading, authErr,
                                                        onSubmitTemp,
                                                    }) {
    const {t} = useT();
    const tmp  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

    useEffect(() => {
        console.log("[ESP-DBG][Temperature] open?", isOpen, { snapshot: t, current: sensors?.TEMP_MODE });
    }, [isOpen, tmp, sensors?.TEMP_MODE]);

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
        console.log("[ESP-DBG][Temperature] submit", values);
        return onSubmitTemp(values);
    }, [onSubmitTemp]);

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
                      <RequestBanner loading={authLoading} errorText={authErr} />
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
                                  onClickAsync={() => { console.log("[ESP-DBG][Temperature] click Update"); onClick(); }}
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
        console.log("[ESP-DBG][Moisture] submit", values);
        return onSubmitMoist(values);
    }, [onSubmitMoist]);

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
                      <RequestBanner loading={authLoading} errorText={authErr} />
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
                                  onClickAsync={() => { console.log("[ESP-DBG][Moisture] click Update"); onClick(); }}
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
    }), [safe?.dateAct, safe?.timeAct, safe?.duration]);

    const onSubmit = useCallback((values) => {
        console.log("[ESP-DBG][Saturday] submit", values);
        return onSubmitSaturday(values);
    }, [onSubmitSaturday]);

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
                      <RequestBanner loading={authLoading} errorText={authErr} />
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
                                  onClickAsync={() => { console.log("[ESP-DBG][Saturday] click Update"); onClick(); }}
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
                                              sensors, setSensors, authLoading, err,
                                              wsLoading,
                                              manualToggle,
                                          }) {
    const {t} = useT();
    const mSnap  = useSnapshotOnOpen(sensors?.MANUAL_MODE, isOpen);
    const [enabled, setEnabled] = React.useState(Boolean(mSnap?.enabled));

    React.useEffect(() => {
        const next = Boolean(sensors?.MANUAL_MODE?.enabled);
        if (enabled !== next) {
            console.log("[ESP-DBG][Manual] enabled changed (sensors)", { prev: enabled, next });
        }
        setEnabled(prev => (prev === next ? prev : next));
    }, [sensors?.MANUAL_MODE?.enabled]);

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
                    <RequestBanner loading={wsLoading || authLoading} errorText={err} />
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
        refetch, loading, err
    } = useEsp();

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
                { id: "temp",     label: `${t("mod.temp_title")}`,      value: 61, tab: "temperature" },
                { id: "moisture", label: `${t("mod.moisture_title")}`,  value: 62, tab: "moisture" },
                { id: "saturday", label: `${t("mod.saturday_title")}`,  value: 63, tab: "saturday" },
                { id: "manual",   label: `${t("mod.manual_title")}`,    value: 64, tab: "manual" }
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
    }, [fetchStateSave, setModeForm, flashSuccess, flashDanger]);

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
