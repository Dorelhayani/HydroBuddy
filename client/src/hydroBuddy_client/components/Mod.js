import {Outlet, Form, useNavigate} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FlashButton } from "../hooks/Components";
import {ToggleSwitch} from "../domain/formatters";
import {
    useModData,
    TempFormFromSensors,
    MoistureFormFromSensors,
    SaturdayFormFromSensors,
    useSaveTemperature,
    useSaveMoisture,
    useSaveSaturday,
    useSaveManual,
} from "../hooks/ModLoad";

export default function Mod() {
    const { state, form, setForm, saveState, loadingState } = useModData();
    const nav = useNavigate();
    const loading = loadingState;
    const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const map = { 61: "./temperature", 62: "./moisture", 63: "./saturday", 64: "./manual" };
    const labelMap = {61:"Temperature Mod", 62:"Moisture Mod", 63:"Saturday Mod", 64:"Manual Mod"};

    const handleNavigate = async () => {
        const committed = await saveState();           // שומר ומקבל מצב מאושר
        const target = map[committed];
        if (target) nav(target);
    };

    if (loading && state == null) return <p className="loading">Loading…</p>;

    return (
        <div className="main-container">
            <div className="main-title">Mod Page</div>
            <div className="sub-title">Current: {labelMap[state] ?? "-"}</div>
            <Form className="grid" onSubmit={(e) => e.preventDefault()}>
                <select className="input" name="state" value={form.state} onChange={(e)=>onChange("state", e.target.value)}>
                    <option className="opt" value="">— Select Mod —</option>
                    <option value={61}>Temperature</option>
                    <option value={62}>Moisture</option>
                    <option value={63}>Saturday</option>
                    <option value={64}>Manual</option>
                </select>
                <div className="mod-btn-container">
                    <FlashButton onClickAsync={handleNavigate} loading={loading}>Enter</FlashButton>
                </div>
            </Form>
            <Outlet />
        </div>
    );
}

export function TemperatureMode() {
    const { sensors, setSensors } = useModData();
    const [form, setForm] = useState(() => TempFormFromSensors(sensors));
    useEffect(() => setForm(TempFormFromSensors(sensors)), [sensors]);

    const { save, saving } = useSaveTemperature();
    const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));

    const onSave = async () => {
        const payload = await save(form);
        setSensors((s)=>({ ...s, TEMP_MODE: { ...(s?.TEMP_MODE||{}), ...payload }}));
    };

    if (!sensors) return <p className="loading">Loading…</p>;


    return (
        <div className="main-container">
            <h3 className="title">Temperature Mod</h3>
            <div className="grid">
                <div><div className="label">Temperature (°C)</div><div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div></div>
                <div><div className="label">Temperature Level</div><div className="valueBox">{sensors?.TEMP_MODE?.tempLVL ?? "-"}</div></div>
                <div><div className="label">Minimum Time</div><div className="valueBox">{sensors?.TEMP_MODE?.minTime ?? "-"}</div></div>
                <div><div className="label">Maximum Time</div><div className="valueBox">{sensors?.TEMP_MODE?.maxTime ?? "-"}</div></div>
                <div><div className="label">Light</div><div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div></div>
                <div><div className="label">Light ThresHold</div><div className="valueBox">{sensors?.TEMP_MODE?.lightThresHold ?? "-"}</div></div>
                <div><div className="label">Minimum Light</div><div className="valueBox">{sensors?.TEMP_MODE?.minLight ?? "-"}</div></div>
                <div><div className="label">Maximum Light</div><div className="valueBox">{sensors?.TEMP_MODE?.maxLight ?? "-"}</div></div>
            </div>

            <Form className="grid" onSubmit={(e) => e.preventDefault()}>
                <div className="label">Temperature (°C)</div>
                <input id="temp" disabled value={form.temp} onChange={(e) => onChange("temp", e.target.value)} className="input"/>

                <div className="label">Set Temperature Level (°C)</div>
                <input id="tempLVL" type="number" value={form.tempLVL} onChange={(e) => onChange("tempLVL", e.target.value)} className="input"/>

                <div className="label">Set Minimum Time</div>
                <input id="minTime" type="number" value={form.minTime} onChange={(e) => onChange("minTime", e.target.value)} className="input"/>

                <div className="label">Set Maximum Time</div>
                <input id="maxTime" type="number" value={form.maxTime} onChange={(e) => onChange("maxTime", e.target.value)} className="input"/>

                <div className="label">Light</div>
                <input id="light" disabled value={form.light} onChange={(e) => onChange("light", e.target.value)} className="input"/>

                <div className="label">Set Light ThresHold</div>
                <input id="lightThresHold" type="number" value={form.lightThresHold} onChange={(e) => onChange("lightThresHold", e.target.value)} className="input"/>

                <div className="label">Set Minimum Light</div>
                <input id="minLight" type="number" value={form.minLight} onChange={(e) => onChange("minLight", e.target.value)} className="input"/>

                <div className="label">Set Maximum Light</div>
                <input id="maxLight" type="number" value={form.maxLight} onChange={(e) => onChange("maxLight", e.target.value)} className="input"/>

                <div className="btn-container">
                    <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}

export function MoistureMode() {
    const { sensors, setSensors } = useModData();
    const [form, setForm] = useState(() => MoistureFormFromSensors(sensors));
    useEffect(() => setForm(MoistureFormFromSensors(sensors)), [sensors]);

    const { save, saving } = useSaveMoisture();
    const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));

    const onSave = async () => {
        const payload = await save(form);
        setSensors(s => ({
            ...s,
            SOIL_MOISTURE_MODE: { ...(s?.SOIL_MOISTURE_MODE || {}), ...payload },
        }));
    };

    if (!sensors) return <p className="loading">Loading…</p>;


    return (
        <div className="main-container">
            <h3 className="title">Moisture Mod</h3>
            <div className="grid">
                <div><div className="label">Moisture (%)</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div></div>
                <div><div className="label">Moisture Level</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moistureLVL ?? "-"}</div></div>
                <div><div className="label">Minimum Moisture</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.minMoisture ?? "-"}</div></div>
                <div><div className="label">Maximum Moisture</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.maxMoisture ?? "-"}</div></div>
            </div>

            <Form className="grid" onSubmit={(e) => e.preventDefault()}>
                <div className="label">Moisture (%)</div>
                <input id="moisture" disabled value={form.moisture} onChange={(e) => onChange("moisture", e.target.value)} className="input"/>

                <div className="label">Set Moisture Level</div>
                <input id="moistureLVL" type="number" value={form.moistureLVL} onChange={(e) => onChange("moistureLVL", e.target.value)} className="input"/>

                <div className="label">Set Minimum Moisture</div>
                <input id="minMoisture" type="number" value={form.minMoisture} onChange={(e) => onChange("minMoisture", e.target.value)} className="input"/>

                <div className="label">Set Maximum Moisture</div>
                <input id="maxMoisture" type="number" value={form.maxMoisture} onChange={(e) => onChange("maxMoisture", e.target.value)} className="input"/>

                <div className="btn-container">
                    <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}

export function SaturdayMode() {
    const { sensors, setSensors } = useModData();
    const [form, setForm] = useState(() => SaturdayFormFromSensors(sensors));
    useEffect(() => setForm(SaturdayFormFromSensors(sensors)), [sensors]);

    const { save, saving } = useSaveSaturday();
    const onChange = (k,v)=>setForm(p=>({...p,[k]:v}));

    const onSave = async () => {
        const payload = await save(form);
        setSensors(s => ({
            ...s,
            SATURDAY_MODE: { ...(s?.SATURDAY_MODE || {}), ...payload },
        }));
    };

    if (!sensors) return <p className="loading">Loading…</p>;

    return (
        <div className="main-container">
            <h3 className="title">Saturday Mod</h3>

            <h5 className="sub-title">sensors reading</h5>
            <div className="grid">
                <div><div className="label">Temperature (°C)</div><div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div></div>
                <div><div className="label">Light Level</div><div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div></div>
                <div><div className="label">Moisture (%)</div><div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div></div>
            </div>

            <h5 className="sub-title">Saturday state</h5>
            <div className="grid">
                <div className="sub-valueBox">
          <span className="txt">
            Saturday starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"} at {sensors?.SATURDAY_MODE?.timeAct ?? "-"} for {sensors?.SATURDAY_MODE?.duration ?? "-"}
          </span>
                </div>
            </div>

            <h5 className="sub-title">Set Mod with Numbers between 1 - 10</h5>
            <Form className="grid" onSubmit={(e) => e.preventDefault()}>
                <div className="label">Activation Date (DD/MM/YYYY)</div>
                <input id="dateAct" type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} className="input" required/>

                <div className="label">Activation Time (HH:MM)</div>
                <input id="time" type="time" lang="en-GB" value={form.time} onChange={(e) => onChange("time", e.target.value)} className="input" required/>

                <div className="label">Duration</div>
                <input id="duration" type="number" value={form.duration} onChange={(e) => onChange("duration", e.target.value)} className="input" min={1} required/>

                <div className="btn-container">
                    <FlashButton onClickAsync={onSave} loading={saving}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}

export function Manual() {
    const { sensors, setSensors } = useModData();
    const { save, saving } = useSaveManual();

    const [enabled, setEnabled] = useState(() => Boolean(sensors?.MANUAL_MODE?.enabled));
    useEffect(() => {
        setEnabled(Boolean(sensors?.MANUAL_MODE?.enabled));
    }, [sensors]);

    const handleToggle = async (next) => {

        setEnabled(next);
        setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: next } }));

        const committed = await save(next);
        setSensors(s => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE || {}), enabled: committed } }));
    };

    if (!sensors) return <p className="loading">Loading…</p>;

    return (
        <div className="main-container">
            <h3 className="title">Manual MODE</h3>

            {[
                { label: "Temperature (°C)", value: sensors?.TEMP_MODE?.temp ?? "-" },
                { label: "Light Level",      value: sensors?.TEMP_MODE?.light ?? "-" },
                { label: "Moisture (%)",     value: sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-" },
            ].map(({label, value}) => (
                <div key={label} className="toggle-container">
                    <span className="label">{label}</span>
                    <div className="valueBox">{value}</div>
                </div>
            ))}

            <div className="toggle-container">
                <ToggleSwitch checked={enabled} onToggle={handleToggle} disabled={saving} />
            </div>
        </div>
    );
}