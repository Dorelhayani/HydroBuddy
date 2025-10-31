// /* ===== Mod.js ===== */
//
// import { Outlet } from "react-router-dom";
// import React, { useState, useMemo, useCallback } from "react";
//
// import FlashButton from "../components/ButtonGenerate";
// import Card, { useBorderFlash } from "../components/Card";
// import FlipCard from "../components/FlipCard";
// import GenericForm from "../components/FormGenerate";
// import RequestBanner from "../components/RequestBanner";
// import ClickableList from "../components/ClickableList";
//
// import { useEsp } from "../hooks/useEsp";
// import { useAuth } from "../hooks/useAuth";
// import Icon,{iconName} from "../components/Icons";
// import ToggleSwitch from "../components/ToggleSwitch";
// import { useSnapshotOnOpen } from "../hooks/useSnapshotOnOpen";
// import {toInputDate} from "../domain/formatters";
// import ModStatus from "../hooks/ModStatus";
//
// export default function Mod({ embed = false }) {
//     const [flipped, setFlipped] = useState(false);
//     const [activeTab, setActiveTab] = useState("mod_display");
//     const { variant, flashSuccess, flashDanger } = useBorderFlash();
//     const { loading: authLoading, err: authErr } = useAuth();
//
//     const {
//         temp, moist,saturday,manual,
//         sensors, setSensors, currentState,
//         form: modeForm, setForm: setModeForm,
//         refetch, loading, err } = useEsp();
//
//     const { fetchEspState, fetchStateSave } = refetch;
//
//     const MODS = useMemo(() => ([
//         { name: "Temperature", value: 61, tab: "temperature" }, { name: "Moisture",    value: 62, tab: "moisture" },
//         { name: "Saturday",    value: 63, tab: "saturday" }, { name: "Manual",      value: 64, tab: "manual" } ]), []);
//
//     function ModDisplay({ flip, MODS, setModeForm, currentState, loading, authLoading, authErr, variant }) {
//         const [pendingValue, setPendingValue] = useState(null);
//
//         const selectedItem = useMemo(
//             () => MODS.find(m => m.value === Number(currentState)) ?? null,
//             [MODS, currentState]
//         );
//
//         const handlePickMode = useCallback(async (m, setPendingValue) => {
//             try {
//                 setPendingValue?.(m.value);
//                 setActiveTab(m.tab);
//                 await fetchStateSave({ state: Number(m.value) });
//                 setModeForm({ state: String(m.value) });
//                 setFlipped(true);
//                 await flip?.(); flashSuccess();
//             } catch (e) {
//                 flashDanger();
//             } finally {
//                 setPendingValue?.(null);
//             }
//         }, [fetchStateSave, setModeForm, flashSuccess, flashDanger]);
//
//         function onKeyActivate(e, action) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); action(); }}
//
//         return (
//             <Card
//                 variant={variant}
//                 header={
//                     <div className="mx-auto-flex mb-8">
//                         <small className="text-lg fw-600 mb-8 stack-8">Mod</small>
//                     </div>
//                 }
//                 body={
//                 <>
//                     <RequestBanner loading={authLoading || loading} errorText={authErr || err} />
//                     <ClickableList
//                         items={MODS}
//                         role="button"
//                         tabIndex={0}
//                         itemKey="value"
//                         className="text-muted"
//                         selected={selectedItem}
//                         onItemClick={(m) => handlePickMode(m, setPendingValue)}
//                         onKeyDown={(e) => onKeyActivate(e, () => handlePickMode(e, setPendingValue))}
//                         getDisabled={(m) => pendingValue === m.value || loading || authLoading}
//                         renderItem={(m) => {
//                             const isActive = Number(currentState) === m.value;
//                             const te = sensors?.TEMP_MODE;
//                             const mo = sensors?.SOIL_MOISTURE_MODE;
//                             return (
//                                 <div className="tile tile--sm" onClick={() => handlePickMode(m, setPendingValue)}>
//                                     <div className={`tile__avatar ${(m.name).replace(/\s+/g,'').toLowerCase()}`}>
//                                         <Icon
//                                             name={iconName({ name: m.name})}
//                                             size={24}
//                                             fill={1}
//                                             weight={600}
//                                             className="icon"
//                                         />
//                                     </div>
//
//                                     <div className="tile tile--free">
//                                         <div className="tile__title text-muted-500">{m.name}</div>
//                                         <div className="text-muted-500">
//                                             <span className="mod-status">
//                                                   <ModStatus
//                                                     isActive={isActive}
//                                                     name={m.name}
//                                                     temp={te?.temp }
//                                                     light={te?.light}
//                                                     moisture={mo?.moisture}
//                                                 />
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <i className="tile__chev fa-solid fa-caret-right fa-beat-fade"/>
//                                 </div>
//
//                             );
//                         }}
//                         emptyContent="No mods yet"
//                     />
//                 </>
//                 }
//                 footer=" "
//             />
//         );
//     }
//
//     function Temperature({ variant, unflip }) {
//         const isOpen = activeTab === "temperature" && flipped;
//         const t  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);
//
//         const fields = useMemo(() => ([
//             { name: "temp", label: "Temp", placeholder: t?.temp, disabled:true},
//             { name: "tempLVL", label: "Temp Level", placeholder: t?.tempLVL, type:"number" },
//             { name: "minTime", label: "Set Minimum Time", placeholder: t?.minTime, type:"number" },
//             { name: "maxTime", label: "Set Maximum Time", placeholder: t?.maxTime, type:"number" },
//             { name: "light", label: "Light", placeholder: t?.light, disabled:true },
//             { name: "lightThresHold", label: "Set Light Threshold", placeholder: t?.lightThresHold, type:"number" },
//             { name: "minLight", label: "Set Minimum Light", placeholder: t?.minLight, type:"number" },
//             { name: "maxLight", label: "Set Maximum Light", placeholder: t?.maxLight, type:"number" },
//         ]), [t]);
//
//         const onSubmit = useCallback((values) => temp(values), [temp]);
//
//         return (
//             <Card variant={variant}
//                   header={
//                       <>
//                           <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
//                               <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
//                           </FlashButton>
//                           <div className="mx-auto-flex" >
//                               <h5 className="m-0 text-2xl">Temperature</h5>
//                           </div>
//                       </>
//                   }
//                   body={
//                       <>
//                           <RequestBanner loading={authLoading} errorText={authErr} />
//                           <GenericForm
//                               className="form--inline form--roomy stack-16"
//                               labelClassNameAll="label-muted"
//                               placeholderClassAll="ph-muted ph-lg"
//                               rowClassNameAll="text-sm fw-600"
//                               key="temperature"
//                               fields={fields}
//                               initialValues={{
//                                   temp: t?.temp ?? "",
//                                   tempLVL: t?.tempLVL ?? "",
//                                   minTime: t?.minTime ?? "",
//                                   maxTime: t?.maxTime ?? "",
//                                   light: t?.light ?? "",
//                                   lightThresHold: t?.lightThresHold ?? "",
//                                   minLight: t?.minLight ?? "",
//                                   maxLight: t?.maxLight ?? "",
//                               }}
//                               onSubmit={onSubmit}
//                               submitLabel="Save Temperature Mode"
//                               customButton={({ onClick, loading }) => (
//                                   <FlashButton
//                                       size="sm"
//                                       className="btn btn--primary btn--block shadow-md"
//                                       onClickAsync={onClick}
//                                       loading={loading || authLoading}
//                                       disabled={authLoading}
//                                   >Update</FlashButton>
//                               )}
//                           />
//                       </>
//                   }
//                   footer={
//                       <div className="m-0"/>
//                   }
//             />
//         );
//     }
//
//     function Moisture({ variant, unflip }) {
//         const isOpen = activeTab === "moisture" && flipped;
//         const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);
//
//         const fields = useMemo(() => ([
//             { name: "moisture", label: "Moisture", placeholder: m?.moisture, type: "number", disabled:true },
//             { name: "moistureLVL", label: "Moisture Level", placeholder: m?.moistureLVL, type: "number" },
//             { name: "minMoisture", label: "Min Moisture Threshold", placeholder: m?.minMoisture, type: "number" },
//             { name: "maxMoisture", label: "Max Moisture Threshold", placeholder: m?.maxMoisture, type: "number" },
//         ]), [m]);
//
//         const onSubmit = useCallback((values) => moist(values), [moist]);
//
//         return (
//             <Card variant={variant}
//                   header={
//                       <>
//                           <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
//                               <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
//                           </FlashButton>
//                           <div className="mx-auto-flex" >
//                               <h5 className="m-0 text-2xl">Moisture</h5>
//                           </div>
//                       </>
//                   }
//                   body={
//                       <>
//                           <RequestBanner loading={authLoading} errorText={authErr} />
//                           <GenericForm
//                               key="moisture"
//                               fields={fields}
//                               className="form--inline form--roomy stack-16"
//                               labelClassNameAll="label-muted"
//                               placeholderClassAll="ph-muted ph-lg"
//                               rowClassNameAll="text-sm fw-600"
//                               initialValues={{
//                                   moisture: m?.moisture ?? "",
//                                   moistureLVL: m?.moistureLVL ?? "",
//                                   minMoisture: m?.minMoisture ?? "",
//                                   maxMoisture: m?.maxMoisture ?? "",
//                               }}
//                               onSubmit={onSubmit}
//                               submitLabel="Save Moisture Mode"
//                               customButton={({ onClick, loading }) => (
//                                   <FlashButton
//                                       size="sm"
//                                       className="btn btn--primary btn--block shadow-md"
//                                       onClickAsync={onClick}
//                                       loading={loading || authLoading}
//                                       disabled={authLoading}
//                                   >Update</FlashButton>
//                               )}
//                           />
//                       </>
//                   }
//                   footer={
//                       <div className="m-0"/>
//                   }
//             />
//         );
//     }
//
//     function Saturday({ variant, unflip }) {
//         const isOpen = activeTab === "saturday" && flipped;
//         const s = useSnapshotOnOpen(sensors?.SATURDAY_MODE, isOpen);
//         const safe = s ?? sensors?.SATURDAY_MODE ?? {};
//
//         const fields = useMemo(() => ([
//             { name: "date", label: "Activation Date", placeholder: s?.dateAct, type: "date", required: true,},
//             { name: "time", label: "Activation Time", placeholder: s?.timeAct, type: "time", required: true },
//             { name: "duration", label: "Duration", placeholder: s?.duration, type: "number", required: true, min: 1, step: 1  },
//         ]), [s]);
//
//         const onSubmit = useCallback((values) => saturday(values), [saturday]);
//
//         return (
//             <Card variant={variant}
//                   header={
//                       <>
//                           <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
//                               <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
//                           </FlashButton>
//                           <div className="mx-auto-flex" >
//                               <h5 className="m-0 text-2xl">Saturday</h5>
//                           </div>
//                       </>
//                   }
//                   body={
//                       <>
//                           <RequestBanner loading={authLoading} errorText={authErr} />
//                           <GenericForm
//                               key="Saturday"
//                               fields={fields}
//                               className="form--inline form--roomy"
//                               labelClassNameAll="label-muted "
//                               placeholderClassAll="ph-muted ph-lg"
//                               rowClassNameAll="text-sm fw-600"
//                               initialValues={{
//                                   date: toInputDate(safe?.dateAct || ""),
//                                   time: safe?.timeAct || "",
//                                   duration: safe?.duration != null ? String(safe.duration) : "",
//
//                               }}
//                               onSubmit={onSubmit}
//                               submitLabel="Save Staurday Mode"
//                               text={
//                               <span className="txt">
//                                   Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"}
//                                   at {sensors?.SATURDAY_MODE?.timeAct ?? "-"}
//                                   for {sensors?.SATURDAY_MODE?.duration ?? "-"}
//                               </span>
//                               }
//                               customButton={({ onClick, loading }) => (
//                                   <FlashButton
//                                       size="sm"
//                                       className="btn btn--primary btn--block shadow-md"
//                                       onClickAsync={onClick}
//                                       loading={loading || authLoading}
//                                       disabled={authLoading}
//                                   >Update</FlashButton>
//                               )}
//                           />
//                       </>
//                   }
//                   footer={<div className="footer-row" />}
//             />
//         );
//     }
//
//     function Manual({ variant, unflip }) {
//         const isOpen = activeTab === "manual" && flipped;
//         const mSnap  = useSnapshotOnOpen(sensors?.MANUAL_MODE, isOpen);
//
//         const [enabled, setEnabled] = React.useState(Boolean(mSnap?.enabled));
//
//         React.useEffect(() => {
//             const next = Boolean(sensors?.MANUAL_MODE?.enabled);
//             setEnabled(prev => (prev === next ? prev : next));
//         }, [sensors?.MANUAL_MODE?.enabled]);
//
//         const handleToggle = async (next) => {
//             setEnabled(next);
//             setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));
//
//             try {
//                 const committed = await manual(next);
//                 setEnabled(committed);
//                 setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed }}));
//             } catch (e) {
//                 setEnabled(prev => !prev);
//                 setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: !next } }));
//             }
//         };
//
//
//         return (
//             <Card
//                 variant={variant}
//                 header={
//                     <>
//                         <FlashButton className="btn--transparent btn--sm" onClick={unflip}>
//                             <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
//                         </FlashButton>
//                         <div className="mx-auto-flex" >
//                             <h5 className="m-0 text-2xl">Manual</h5>
//                         </div>
//                     </>
//                 }
//                 body={
//                     <>
//                         <RequestBanner loading={authLoading || loading} errorText={authErr || err} />
//                         <div className="manual-row">
//                             <div className="label">Pump enabled</div>
//                             <div className="push-right ">
//                                 <ToggleSwitch
//                                     checked={enabled}
//                                     onToggle={handleToggle}
//                                     disabled={authLoading || loading}
//                                 />
//                             </div>
//                         </div>
//                     </>
//                 }
//                 footer={<div className="" />}
//             />
//         );
//     }
//
//     const front = ({ flip }) => (
//         <ModDisplay
//             flip={() => { if (!flipped) flip(); }}
//             modeForm={modeForm}
//             setModeForm={setModeForm}
//             currentState={currentState}
//             MODS={MODS}
//             loading={loading}
//             authLoading={authLoading}
//             authErr={authErr}
//             variant={variant}
//         />
//     );
//
//     const back = ({ unflip }) => (
//         (activeTab === "temperature")
//             ? (<Temperature variant={variant} unflip={() => { if (flipped) unflip(); }} />)
//             : (activeTab === "moisture") ? (<Moisture   variant={variant} unflip={() => { if (flipped) unflip(); }} />)
//                 : (activeTab === "saturday") ? (<Saturday  variant={variant} unflip={() => { if (flipped) unflip(); }} />)
//                 : activeTab === "manual"   ? (<Manual variant={variant} unflip={() => { if (flipped) unflip(); }}/>)
//                 : null
//     );
//
//     const content = (
//         <div className="cards-grid">
//             <FlipCard
//                 front={front}
//                 back={back}
//                 flippable
//                 isFlipped={flipped}
//                 onFlip={setFlipped}
//                 autoHeight
//             />
//         </div>
//     );
//     return embed ? content : (
//         <div className="main-container">
//             {content}
//             <Outlet />
//         </div>
//     );
// }


/* ===== Mod.js (PATCH: extracted inner components + React.memo) ===== */

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
import { toInputDate } from "../domain/formatters";
import ModStatus from "../hooks/ModStatus";

/* =========================
   Extracted child components
   ========================= */

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
                    <small className="text-lg fw-600 mb-8 stack-8">Mod</small>
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
                                    <div className={`tile__avatar ${(m.name).replace(/\s+/g,'').toLowerCase()}`}>
                                        <Icon
                                            name={iconName({ name: m.name})}
                                            size={24}
                                            fill={1}
                                            weight={600}
                                            className="icon"
                                        />
                                    </div>

                                    <div className="tile tile--free">
                                        <div className="tile__title text-muted-500">{m.name}</div>
                                        <div className="text-muted-500">
                      <span className="mod-status">
                        <ModStatus
                            isActive={isActive}
                            name={m.name}
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
    const t  = useSnapshotOnOpen(sensors?.TEMP_MODE, isOpen);

    useEffect(() => {
        console.log("[ESP-DBG][Temperature] open?", isOpen, { snapshot: t, current: sensors?.TEMP_MODE });
    }, [isOpen, t, sensors?.TEMP_MODE]);

    const fields = useMemo(() => ([
        { name: "temp", label: "Temp", placeholder: t?.temp, disabled:true},
        { name: "tempLVL", label: "Temp Level", placeholder: t?.tempLVL, type:"number" },
        { name: "minTime", label: "Set Minimum Time", placeholder: t?.minTime, type:"number" },
        { name: "maxTime", label: "Set Maximum Time", placeholder: t?.maxTime, type:"number" },
        { name: "light", label: "Light", placeholder: t?.light, disabled:true },
        { name: "lightThresHold", label: "Set Light Threshold", placeholder: t?.lightThresHold, type:"number" },
        { name: "minLight", label: "Set Minimum Light", placeholder: t?.minLight, type:"number" },
        { name: "maxLight", label: "Set Maximum Light", placeholder: t?.maxLight, type:"number" },
    ]), [t]);

    const initValsTemp = useMemo(() => ({
        temp: t?.temp ?? "",
        tempLVL: t?.tempLVL ?? "",
        minTime: t?.minTime ?? "",
        maxTime: t?.maxTime ?? "",
        light: t?.light ?? "",
        lightThresHold: t?.lightThresHold ?? "",
        minLight: t?.minLight ?? "",
        maxLight: t?.maxLight ?? "",
    }), [t]);

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
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">Temperature</h5></div>
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
                              >Update</FlashButton>
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
    const m  = useSnapshotOnOpen(sensors?.SOIL_MOISTURE_MODE, isOpen);

    useEffect(() => {
        console.log("[ESP-DBG][Moisture] open?", isOpen, { snapshot: m, current: sensors?.SOIL_MOISTURE_MODE });
    }, [isOpen, m, sensors?.SOIL_MOISTURE_MODE]);

    const fields = useMemo(() => ([
        { name: "moisture", label: "Moisture", placeholder: m?.moisture, type: "number", disabled:true },
        { name: "moistureLVL", label: "Moisture Level", placeholder: m?.moistureLVL, type: "number" },
        { name: "minMoisture", label: "Min Moisture Threshold", placeholder: m?.minMoisture, type: "number" },
        { name: "maxMoisture", label: "Max Moisture Threshold", placeholder: m?.maxMoisture, type: "number" },
    ]), [m]);

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
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">Moisture</h5></div>
                  </>
              }
              body={
                  <>
                      <RequestBanner loading={authLoading} errorText={authErr} />
                      <GenericForm
                          key="moisture" /* קבוע, לא דינמי */
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
                              >Update</FlashButton>
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
    const s = useSnapshotOnOpen(sensors?.SATURDAY_MODE, isOpen);
    const safe = s ?? sensors?.SATURDAY_MODE ?? {};

    useEffect(() => {
        console.log("[ESP-DBG][Saturday] open?", isOpen, { snapshot: s, current: sensors?.SATURDAY_MODE });
    }, [isOpen, s, sensors?.SATURDAY_MODE]);

    const fields = useMemo(() => ([
        { name: "date", label: "Activation Date", placeholder: s?.dateAct, type: "date", required: true,},
        { name: "time", label: "Activation Time", placeholder: s?.timeAct, type: "time", required: true },
        { name: "duration", label: "Duration", placeholder: s?.duration, type: "number", required: true, min: 1, step: 1  },
    ]), [s]);

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
                      <div className="mx-auto-flex"><h5 className="m-0 text-2xl">Saturday</h5></div>
                  </>
              }
              body={
                  <>
                      <RequestBanner loading={authLoading} errorText={authErr} />
                      <GenericForm
                          key="Saturday" /* קבוע */
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
                              >Update</FlashButton>
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
    const mSnap  = useSnapshotOnOpen(sensors?.MANUAL_MODE, isOpen);
    const [enabled, setEnabled] = React.useState(Boolean(mSnap?.enabled));

    React.useEffect(() => {
        const next = Boolean(sensors?.MANUAL_MODE?.enabled);
        if (enabled !== next) {
            console.log("[ESP-DBG][Manual] enabled changed (sensors)", { prev: enabled, next });
        }
        setEnabled(prev => (prev === next ? prev : next));
    }, [sensors?.MANUAL_MODE?.enabled]); // eslint-disable-line

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
                        <h5 className="m-0 text-2xl">Manual</h5>
                    </div>
                </>
            }
            body={
                <>
                    <RequestBanner loading={wsLoading || authLoading} errorText={err} />
                    <div className="manual-row">
                        <div className="label">Pump enabled</div>
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
    const [flipped, setFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState("mod_display");
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const { loading: authLoading, err: authErr } = useAuth();

    const {
        temp, moist, saturday, manual,
        sensors, setSensors, currentState,
        form: modeForm, setForm: setModeForm,
        refetch, loading, err
    } = useEsp();

    const { fetchEspState, fetchStateSave } = refetch;

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
        { name: "Temperature", value: 61, tab: "temperature" },
        { name: "Moisture",    value: 62, tab: "moisture" },
        { name: "Saturday",    value: 63, tab: "saturday" },
        { name: "Manual",      value: 64, tab: "manual" }
    ]), []);

    const onPickMode = useCallback(async (m, setPendingValue) => {
        console.groupCollapsed("[ESP-DBG][ModDisplay] pick mode");
        console.log("picked", m);
        try {
            setPendingValue?.(m.value);
            setActiveTab(m.tab);
            console.log("setActiveTab =>", m.tab);
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
            currentState={currentState}
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
                /* autoHeight */  /* חשוב: כבוי כרגע */
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
