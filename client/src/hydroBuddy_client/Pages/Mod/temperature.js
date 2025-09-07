import { Form } from "react-router-dom";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";

export default function TemperatureMode(){

    const [sensors, setSensors] = useState(null);
    const [form, setForm] = useState({ temp: "", tempLVL: "", minTime: "", maxTime:"", light:"", lightThresHold:"", minLight:"", maxLight:"" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    async function load() {
        try {
            setLoading(true);
            setMsg("");
            const res = await Api.esp.getSensors();
            setSensors(res);

            const temp = res?.TEMP_MODE?.temp  || "";
            const tempLVL = res?.TEMP_MODE?.tempLVL || "";
            const minTime  = res?.TEMP_MODE?.minTime ?? "";
            const maxTime  = res?.TEMP_MODE?.maxTime ?? "";
            const light  = res?.TEMP_MODE?.light ?? "";
            const lightThresHold  = res?.TEMP_MODE?.lightThresHold ?? "";
            const minLight  = res?.TEMP_MODE?.minLight ?? "";
            const maxLight  = res?.TEMP_MODE?.maxLight ?? "";

            setForm({
                temp: temp,
                tempLVL: tempLVL,
                minTime: minTime,
                maxTime: maxTime,
                light: light,
                lightThresHold: lightThresHold,
                minLight: minLight,
                maxLight: maxLight,
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
                temp: parseFloat(form.temp),
                tempLVL: parseFloat(form.tempLVL),
                minTime: parseInt(form.minTime),
                maxTime: parseInt(form.maxTime),
                light: parseInt(form.light),
                lightThresHold: parseInt(form.lightThresHold),
                minLight: parseInt(form.minLight),
                maxLight: parseInt(form.maxLight),
            };

            await Api.temp.setTemp(payload);

            setSensors(s => ({ ...s,
                TEMP_MODE: { ...(s?.TEMP_MODE || {}),
                    temp: payload.temp,
                    tempLVL: payload.tempLVL,
                    minTime: payload.minTime,
                    maxTime: payload.maxTime,
                    light: payload.light,
                    lightThresHold: payload.lightThresHold,
                    minLight: payload.minLight,
                    maxLight: payload.maxLight,
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
            <h3 style={{ marginTop: 0 }}>Temperature Mod</h3>
            <div style={grid}>
                <div>
                    <div style={{ ...label, opacity: .5 }}>Temperature (°C)</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.temp ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Temperature Level</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.tempLVL ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Minimum Time</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.minTime ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Maximum Time</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.maxTime ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Light</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.light ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Light ThresHold</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.lightThresHold ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Minimum Light</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.minLight ?? "-"}</div>
                </div>

                <div>
                    <div style={{ ...label, opacity: .5 }}>Maximum Light</div>
                    <div style={valueBox}>{sensors?.TEMP_MODE?.maxLight ?? "-"}</div>
                </div>
            </div>

            <Form style={grid} method="patch">
                <div style={label}> Temperature (°C)</div>
                <input id="temp"
                       type="number"
                       disabled value={form.temp}
                       onChange={(e) => onChange("temp", e.target.value)}
                       style={input}
                />

                <div style={label}>Set Temperature Level (°C)</div>
                <input id="tempLVL"
                       type="number"
                       value={form.tempLVL}
                       onChange={(e) => onChange("tempLVL", e.target.value)}
                       style={input}
                />

                <div style={label}>Set Minimum Time</div>
                <input
                    id="minTime"
                    type="number"
                    value={form.minTime}
                    onChange={(e) => onChange("minTime", e.target.value)}
                    style={input}
                />

                <div style={label}>Set Maximum Time</div>
                <input
                    id="maxTime"
                    type="number"
                    value={form.maxTime}
                    onChange={(e) => onChange("maxTime", e.target.value)}
                    style={input}
                />

                <div style={label}>Light</div>
                <input
                    id="light"
                    type="number"
                    disabled value={form.light}
                    onChange={(e) => onChange("light", e.target.value)}
                    style={input}
                />

                <div style={label}>Set Light ThresHold</div>
                <input
                    id="lightThresHold"
                    type="number"
                    value={form.lightThresHold}
                    onChange={(e) => onChange("lightThresHold", e.target.value)}
                    style={input}
                />

                <div style={label}>Set Minimum Light</div>
                <input
                    id="minLight"
                    type="number"
                    value={form.minLight}
                    onChange={(e) => onChange("minLight", e.target.value)}
                    style={input}
                />

                <div style={label}>Set Maximum Light</div>
                <input
                    id="maxLight"
                    type="number"
                    value={form.maxLight}
                    onChange={(e) => onChange("maxLight", e.target.value)}
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