import { Form, Link,Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";


export default function TemperatureMode(){
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        Api.getSensors()
            .then((arr) => setRows(Array.isArray(arr) ? arr : []))
            .catch((e) => setErr(e.message))
            .finally(() => setLoading(false));
    }, []);


    if (loading) return <div>Loading…</div>;
    if (err) return <div style={{ color: "red" }}>Error: {err}</div>;

    return (
        <>
            {/*<h4> Mode: {state} </h4>*/}
            <table border="1" className="table" >
                <thead>
                <tr>
                    <th>Temp</th>
                    <th>Temperature Level</th>
                    <th>Minimum time</th>
                    <th>Maximum time</th>
                    <th>light</th>
                    <th>light ThresHold</th>
                    <th>Minimum Light</th>
                    <th>Maximum Light</th>
                    <th>Pump State</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id}>
                        <td>{r.temp}</td>
                        <td>{r.tempLVL}</td>
                        <td>{r.minTime}</td>
                        <td>{r.maxTime}</td>
                        <td>{r.light}</td>
                        <td>{r.lightThresHold}</td>
                        <td>{r.minLight}</td>
                        <td>{r.maxLight}</td>
                        <td>{r.isRunning ? "ON" : "OFF"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button><Link to={'./edit'}>Edit</Link></button>
            <Outlet/>
        </>
    );
}


export function HandleTemperature() {
    const [tempMode, setTempMode] = useState(null); // אוחז רק את TEMP_MODE
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    async function load() {
        try {
            setLoading(true);
            setMsg("");
            const res = await Api.esp.getSensors();
            const data = res?.TEMP_MODE || null;
            setTempMode(data);
        } catch (e) {
            setMsg(e.message || "Load failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const fields = [
        { key: "temp", label: "Temperature (°C)" },
        { key: "tempLVL", label: "Temp Level" },
        { key: "minTime", label: "Min Time (min)" },
        { key: "maxTime", label: "Max Time (min)" },
        { key: "light", label: "Light" },
        { key: "lightThresHold", label: "Light Threshold (%)" },
        { key: "minLight", label: "Min Light" },
        { key: "maxLight", label: "Max Light" },
    ];

    function onLocalChange(key, raw) {
        setTempMode((prev) => ({ ...prev, [key]: raw === "" ? "" : Number(raw) }));
    }

    async function patchSingle() {
        try {
            setSaving(true);
            setMsg("");
            await Api.temp.saveChanges(tempMode);
        }
        catch (err) {
            setMsg(err.message || "PATCH failed");
        }
         finally { setSaving(false); }
    }

    async function saveAll() {
        try {
            setSaving(true);
            setMsg("");
            await Api.temp.saveChanges(tempMode);
        } catch (e) {
            setMsg(e.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p style={{ fontFamily: "Helvetica", color: "#bbb" }}>Loading…</p>;
    if (!tempMode) return <p style={{ fontFamily: "Helvetica", color: "salmon" }}>No Data Found</p>;

    const wrap = { fontFamily: "Helvetica", background: "#1f1f1f", color: "#eaeaea", padding: 18, borderRadius: 16, maxWidth: 560 };
    const row = { display: "grid", gridTemplateColumns: "1fr 160px 170px", gap: 8, alignItems: "center", marginBottom: 10 };
    const input = { background: "#2a2a2a", color: "#eaeaea", border: "1px solid #3a3a3a", borderRadius: 12, padding: "8px 10px" };
    const btnBlue =  { background: "#2b6cb0", color: "#fff", border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer" }; // עדכון שדה
    const btnYellow = { background: "#e6c229", color: "#000", border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer" }; // כללי
    const btnRed =   { background: "#e53e3e", color: "#fff", border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer" }; // רענון/אתחול

    return (
        <div style={wrap}>
            <h3 style={{ marginTop: 0 }}>Temperature MODE</h3>

            {fields.map(({ key, label }) => (
                <div key={key} style={row}>
                    <label htmlFor={key}>{label}</label>
                    <input
                        id={key}
                        type="number"
                        step="any"
                        value={tempMode[key]}
                        onChange={(e) => onLocalChange(key, e.target.value)}
                        style={input}
                    />
                    <button
                        onClick={() => patchSingle(key)}
                        disabled={saving || tempMode[key] === "" || Number.isNaN(Number(tempMode[key]))}
                        style={btnBlue}
                        title="עדכון שדה יחיד (PATCH)"
                    >
                        update {key}
                    </button>
                </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={saveAll} disabled={saving} style={btnYellow} title="PATCH לכל המפתחות">
                    Save All Changes
                </button>
                <button onClick={load} disabled={saving} style={btnRed} title="רענון מהשרת">
                    Refresh
                </button>
            </div>

            {saving && <p style={{ marginTop: 8 }}>שומר…</p>}
            {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </div>
    );
}