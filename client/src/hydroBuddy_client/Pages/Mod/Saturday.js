import { useEffect, useState } from "react";
import { Api } from "../../services/api";
import {Form} from "react-router-dom";

function toInputDate(ddmmyyyy) {
    if (!ddmmyyyy) return "";
    const [d, m, y] = ddmmyyyy.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
}

function toServerDate(yyyy_mm_dd) {
    if (!yyyy_mm_dd) return "";
    const [y, m, d] = yyyy_mm_dd.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}

export default function SaturdayMode() {
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ date: "", time: "", duration: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    async function load() {
        try {
            setLoading(true);
            setMsg("");
            const res = await Api.esp.getSensors();
            setSensors(res);

            const dateFromServer = res?.SATURDAY_MODE?.dateAct || "";
            const timeFromServer = res?.SATURDAY_MODE?.timeAct || "";
            const durFromServer  = res?.SATURDAY_MODE?.duration ?? "";

            setForm({
                date: toInputDate(dateFromServer),
                time: timeFromServer,
                duration: String(durFromServer),
            });
        } catch (e) {
            setMsg(e.message || "Load failed");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    function onChange(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function validateClient(p) {
        const dateOk = /^\d{2}\/\d{2}\/\d{4}$/.test(p.dateAct);
        const timeOk = /^\d{2}:\d{2}$/.test(p.timeAct);
        const durNum = Number(p.duration);
        const durOk = Number.isInteger(durNum) && durNum > 0;
        return dateOk && timeOk && durOk;
    }

    async function saveAll() {
        try {
            setSaving(true);
            setMsg("");

            const payload = {
                dateAct: toServerDate(form.date),  // DD/MM/YYYY
                timeAct: form.time,                // HH:MM
                duration: parseInt(form.duration, 10),
            };

            if (!validateClient(payload)) {
                throw new Error("בדוק תאריך/שעה/משך: פורמט לא תקין");
            }

            await Api.saturday.setSaturday(payload);

            setSensors(s => ({ ...s,
                SATURDAY_MODE: { ...(s?.SATURDAY_MODE || {}),
                    dateAct: payload.dateAct,
                    timeAct: payload.timeAct,
                    duration: payload.duration,
                }
            }));
            setMsg("Saturday mode saved");
        } catch (e) {
            setMsg(e.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p style={{ fontFamily: "Helvetica", color: "#bbb" }}>Loading…</p>;
    if (!sensors) return <p style={{ fontFamily: "Helvetica", color: "salmon" }}>No Data Found</p>;

    const wrap = { fontFamily: "Helvetica", background: "#1f1f1f", color: "#eaeaea", padding: 18, borderRadius: 16, maxWidth: 640 };
    const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center", marginBottom: 10 };
    const label = { opacity: 0.9, marginBottom: 6 };
    const valueBox = { background: "#2a2a2a", color: "#eaeaea", border: "1px solid #3a3a3a", borderRadius: 12, padding: "8px 10px",width: "80%" };
    const input = { background: "#2a2a2a", color: "#eaeaea", border: "1px solid #3a3a3a", borderRadius: 12, padding: "8px 10px", width: "80%" };
    const btnYellow = { background: "#e6c229", color: "#000", border: "none", borderRadius: 12, padding: "10px 14px", cursor: "pointer" };

    return (
        <div style={wrap}>
            <h3 style={{ marginTop: 0 }}>Saturday Mod</h3>
            <h5 style={{ marginTop: 0 }}>Set Mod with Numbers between 1 - 10</h5>

            <div style={grid}>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Temperature (°C)</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.temp ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Light Level</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.light ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Moisture (%)</div>
                    <div style={valueBox}>{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div>
                </div>
            </div>

                <Form style={grid} method="patch">

                    <div style={label}>Set Activation Date (DD/MM/YYYY)</div>
                    <input id="dateAct"
                           type="date"
                           value={form.dateAct}
                           onChange={(e) => onChange("date", e.target.value)}
                           style={input}
                    />

                    <div style={label}>Activation Time (HH:MM)</div>
                    <input
                        id="timeAct"
                        type="time"
                        value={form.timeAct}
                        onChange={(e) => onChange("time", e.target.value)}
                        style={input}
                    />

                    <div style={label}>Set Duration</div>
                    <input
                        id="duration"
                        type="number"
                        value={form.duration}
                        onChange={(e) => onChange("duration", e.target.value)}
                        style={input}
                    />

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={saveAll} disabled={saving} style={btnYellow}>Save Changes</button>
                    </div>
                </Form>


            {saving && <p style={{ marginTop: 8 }}>Saving…</p>}
            {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </div>
    );
}
