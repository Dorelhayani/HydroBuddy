import {Link, Outlet, Form, useNavigate } from "react-router-dom";
import React from "react";
import {FlashButton} from "../hooks/Components" ;
import {ToggleSwitch} from "../domain/formatters";
import {TemperatureLoad, MoistureLoad, SaturdayLoad, ManualLoad, StateLoad} from "../hooks/ModLoad";

export default function Mod() {
    const nav = useNavigate();
    const {state, form, setForm, save, loading } = StateLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const routMAp = {
        61: "./temperature",
        62: "./moisture",
        63: "./saturday",
        64: "./manual",
    };

    const handleNavigate = async () => {
        await save();
        const target = routMAp[Number(form.state)];
        if (target) {nav(target)}
    };

    if (loading && !state) return <p className="loading">Loading…</p>;
    if (!state) return <p className="state" >No Data Found</p>;

    const labelMap = {61:"Temperature Mod", 62:"Moisture Mod", 63:"Saturday Mod", 64:"Manual Mod"};

    return (
        <div className="main-container">
            <div className="main-title">Mod Page</div>
            <div className="sub-title">Current: {labelMap[state] ?? "-"}</div>

            <Form className="grid" method="patch" onSubmit={(e) => e.preventDefault()}>
                <div className="label"> Change State </div>

                    <select className="input" name="state" value={form.state} onChange={(e) => onChange("state", e.target.value)}>
                        <option className="opt" value="" >— Select Mod—</option>
                        <option value={61}> Temperature</option>
                        <option value={62}> Moisture </option>
                        <option value={63}>Saturday</option>
                        <option value={64}> Manual</option>
                    </select>

                <div className="Mod-btn-container">
                    <FlashButton onClickAsync={handleNavigate} loading={loading}>Save Changes</FlashButton>
                </div>
            </Form>

            {/*<div className="link-container">*/}
            {/*    <Link className="link" to="./temperature">Temperature Mod</Link>*/}
            {/*    <Link className="link" to="./moisture">Moisture Mod</Link>*/}
            {/*    <Link className="link" to="./saturday">Saturday Mod</Link>*/}
            {/*    <Link className="link" to="./manual">Manual Mod</Link>*/}
            {/*</div>*/}

            <Outlet context={{ loading }} />
        </div>
    )
}

export function TemperatureMode(){
    const {sensors, form, setForm, save, loading } = TemperatureLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading && !sensors) return <p className="loading">Loading…</p>;
    if (!sensors) return <p className="sensors" >No Data Found</p>;

    return (
        <div className="main-container">
            <h3 className="title">Temperature Mod</h3>
            <div className="grid">
                <div>
                    <div className="label">Temperature (°C)</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Temperature Level</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.tempLVL ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Minimum Time</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.minTime ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Maximum Time</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.maxTime ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Light</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Light ThresHold</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.lightThresHold ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Minimum Light</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.minLight ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Maximum Light</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.maxLight ?? "-"}</div>
                </div>
            </div>

                <Form className="grid" method="patch" onSubmit={(e) => e.preventDefault()}>

                <div className="label"> Temperature (°C)</div>
                <input id="temp" disabled value={form.temp}
                       onChange={(e) => onChange("temp", e.target.value)} className="input"/>

                <div className="label">Set Temperature Level (°C)</div>
                <input id="tempLVL" type="number" value={form.tempLVL}
                       onChange={(e) => onChange("tempLVL", e.target.value)} className="input"/>

                <div className="label">Set Minimum Time</div>
                <input id="minTime" type="number" value={form.minTime}
                       onChange={(e) => onChange("minTime", e.target.value)} className="input"/>

                <div className="label">Set Maximum Time</div>
                <input id="maxTime" type="number" value={form.maxTime}
                       onChange={(e) => onChange("maxTime", e.target.value)} className="input"/>

                <div className="label">Light</div>
                <input id="light" disabled value={form.light}
                       onChange={(e) => onChange("light", e.target.value)} className="input"/>

                <div className="label">Set Light ThresHold</div>
                <input id="lightThresHold" type="number" value={form.lightThresHold}
                       onChange={(e) => onChange("lightThresHold", e.target.value)} className="input"/>

                <div className="label">Set Minimum Light</div>
                <input id="minLight" type="number" value={form.minLight}
                       onChange={(e) => onChange("minLight", e.target.value)} className="input"/>

                <div className="label">Set Maximum Light</div>
                <input id="maxLight" type="number" value={form.maxLight}
                       onChange={(e) => onChange("maxLight", e.target.value)} className="input"/>

                <div className="btn-container">
                    <FlashButton onClickAsync={save} loading={loading}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}


export function MoistureMode(){
    const {sensors, form, setForm, save, loading} = MoistureLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading && !sensors) return <p className="loading">Loading…</p>;
    if (!sensors) return <p className="sensors" >No Data Found</p>;

    return (
        <div className="main-container">
            <h3 className="title">Moisture Mod</h3>

            <div className="grid">

                <div>
                    <div className="label">Moisture (%)</div>
                    <div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Moisture Level</div>
                    <div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moistureLVL ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Minimum Moisture</div>
                    <div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.minMoisture ?? "-"}</div>
                </div>

                <div>
                    <div className="label">Maximum Moisture</div>
                    <div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.maxMoisture ?? "-"}</div>
                </div>
            </div>

            <h5 className="sub-title" >Set Mod with Numbers between 1 - 10</h5>

            <Form className="grid" method="patch" onSubmit={(e) => e.preventDefault()}>
                <div className="label"> Moisture (%)</div>
                <input id="moisture" disabled value={form.moisture}
                       onChange={(e) => onChange("moisture", e.target.value)} className="input"/>

                <div className="label">Set Moisture Level</div>
                <input id="moistureLVL" type="number" value={form.moistureLVL}
                       onChange={(e) => onChange("moistureLVL", e.target.value)} className="input"/>

                <div className="label">Set Minimum Moisture</div>
                <input id="minMoisture" type="number" value={form.minMoisture}
                       onChange={(e) => onChange("minMoisture", e.target.value)} className="input"/>

                <div className="label">Set Maximum Moisture</div>
                <input id="maxMoisture" type="number" value={form.maxMoisture}
                       onChange={(e) => onChange("maxMoisture", e.target.value)} className="input"/>

                <div className="btn-container">
                    <FlashButton onClickAsync={save} loading={loading}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}


export function SaturdayMode() {
    const {sensors, form, setForm, save, loading} = SaturdayLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading && !sensors) return <p className="loading">Loading…</p>;
    if (!sensors) return <p className="sensors">No Data Found</p>;

    return (
        <div className="main-container">
            <h3 className="title">Saturday Mod</h3>

            <h5 className="sub-title">sensors reading</h5>

            <div className="grid">
                <div>
                    <div className="label">Temperature (°C)</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.temp ?? "-"}</div>
                </div>
                <div>
                    <div className="label">Light Level</div>
                    <div className="valueBox">{sensors?.TEMP_MODE?.light ?? "-"}</div>
                </div>
                <div>
                    <div className="label">Moisture (%)</div>
                    <div className="valueBox">{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div>
                </div>
                </div>


            <h5 className="sub-title">saturday state</h5>

            <div className="grid">

                <div className="sub-valueBox">
                    <text className="txt">Saturday Mod Starts on {sensors?.SATURDAY_MODE?.dateAct ?? "-"}
                        At {sensors?.SATURDAY_MODE?.timeAct ?? "-"} For {sensors?.SATURDAY_MODE?.duration ?? "-"}
                    </text>
                </div>

            </div>

            <h5 className="sub-title">Set Mod with Numbers between 1 - 10</h5>

            <Form className="grid" method="patch" onSubmit={(e) => e.preventDefault()}>
                <div className="label">Set Activation Date (DD/MM/YYYY)</div>
                <input
                    id="dateAct" type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)}
                    className="input" required/>

                <div className="label">Activation Time (HH:MM)</div>
                <input id="time" type="time" lang="en-GB" value={form.time} onChange={(e) => onChange("time", e.target.value)}
                       className="input" required/>

                <div className="label">Set Duration</div>
                <input id="duration" type="number" value={form.duration} onChange={(e) => onChange("duration", e.target.value)}
                       className="input" min={1} required/>

                <div className="btn-container">
                    <FlashButton onClickAsync={save} loading={loading}>Save Changes</FlashButton>
                </div>
            </Form>
        </div>
    );
}

export function Manual() {
    const { enabled, setEnabled, sensors, loading, save, err } = ManualLoad();

    const handleToggle = async (next) => {
        setEnabled(next);
        try { await save(next); } catch(e) { err(e); }
    };

    if (loading && !sensors) return <p className="loading">Loading…</p>;
    if (!sensors) return <p className="sensors">No Data Found</p>;

    const rows = [
        { label: "Temperature (°C)", value: sensors?.TEMP_MODE?.temp ?? "-" },
        { label: "Light Level",      value: sensors?.TEMP_MODE?.light ?? "-" },
        { label: "Moisture (%)",     value: sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-" },
    ];

    return (
        <div className="main-container">
            <h3 className="title">Manual MODE</h3>

            {rows.map(({ label, value }) => (
                <div key={label} className="toggle-container">
                    <span className="label">{label}</span>
                    <div className="valueBox">{value}</div>
                </div>
            ))}

            <div className="toggle-container">
                <ToggleSwitch checked={enabled} onToggle={handleToggle} disabled={loading} />
            </div>

        </div>
    );
}