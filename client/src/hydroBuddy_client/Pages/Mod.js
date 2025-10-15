//  "proxy": "http://localhost:5050",


// // Mod.js
//
// import {Outlet, Form, useNavigate} from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import FlashButton from "../components/ButtonGenerate";
// import {ToggleSwitch} from "../domain/formatters";
// import {
//     useModData,
//     TempFormFromSensors,
//     MoistureFormFromSensors,
//     SaturdayFormFromSensors,
//     useSaveTemperature,
//     useSaveMoisture,
//     useSaveSaturday,
//     useSaveManual,
// } from "../hooks/ModLoad";
//
// export default function Mod() {
//     const { state, form, setForm, saveState, loadingState } = useModData();
//     const nav = useNavigate();
//     const loading = loadingState;
//     const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
//     const map = { 61: "./temperature", 62: "./moisture", 63: "./saturday", 64: "./manual" };
//     const labelMap = {61:"Temperature Mod", 62:"Moisture Mod", 63:"Saturday Mod", 64:"Manual Mod"};
//
//     const handleNavigate = async () => {
//         const committed = await saveState();           // שומר ומקבל מצב מאושר
//         const target = map[committed];
//         if (target) nav(target);
//     };
//
//     if (loading && state == null) return <p className="loading">Loading…</p>;
//
//     return (
//         <div className="main-container">
//             <div className="main-title">Mod Page</div>
//             <div className="sub-title">Current: {labelMap[state] ?? "-"}</div>
//             <Form className="grid" onSubmit={(e) => e.preventDefault()}>
//                 <select className="input" name="state" value={form.state} onChange={(e)=>onChange("state", e.target.value)}>
//                     <option className="opt" value="">— Select Mod —</option>
//                     <option value={61}>Temperature</option>
//                     <option value={62}>Moisture</option>
//                     <option value={63}>Saturday</option>
//                     <option value={64}>Manual</option>
//                 </select>
//                 <div className="mod-btn-container">
//                     <FlashButton onClickAsync={handleNavigate} loading={loading}>Enter</FlashButton>
//                 </div>
//             </Form>
//             <Outlet />
//         </div>
//     );
// }
//
// export function TemperatureMode() {
//     const { sensors, setSensors } = useModData();
//     const [form, setForm] = useState(() => TempFormFromSensors(sensors));
//     useEffect(() => setForm(TempFormFromSensors(sensors)), [sensors]);
//
//     const { save, saving } = useSaveTemperature();
//     const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));
//
//     const onSave = async () => {
//         const payload = await save(form);
//         setSensors((s)=>({ ...s, TEMP_MODE: { ...(s?.TEMP_MODE||{}), ...payload }}));
//     };
//
//     if (!sensors) return <p className="loading">Loading…</p>;
//
//
//     return (
//         <div className="main-container">
//             <h3 className="title">Temperature Mod</h3>
//             <div className="grid">
//                 <div><div className="label">Temperature (°C)</div><div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div></div>
//                 <div><div className="label">Temperature Level</div><div className="valueBox">{sensors?.TEMP_MODE?.tempLVL ?? "-"}</div></div>
//                 <div><div className="label">Minimum Time</div><div className="valueBox">{sensors?.TEMP_MODE?.minTime ?? "-"}</div></div>
//                 <div><div className="label">Maximum Time</div><div className="valueBox">{sensors?.TEMP_MODE?.maxTime ?? "-"}</div></div>
//                 <div><div className="label">Light</div><div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div></div>
//                 <div><div className="label">Light ThresHold</div><div className="valueBox">{sensors?.TEMP_MODE?.lightThresHold ?? "-"}</div></div>
//                 <div><div className="label">Minimum Light</div><div className="valueBox">{sensors?.TEMP_MODE?.minLight ?? "-"}</div></div>
//                 <div><div className="label">Maximum Light</div><div className="valueBox">{sensors?.TEMP_MODE?.maxLight ?? "-"}</div></div>
//             </div>
//
//             <Form className="grid" onSubmit={(e) => e.preventDefault()}>
//                 <div className="label">Temperature (°C)</div>
//                 <input id="temp" disabled value={form.temp} onChange={(e) => onChange("temp", e.target.value)} className="input"/>
//
//                 <div className="label">Set Temperature Level (°C)</div>
//                 <input id="tempLVL" type="number" value={form.tempLVL} onChange={(e) => onChange("tempLVL", e.target.value)} className="input"/>
//
//                 <div className="label">Set Minimum Time</div>
//                 <input id="minTime" type="number" value={form.minTime} onChange={(e) => onChange("minTime", e.target.value)} className="input"/>
//
//                 <div className="label">Set Maximum Time</div>
//                 <input id="maxTime" type="number" value={form.maxTime} onChange={(e) => onChange("maxTime", e.target.value)} className="input"/>
//
//                 <div className="label">Light</div>
//                 <input id="light" disabled value={form.light} onChange={(e) => onChange("light", e.target.value)} className="input"/>
//
//                 <div className="label">Set Light ThresHold</div>
//                 <input id="lightThresHold" type="number" value={form.lightThresHold} onChange={(e) => onChange("lightThresHold", e.target.value)} className="input"/>
//
//                 <div className="label">Set Minimum Light</div>
//                 <input id="minLight" type="number" value={form.minLight} onChange={(e) => onChange("minLight", e.target.value)} className="input"/>
//
//                 <div className="label">Set Maximum Light</div>
//                 <input id="maxLight" type="number" value={form.maxLight} onChange={(e) => onChange("maxLight", e.target.value)} className="input"/>
//
//                 <div className="btn-container">
//                     <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
//                 </div>
//             </Form>
//         </div>
//     );
// }
//
// export function MoistureMode() {
//     const { sensors, setSensors } = useModData();
//     const [form, setForm] = useState(() => MoistureFormFromSensors(sensors));
//     useEffect(() => setForm(MoistureFormFromSensors(sensors)), [sensors]);
//
//     const { save, saving } = useSaveMoisture();
//     const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));
//
//     const onSave = async () => {
//         const payload = await save(form);
//         setSensors(s => ({
//             ...s,
//             SOIL_MOISTURE_MODE: { ...(s?.SOIL_MOISTURE_MODE || {}), ...payload },
//         }));
//     };
//
//     if (!sensors) return <p className="loading">Loading…</p>;
//
//
//     return (
//         <div className="main-container">
//             <h3 className="title">Moisture Mod</h3>
//             <div className="grid">
//                 <div><div className="label">Moisture (%)</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div></div>
//                 <div><div className="label">Moisture Level</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moistureLVL ?? "-"}</div></div>
//                 <div><div className="label">Minimum Moisture</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.minMoisture ?? "-"}</div></div>
//                 <div><div className="label">Maximum Moisture</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.maxMoisture ?? "-"}</div></div>
//             </div>
//
//             <Form className="grid" onSubmit={(e) => e.preventDefault()}>
//                 <div className="label">Moisture (%)</div>
//                 <input id="moisture" disabled value={form.moisture} onChange={(e) => onChange("moisture", e.target.value)} className="input"/>
//
//                 <div className="label">Set Moisture Level</div>
//                 <input id="moistureLVL" type="number" value={form.moistureLVL} onChange={(e) => onChange("moistureLVL", e.target.value)} className="input"/>
//
//                 <div className="label">Set Minimum Moisture</div>
//                 <input id="minMoisture" type="number" value={form.minMoisture} onChange={(e) => onChange("minMoisture", e.target.value)} className="input"/>
//
//                 <div className="label">Set Maximum Moisture</div>
//                 <input id="maxMoisture" type="number" value={form.maxMoisture} onChange={(e) => onChange("maxMoisture", e.target.value)} className="input"/>
//
//                 <div className="btn-container">
//                     <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
//                 </div>
//             </Form>
//         </div>
//     );
// }
//
// export function SaturdayMode() {
//     const { sensors, setSensors } = useModData();
//     const [form, setForm] = useState(() => SaturdayFormFromSensors(sensors));
//     useEffect(() => setForm(SaturdayFormFromSensors(sensors)), [sensors]);
//
//     const { save, saving } = useSaveSaturday();
//     const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));
//
//     const onSave = async () => {
//         const payload = await save(form);
//         setSensors(s => ({
//             ...s,
//             SATURDAY_MODE: { ...(s?.SATURDAY_MODE || {}), ...payload },
//         }));
//     };
//
//     if (!sensors) return <p className="loading">Loading…</p>;
//
//     return (
//         <div className="main-container">
//             <h3 className="title">Saturday Mod</h3>
//
//             <h5 className="sub-title">sensors reading</h5>
//             <div className="grid">
//                 <div><div className="label">Temperature (°C)</div><div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div></div>
//                 <div><div className="label">Light Level</div><div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div></div>
//                 <div><div className="label">Moisture (%)</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div></div>
//             </div>
//
//             <h5 className="sub-title">Saturday state</h5>
//             <div className="grid">
//                 <div className="sub-valueBox">
//           <span className="txt">
//             Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"} at {sensors?.SATURDAY_MODE?.timeAct ?? "-"} for {sensors?.SATURDAY_MODE?.duration ?? "-"}
//           </span>
//                 </div>
//             </div>
//
//             <h5 className="sub-title">Set Mod with Numbers between 1 - 10</h5>
//             <Form className="grid" onSubmit={(e) => e.preventDefault()}>
//                 <div className="label">Activation Date (DD/MM/YYYY)</div>
//                 <input id="dateAct" type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} className="input" required/>
//
//                 <div className="label">Activation Time (HH:MM)</div>
//                 <input id="time" type="time" lang="en-GB" value={form.time} onChange={(e) => onChange("time", e.target.value)} className="input" required/>
//
//                 <div className="label">Duration</div>
//                 <input id="duration" type="number" value={form.duration} onChange={(e) => onChange("duration", e.target.value)} className="input" min={1} required/>
//
//                 <div className="btn-container">
//                     <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
//                 </div>
//             </Form>
//         </div>
//     );
// }
//
// export function Manual() {
//     const { sensors, setSensors } = useModData();
//     const { save, saving } = useSaveManual();
//
//     const [enabled, setEnabled] = useState(() => Boolean(sensors?.MANUAL_MODE?.enabled));
//     useEffect(() => {
//         setEnabled(Boolean(sensors?.MANUAL_MODE?.enabled));
//     }, [sensors]);
//
//     const handleToggle = async (next) => {
//
//         setEnabled(next);
//         setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));
//
//         const committed = await save(next);
//         setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed } }));
//     };
//
//     if (!sensors) return <p className="loading">Loading…</p>;
//
//     return (
//         <div className="main-container">
//             <h3 className="title">Manual MODE</h3>
//
//             {[
//                 { label: "Temperature (°C)", value: sensors?.TEMP_MODE?.temp ?? "-" },
//                 { label: "Light Level",      value: sensors?.TEMP_MODE?.light ?? "-" },
//                 { label: "Moisture (%)",     value: sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-" },
//             ].map(({label, value}) => (
//                 <div key={label} className="toggle-container">
//                     <span className="label">{label}</span>
//                     <div className="valueBox">{value}</div>
//                 </div>
//             ))}
//
//             <div className="toggle-container">
//                 <ToggleSwitch checked={enabled} onToggle={handleToggle} disabled={saving} />
//             </div>
//         </div>
//     );
// }


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
import ToggleSwitch from "../components/ToggleSwitch";
import { useSnapshotOnOpen } from "../hooks/useSnapshotOnOpen";
import {toInputDate, formatDateDDMMYYYY} from "../domain/formatters";


export default function Mod() {
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

    // יציב - לא משתנה בין רינדורים
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

        return (
            <Card
                variant={variant}
                header="Mod"
                list={
                    <ClickableList
                        items={MODS}
                        itemKey="value"
                        selected={selectedItem}
                        onItemClick={(m) => handlePickMode(m, setPendingValue)}
                        getDisabled={(m) => pendingValue === m.value || loading || authLoading}
                        renderItem={(m) => (
                            <div
                                className={["list-card", pendingValue === m.value ? "is-pending" : ""].join(" ")}
                                aria-busy={pendingValue === m.value ? "true" : "false"}
                            >
                                <div className="list-card__title">{m.name}</div>
                                {pendingValue === m.value && <div className="mod-card__spinner" />}
                            </div>
                        )}
                        emptyContent="No mods yet"
                        ariaLabel="Modes list"
                        className="mod-list"
                    />
                }
                body={<RequestBanner loading={authLoading || loading} errorText={authErr || err} />}
                footer={null}
            />
        );
    }

    function Temperature({ variant, unflip }) {
        const isOpen = activeTab === "temperature" && flipped;
        const t  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

        const fields = useMemo(() => ([
            { name: "temp",           label: "Temp",                 placeholder: t?.temp,           disabled: true },
            { name: "tempLVL",        label: "Temp Level",           placeholder: t?.tempLVL,        disabled: true },
            { name: "minTime",        label: "Set Minimum Time",     placeholder: t?.minTime,        disabled: true },
            { name: "maxTime",        label: "Set Maximum Time",     placeholder: t?.maxTime,        disabled: true },
            { name: "light",          label: "Light",                placeholder: t?.light,          disabled: true },
            { name: "lightThresHold", label: "Set Light Threshold",  placeholder: t?.lightThresHold, disabled: true },
            { name: "minLight",       label: "Set Minimum Light",    placeholder: t?.minLight,       disabled: true },
            { name: "maxLight",       label: "Set Maximum Light",    placeholder: t?.maxLight,       disabled: true },
        ]), [t]);

        const onSubmit = useCallback((values) => temp(values), [temp]);

        return (
            <Card variant={variant}
                  header="Temperature Mod"
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
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
                          <FlashButton className="btn" onClick={unflip}>Back</FlashButton>
                          <FlashButton className="btn" onClick={unflip}>Update Mod</FlashButton>
                      </div>
                  }
            />
        );
    }

    function Moisture({ variant, unflip }) {
        const isOpen = activeTab === "moisture" && flipped;
        const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);

        const fields = useMemo(() => ([
            { name: "moisture",     label: "Moisture",               placeholder: m?.moisture,     type: "number", disabled: true },
            { name: "moistureLVL",  label: "Moisture Level",          placeholder: m?.moistureLVL, type: "number", required: true },
            { name: "minMoisture",  label: "Min Moisture Threshold", placeholder: m?.minMoisture, type: "number", required: true },
            { name: "maxMoisture",  label: "Max Moisture Threshold", placeholder: m?.maxMoisture, type: "number", required: true },
        ]), [m]);

        const onSubmit = useCallback((values) => moist(values), [moist]);

        return (
            <Card variant={variant}
                  header="Moisture Mod"
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
                              key="moisture"
                              fields={fields}
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
                          <FlashButton className="btn" onClick={unflip}>Update Mod</FlashButton>
                          <FlashButton className="btn" onClick={unflip}>Back</FlashButton>
                      </div>
                  }
            />
        );
    }

    function Saturday({ variant, unflip }) {
        const isOpen = activeTab === "saturday" && flipped;
        const s = useSnapshotOnOpen(sensors?.SATURDAY_MODE, isOpen);

        const fields = useMemo(() => ([
            { name: "dateAct", label: "Activation Date", placeholder: s?.dateAct, type: "date", disabled: true },
            { name: "timeAct", label: "Activation Time", placeholder: s?.timeAct, type: "time", required: true },
            { name: "duration", label: "Duration", placeholder: s?.duration, type: "number", required: true },
        ]), [s]);

        const onSubmit = useCallback((values) => saturday(values), [saturday]);


        //           <span className="txt">
//             Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"} at {sensors?.SATURDAY_MODE?.timeAct ?? "-"} for {sensors?.SATURDAY_MODE?.duration ?? "-"}
//           </span>

        return (
            <Card variant={variant}
                  header="Saturday Mod"
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
                              key="Saturday"
                              fields={fields}
                              initialValues={{
                                          date: formatDateDDMMYYYY(s.dateAct || ""),
                                          time: s.timeAct || "",
                                          duration: String(s.duration ?? ""),

                              }}
                              onSubmit={onSubmit}
                              submitLabel="Save Staurday Mode"
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
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
                          <FlashButton className="btn" onClick= {unflip}>Update Mod</FlashButton>
                          <FlashButton className="btn" onClick={unflip}>Back</FlashButton>
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

        const save = manual;

        // const handleToggle = async (next) => {
        //     setEnabled(next);
        //     setSensors(s => ({...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));
        //
        //     try {
        //         const committed = await save(next);
        //         setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed } }));
        //     } catch (e) {
        //
        //         setEnabled(prev => !prev);
        //         setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: !next } }));
        //     }
        // };

        const handleToggle = async (next) => {
            setEnabled(next);
            setSensors(s => ({
                ...s,
                MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next }
            }));

            try {
                const committed = await manual(next); // מחכה לשרת (מחזיר true/false אמיתי)
                console.log('Server committed:', committed);

                // עדכן רק אם השתנה בפועל
                setEnabled(committed);
                setSensors(s => ({
                    ...s,
                    MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed }
                }));
            } catch (e) {
                console.error('Toggle error', e);
                // רולבאק במקרה כשל
                setEnabled(prev => !prev);
                setSensors(s => ({
                    ...s,
                    MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: !next }
                }));
            }
        };


        return (
            <Card
                variant={variant}
                header="Manual"
                body={
                    <>
                        <RequestBanner loading={authLoading || loading} errorText={authErr || err} />
                        <div className="manual-row">
                            <div className="label">Pump enabled</div>
                            <div className="push-right">
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
                        <FlashButton className="btn" onClick={unflip}>Back</FlashButton>
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

    return (
        <div className="main-container">
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
            <Outlet />
        </div>
    );
}
