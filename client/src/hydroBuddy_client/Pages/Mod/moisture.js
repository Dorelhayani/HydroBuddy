import {Form} from "react-router-dom";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";


export default function MoistureMode(){
    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ moisture: "", moistureLVL: "", minMoisture: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    async function load() {
        try {
            setLoading(true);
            setMsg("");
            const res = await Api.esp.getSensors();
            setSensors(res);

            const moisture = res?.SOIL_MOISTURE_MODE?.moisture  || "";
            const moistureLVL = res?.SOIL_MOISTURE_MODE?.moistureLVL || "";
            const minMoisture  = res?.SOIL_MOISTURE_MODE?.minMoisture ?? "";
            const maxMoisture  = res?.SOIL_MOISTURE_MODE?.maxMoisture ?? "";

            setForm({
                moisture: moisture,
                moistureLVL: moistureLVL,
                minMoisture: minMoisture,
                maxMoisture: maxMoisture,
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

    async function saveAll() {
        try {
            setSaving(true);
            setMsg("");

            const payload = {
                moisture: parseInt(form.moisture),
                moistureLVL: parseInt(form.moistureLVL),
                minMoisture: parseInt(form.moistureLVL),
                maxMoisture: parseInt(form.maxMoisture),
            };

            await Api.moisture.setMoist(payload);

            setSensors(s => ({ ...s,
                SOIL_MOISTURE_MODE: { ...(s?.SOIL_MOISTURE_MODE || {}),
                    moisture: payload.moisture,
                    moistureLVL: payload.moistureLVL,
                    minMoisture: payload.minMoisture,
                    maxMoisture: payload.maxMoisture,
                }
            }));
            setMsg("moisture mode saved");
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
            <h3 style={{ marginTop: 0 }}>Moisture Mod</h3>
            <h5 style={{ marginTop: 0 }}>Set Mod with Numbers between 1 - 10</h5>

            <div style={grid}>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Moisture (%)</div>
                    <div style={valueBox}>{sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Moisture Level</div>
                    <div style={valueBox}>{sensors?.SOIL_MOISTURE_MODE?.moistureLVL ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Minimum Moisture</div>
                    <div style={valueBox}>{sensors?.SOIL_MOISTURE_MODE?.minMoisture ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Maximum Moisture</div>
                    <div style={valueBox}>{sensors?.SOIL_MOISTURE_MODE?.maxMoisture ?? "-"}</div>
                </div>
            </div>

                <Form style={grid} method="patch">
                    <div style={label}> Moisture (%)</div>
                    <input id="moisture"
                           type="number"
                           disabled value={form.moisture}
                           onChange={(e) => onChange("moisture", e.target.value)}
                           style={input}
                    />

                    <div style={label}>Set Moisture Level</div>
                    <input id="moistureLVL"
                           type="number"
                           value={form.moistureLVL}
                           onChange={(e) => onChange("moistureLVL", e.target.value)}
                           style={input}
                        />

                        <div style={label}>Set Minimum Moisture</div>
                        <input
                            id="minMoisture"
                            type="number"
                            value={form.minMoisture}
                            onChange={(e) => onChange("minMoisture", e.target.value)}
                            style={input}
                        />

                        <div style={label}>Set Maximum Moisture</div>
                        <input
                            id="maxMoisture"
                            type="number"
                            value={form.maxMoisture}
                            onChange={(e) => onChange("maxMoisture", e.target.value)}
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