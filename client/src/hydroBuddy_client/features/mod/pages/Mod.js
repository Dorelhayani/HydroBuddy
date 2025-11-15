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

const ModDisplay = React.memo(function ModDisplay({ variant,MODS,currentState,sensors,
                                                    loading,authLoading,authErr,onPickMode }) {
    const { t, dir } = useT();
    const [pendingValue, setPendingValue] = useState(null);
    const selectedItem = useMemo(() => MODS.find(m => m.value === Number(currentState)) ?? null, [MODS, currentState]);

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
                        items={MODS} role="button"
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
                            // if (modeId === "temp") {
                            //   const target = Number(te?.tempTarget);
                            //   const H = Number(te?.hysteresis);
                            //   thresholds = (Number.isFinite(target) && Number.isFinite(H))?
                            //     { temp: { low: target - H, high: target + H, hysteresis: H } }: {}; }
                            // else if (modeId === "moisture") {
                            //     thresholds = mo?.min !== undefined && mo?.max !== undefined
                            //         ? { moisture: { low: Number(mo.min), high: Number(mo.max) } } : {}; }

                          if (modeId === "temp") {
                            txt = `${t("mod_status.Temperature_target")} ${te?.tempTarget}
                             ${t("mod_status.Light_set")} ${te?.lightGate}`;
                          }

                          else if (modeId === "moisture") {
                            txt = `${t("mod_status.Moisture_target")} ${mo?.moistureTarget}
                             ${t("mod_status.Light_set")} ${mo?.lightGate}`;
                          }

                            else if (modeId === "saturday") {
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

const Temperature = React.memo(function Temperature({ variant, unflip, isOpen, sensors, authLoading, authErr, Submit }) {
  const {t} = useT();
  const stts = useRequestStatus();
  const tmp  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

  useEffect(() => {}, [isOpen, tmp, sensors?.TEMP_MODE]);

  const fields = useMemo(() => ([
    { name: "tempTarget", label: `${t("mod.tempTarget")}`, placeholder: tmp?.tempTarget, type:"number", step:"0.1" },
    { name: "hysteresis",
     label:
      <div className="tooltip">
        {`${t('mod.temp_hysteresis')}`}
        <span className="tooltiptext fw-600 text-xs">{t("mod.temp_hysteresis_lbl")}</span>
      </div>,
      placeholder: tmp?.hysteresis, type:"number", step:"0.1" },
    { name: "runMin", label: `${t("mod.runMin")}`, placeholder: tmp?.runMin, type:"number", min:0  },
    { name: "cooldown",
      label:
        <div className="tooltip">
          {`${t('mod.cooldown')}`}
          <span className="tooltiptext fw-600 text-xs">{t("mod.cooldown_lbl")}</span>
        </div>,
      placeholder: tmp?.cooldown, type:"number", min:0  },
    { name: "daylightOnly", label: `${t("mod.daylightOnly")}`, type:"toggle" },
    { name: "lightGate", label: `${t("mod.lightGate")}`, placeholder: tmp?.lightGate, type:"number",min:0, max:100  },
  ]), [t,tmp]);

  const initValsTemp = useMemo(() => ({
    temp: tmp?.temp ?? "",
    light: tmp?.light ?? "",
    tempTarget: tmp?.tempTarget ?? "",
    hysteresis: tmp?.hysteresis ?? "",
    runMin: tmp?.runMin ?? "",
    cooldown: tmp?.cooldown ?? "",
    daylightOnly: !!tmp?.daylightOnly,
    lightGate: tmp?.lightGate ?? "",
  }), [tmp]);

  const onSubmit = useCallback((values) => {
    return stts.run(async () => {
      await Submit(values);
    }, {
      successMessage: t("mod.temp_saved_success") || "Temperature mode saved",
      errorMessage:   t("mod.temp_saved_error")   || "Failed to save temperature mode",
    });
  }, [stts, Submit, t]);


    return (
        <Card variant={variant}
              header={
                  <>
                      <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                          <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                      </FlashButton>
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">{t("mod.temp_label")}</h5></div>
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
                                                  Submit,
                                              }) {
    const {t} = useT();
    const stts = useRequestStatus();
    const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);

    useEffect(() => {
        console.log("[ESP-DBG][Moisture] open?", isOpen, { snapshot: m, current: sensors?.SOIL_MOISTURE_MODE });
    }, [isOpen, m, sensors?.SOIL_MOISTURE_MODE]);

  const fields = useMemo(() => ([
    { name: "moistureTarget", label: `${t("mod.moistureTarget")}`, placeholder: m?.moistureTarget, type:"number", step:"0.1" },
    { name: "hysteresis",
      label:
    <div className="tooltip">
      {`${t("mod.moisture_hysteresis")}`}
      <span className="tooltiptext fw-600 text-xs">{t("mod.moisture_hysteresis_lbl")}</span>
    </div>,

      placeholder: m?.hysteresis, type:"number", step:"0.1" },
    { name: "runMin", label: `${t("mod.runMin")}`, placeholder: m?.runMin, type:"number", min:0  },
    { name: "cooldown",
      label:
        <div className="tooltip">
          {`${t('mod.cooldown')}`}
          <span className="tooltiptext fw-600 text-xs">{t("mod.cooldown_lbl")}</span>
        </div>,
      placeholder: m?.cooldown, type:"number", min:0  },
    { name: "daylightOnly", label: `${t("mod.daylightOnly")}`, placeholder: m?.daylightOnly , type:"toggle" },
    { name: "lightGate", label: `${t("mod.lightGate")}`, placeholder: m?.lightGate, type:"number",min:0, max:100  },
  ]), [m,t]);

    const initValsMoist = useMemo(() => ({
      moisture: m?.moisture ?? "",
      moistureTarget: m?.moistureTarget ?? "",
      hysteresis: m?.hysteresis ?? "",
      runMin: m?.runMin ?? "",
      cooldown: m?.cooldown ?? "",
      daylightOnly: !!m?.daylightOnly,
      lightGate: m?.lightGate ?? "",
    }), [m]);


    const onSubmit = useCallback((values) => {
        return stts.run(async () => {
            await Submit(values);
        }, {
            successMessage: t("mod.moisture_saved_success") || "Moisture mode saved",
            errorMessage:   t("mod.moisture_saved_error")   || "Failed to save Moisture mode",
        });
    }, [stts, Submit, t]);


    return (
        <Card variant={variant}
              header={
                  <>
                      <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
                          <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                      </FlashButton>
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">{t("mod.moisture_label")}</h5></div>
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

const Saturday = React.memo(function Saturday({variant, unflip, isOpen, sensors, authLoading, authErr, Submit}) {
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
            type: "number", required: true, min: 1, step: 1  }, ]), [s,t]);

    const initValsSat = useMemo(() => ({
        date: toInputDate(safe?.dateAct || ""),
        time: safe?.timeAct || "",
        duration: safe?.duration != null ? String(safe.duration) : "",
    }), [safe]);

    const onSubmit = useCallback((values) => {
        return stts.run(async () => {
            await Submit(values);
        }, {
            successMessage: t("mod.saturday_saved_success") || "Saturday mode saved",
            errorMessage:   t("mod.saturday_saved_error")   || "Failed to save Saturday mode",
        });
    }, [stts, Submit, t]);

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

const Manual = React.memo(function Manual({ variant, unflip,
                                            sensors, authLoading, authErr,
                                            wsLoading, Toggle
}) {
    const {t} = useT();
    const stts = useRequestStatus();
    const enabled = Boolean(sensors?.MANUAL_MODE?.enabled);

  const handleToggle = async (next) => {
    try { await Toggle(next); }
    catch (e) { console.error("Failed to toggle manual mode", e); }
  };

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
        { id: "temp", label: `${t("mod.temp_label")}`, value: 61, tab: "temperature" },
        { id: "moisture", label: `${t("mod.moisture_label")}`, value: 62, tab: "moisture" },
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
    const isSatOpen = activeTab === "saturday" && flipped;
    const isManOpen = activeTab === "manual" && flipped;

    const back = ({ unflip }) => (
        activeTab === "temperature" ? (
            <Temperature
                variant={variant}
                unflip={() => { if (flipped) { unflip(); } }}
                isOpen={isTempOpen} sensors={sensors} authLoading={authLoading} authErr={authErr} Submit={temp}
            />
        ) : activeTab === "moisture" ? (
            <Moisture
                variant={variant}
                unflip={() => { if (flipped) { unflip(); } }}
                isOpen={isMoistOpen} sensors={sensors} authLoading={authLoading} authErr={authErr} Submit={moist}
            />
        ) : activeTab === "saturday" ? (
            <Saturday
                variant={variant}
                unflip={() => { if (flipped) { unflip(); } }}
                isOpen={isSatOpen} sensors={sensors} authLoading={authLoading} authErr={authErr}
                Submit={saturday}
            />
        ) : activeTab === "manual" ? (
            <Manual
                variant={variant}
                unflip={() => { if (flipped) { unflip(); } }}
                isOpen={isManOpen} sensors={sensors} setSensors={setSensors} authLoading={authLoading}
                err={authErr || err} wsLoading={loading} Toggle={manual}
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
                onFlip={(val) => { setFlipped(val); }}
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
