// Mod.js

import { Outlet } from "react-router-dom";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";
import ClickableList from "../components/ClickableList";

import { useEsp } from "../hooks/useEsp";
import { useAuth } from "../hooks/useAuth";
import Icon,{iconName} from "../components/Icons";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSnapshotOnOpen } from "../hooks/useSnapshotOnOpen";
import {toInputDate, formatDateDDMMYYYY} from "../domain/formatters";


export default function Mod({ embed = false }) {
    const [flipped, setFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState("mod_display");
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const { loading: authLoading, err: authErr } = useAuth();

    const {
        sensors, setSensors, currentState,
        temp, moist,saturday,manual,
        refetch,
        form: modeForm, setForm: setModeForm,
        loading, err,
    } = useEsp();

    const { fetchEspState, fetchStateSave } = refetch;

    const MODS = useMemo(() => ([
        { name: "Temperature Mod", value: 61, tab: "temperature" },
        { name: "Moisture Mod",    value: 62, tab: "moisture" },
        { name: "Saturday Mod",    value: 63, tab: "saturday" },
        { name: "Manual Mod",      value: 64, tab: "manual" },
    ]), []);


    function ModDisplay({
                            flip,
                            setModeForm,
                            currentState,
                            loading,
                            authLoading,
                            authErr,
                            variant,
                        }) {
        const [pendingValue, setPendingValue] = useState(null);

        useEffect(() => {
            if (flipped) return;
            const id = setInterval(() => { fetchEspState(); }, 5000);
            return () => clearInterval(id);
        }, [fetchEspState, flipped]);

        const selectedItem = useMemo(
            () => MODS.find(m => m.value === Number(currentState)) ?? null,
            [MODS, currentState]
        );

        const handlePickMode = useCallback(async (m, setPendingValue) => {
            try {
                setPendingValue?.(m.value);
                setActiveTab(m.tab);
                await fetchStateSave({ state: Number(m.value) });
                await fetchEspState();
                setModeForm({ state: String(m.value) });
                setFlipped(true);
                await flip?.(); flashSuccess();
            } catch (e) {
                flashDanger();
            } finally {
                setPendingValue?.(null);
            }
        }, [fetchStateSave, fetchEspState, setModeForm, flashSuccess, flashDanger]);

        function onKeyActivate(e, action) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                action();
            }
        }

        return (
            <Card
                variant={variant}
                header="Mod"
                body={<RequestBanner loading={authLoading || loading} errorText={authErr || err} />}
                list={
                    <ClickableList
                        items={MODS}
                        role="button"
                        tabIndex={0}
                        itemKey="value"
                        className="text-muted"
                        selected={selectedItem}
                        onItemClick={(m) => handlePickMode(m, setPendingValue)}
                        onKeyDown={(e) => onKeyActivate(e, () => handlePickMode(e, setPendingValue))}
                        getDisabled={(m) => pendingValue === m.value || loading || authLoading}
                        renderItem={(m) => (
                            <div className="tile tile--sm" onClick={() => handlePickMode(m, setPendingValue)}>
                                <div className={`tile__avatar icon--mode-${(m.tab || m.name).replace(/\s+/g,'').toLowerCase()}`}>
                                    <Icon
                                        name={iconName({ name: m.name, tab: m.tab, kind: "mode" })}
                                        size={24}
                                        fill={1}
                                        weight={600}
                                        className="icon"
                                    />
                                </div>

                                <div className="tile__body">
                                    <div className="tile__title">{m.name}</div>
                                    <div className="tile__subtitle">Not set</div>
                                </div>

                                <span className="tile__chev msr" aria-hidden="true">chevron_right</span>
                            </div>
                        )}
                        emptyContent="No mods yet"
                    />
                }
                footer=" "
            />
        );
    }

    function Temperature({ variant, unflip }) {
        const isOpen = activeTab === "temperature" && flipped;
        const t  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

        const fields = useMemo(() => ([
            { name: "temp", label: "Temp", placeholder: t?.temp, disabled: true },
            { name: "tempLVL", label: "Temp Level", placeholder: t?.tempLVL, type:"number", disabled: true },
            { name: "minTime", label: "Set Minimum Time", placeholder: t?.minTime, disabled: true },
            { name: "maxTime", label: "Set Maximum Time", placeholder: t?.maxTime, disabled: true },
            { name: "light", label: "Light", placeholder: t?.light, disabled: true },
            { name: "lightThresHold", label: "Set Light Threshold", placeholder: t?.lightThresHold, disabled: true },
            { name: "minLight", label: "Set Minimum Light", placeholder: t?.minLight, disabled: true },
            { name: "maxLight", label: "Set Maximum Light", placeholder: t?.maxLight, disabled: true },
        ]), [t]);

        const onSubmit = useCallback((values) => temp(values), [temp]);

        return (
            <Card variant={variant}
                  header={
                      <>
                          <FlashButton
                              className="btn--transparent btn--sm shadow-sm"
                              onClick={unflip}><span className="text-subtle">&#706;</span></FlashButton>
                          <div className="mx-auto-flex" >
                              <h5 className="m-0 text-2xl">Temperature</h5>
                          </div>
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
                              key="temperature"
                              fields={fields}
                              initialValues={{
                                  temp: t?.temp ?? "",
                                  tempLVL: t?.tempLVL ?? "",
                                  minTime: t?.minTime ?? "",
                                  maxTime: t?.maxTime ?? "",
                                  light: t?.light ?? "",
                                  lightThresHold: t?.lightThresHold ?? "",
                                  minLight: t?.minLight ?? "",
                                  maxLight: t?.maxLight ?? "",
                              }}
                              onSubmit={onSubmit}
                              submitLabel="Save Temperature Mode"
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
                                      size="sm"
                                      className="btn btn--primary btn--block shadow-md"
                                      onClickAsync={onClick}
                                      loading={loading || authLoading}
                                      disabled={authLoading}
                                  >Update</FlashButton>
                              )}
                          />
                      </>
                  }
                  footer={
                      <div className="m-0"/>
                  }
            />
        );
    }

    function Moisture({ variant, unflip }) {
        const isOpen = activeTab === "moisture" && flipped;
        const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);

        const fields = useMemo(() => ([
            { name: "moisture", label: "Moisture", placeholder: m?.moisture, type: "number", disabled: true },
            { name: "moistureLVL", label: "Moisture Level", placeholder: m?.moistureLVL, type: "number", required: true },
            { name: "minMoisture", label: "Min Moisture Threshold", placeholder: m?.minMoisture, type: "number", required: true },
            { name: "maxMoisture", label: "Max Moisture Threshold", placeholder: m?.maxMoisture, type: "number", required: true },
        ]), [m]);

        const onSubmit = useCallback((values) => moist(values), [moist]);

        return (
            <Card variant={variant}
                  header={
                      <>
                          <FlashButton
                              className="btn--transparent btn--sm shadow-sm"
                              onClick={unflip}><span className="text-subtle">&#706;</span></FlashButton>
                          <div className="mx-auto-flex" >
                              <h5 className="m-0 text-2xl">Moisture</h5>
                          </div>
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
                              initialValues={{
                                  moisture: m?.moisture ?? "",
                                  moistureLVL: m?.moistureLVL ?? "",
                                  minMoisture: m?.minMoisture ?? "",
                                  maxMoisture: m?.maxMoisture ?? "",
                              }}
                              onSubmit={onSubmit}
                              submitLabel="Save Moisture Mode"
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
                                      size="sm"
                                      className="btn btn--primary btn--block shadow-md"
                                      onClickAsync={onClick}
                                      loading={loading || authLoading}
                                      disabled={authLoading}
                                  >Update</FlashButton>
                              )}
                          />
                      </>
                  }
                  footer={
                      <div className="footer-row"/>
                  }
            />
        );
    }

    function Saturday({ variant, unflip }) {
        const isOpen = activeTab === "saturday" && flipped;
        const s = useSnapshotOnOpen(sensors?.SATURDAY_MODE, isOpen);
        const safe = s ?? sensors?.SATURDAY_MODE ?? {};

        const fields = useMemo(() => ([
            { name: "date", label: "Activation Date", placeholder: s?.dateAct, type: "date", required: true,},
            { name: "time", label: "Activation Time", placeholder: s?.timeAct, type: "time", required: true },
            { name: "duration", label: "Duration", placeholder: s?.duration, type: "number", required: true, min: 1, step: 1  },
        ]), [s]);

        const onSubmit = useCallback((values) => saturday(values), [saturday]);


        //           <span className="txt">
//             Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"} at {sensors?.SATURDAY_MODE?.timeAct ?? "-"} for {sensors?.SATURDAY_MODE?.duration ?? "-"}
//           </span>

        return (
            <Card variant={variant}
                  // header="Saturday Mod"
                  header={
                      <>
                          <FlashButton
                              className="btn--transparent btn--sm shadow-sm"
                              onClick={unflip}><span className="text-subtle">&#706;</span></FlashButton>
                          <div className="mx-auto-flex" >
                              <h5 className="m-0 text-2xl">Saturday</h5>
                          </div>
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
                              initialValues={{
                                  // date: toInputDate(safe?.dateAct || ""),
                                  date: formatDateDDMMYYYY(safe?.dateAct || ""),
                                  time: safe?.timeAct || "",
                                  duration: safe?.duration != null ? String(safe.duration) : "",

                              }}
                              onSubmit={onSubmit}
                              submitLabel="Save Staurday Mode"
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
                                      size="sm"
                                      className="btn btn--primary btn--block shadow-md"
                                      onClickAsync={onClick}
                                      loading={loading || authLoading}
                                      disabled={authLoading}
                                  >Update</FlashButton>
                              )}
                          />
                      </>
                  }
                  footer={
                      <div className="footer-row">
                          {/*<FlashButton className="btn btn--ghost shadow-sm" onClick={unflip}>Back</FlashButton>*/}
                      </div>
                  }
            />
        );
    }

    function Manual({ variant, unflip }) {
        const isOpen = activeTab === "manual" && flipped;
        const mSnap  = useSnapshotOnOpen(sensors?.MANUAL_MODE, isOpen);

        const [enabled, setEnabled] = React.useState(Boolean(mSnap?.enabled));

        React.useEffect(() => {
            const next = Boolean(sensors?.MANUAL_MODE?.enabled);
            setEnabled(prev => (prev === next ? prev : next));
        }, [sensors?.MANUAL_MODE?.enabled]);

        const handleToggle = async (next) => {
            setEnabled(next);
            setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));

            try {
                const committed = await manual(next); // מחכה לשרת (מחזיר true/false אמיתי)

                setEnabled(committed);
                setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed }
                }));
            } catch (e) {
                setEnabled(prev => !prev);
                setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: !next } }));
            }
        };


        return (
            <Card
                variant={variant}
                // header="Manual"
                header={
                    <>
                            <FlashButton
                                className="btn--transparent btn--sm shadow-sm"
                                onClick={unflip}><span className="text-subtle">&#706;</span></FlashButton>
                        <div className="mx-auto-flex" >
                            <h5 className="m-0 text-2xl">Manual</h5>
                        </div>
                    </>
                }
                body={
                    <>
                        <RequestBanner loading={authLoading || loading} errorText={authErr || err} />
                        <div className="manual-row">
                            <div className="label">Pump enabled</div>
                            <div className="push-right ">
                                <ToggleSwitch
                                    checked={enabled}
                                    onToggle={handleToggle}
                                    disabled={authLoading || loading}
                                />
                            </div>
                        </div>
                    </>
                }
                footer={
                    <div className="footer-row">
                        {/*<FlashButton size="sm" className="btn btn--ghost shadow-sm" onClick={unflip}>Back</FlashButton>*/}
                    </div>
                }
            />
        );
    }



    const front = ({ flip }) => (
        <ModDisplay
            flip={() => { if (!flipped) flip(); }}
            modeForm={modeForm}
            setModeForm={setModeForm}
            currentState={currentState}
            loading={loading}
            authLoading={authLoading}
            authErr={authErr}
            variant={variant}
        />
    );

    const back = ({ unflip }) => (
        (activeTab === "temperature")
            ? (<Temperature variant={variant} unflip={() => { if (flipped) unflip(); }} />)
            : (activeTab === "moisture") ? (<Moisture   variant={variant} unflip={() => { if (flipped) unflip(); }} />)
                : (activeTab === "saturday") ? (<Saturday  variant={variant} unflip={() => { if (flipped) unflip(); }} />)
                : activeTab === "manual"   ? (<Manual variant={variant} unflip={() => { if (flipped) unflip(); }}/>)
                : null
    );

    const content = (
        <div className="cards-grid">
            <FlipCard
                front={front}
                back={back}
                flippable
                isFlipped={flipped}
                onFlip={setFlipped}
                autoHeight
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
