import { useEffect, useState } from "react";
import { Api } from "../../services/api";


export default function Manual(){
    const [sensors, setSensors] = useState(null);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    function ToggleSwitch({ checked, onToggle, disabled }) {
        const base = {
            width: 64,
            height: 34,
            borderRadius: 999,
            border: "1px solid #3a3a3a",
            position: "relative",
            cursor: disabled ? "not-allowed" : "pointer",
            background: checked ? "#2ecc71" : "#e53e3e", // ירוק/אדום
            transition: "background 120ms ease",
        };
        const knob = {
            position: "absolute",
            top: 3,
            left: checked ? 34 : 3,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#1f1f1f",
            boxShadow: "0 2px 6px rgba(0,0,0,.4)",
            transition: "left 120ms ease",
        };
        return (
            <div onClick={() => !disabled && onToggle(!checked)} style={base} aria-checked={checked} role="switch">
                <div style={knob} />
            </div>
        );
    }


    async function load() {
        try {
            setLoading(true);
            setMsg("");
            const res = await Api.esp.getSensors();
            setSensors(res);
            setEnabled(Boolean(res?.MANUAL_MODE?.enabled));
        } catch (e) {
            setMsg(e.message || "Load failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleToggle(next) {
        setSaving(true);
        setMsg("");
        const prev = enabled;
        setEnabled(next);
        try {
            await Api.manual.setEnabled(next);
            setSensors((s) => ({ ...s, MANUAL_MODE: { ...(s?.MANUAL_MODE||{}), enabled: next }}));
        } catch (e) {
            setEnabled(prev);
            setMsg(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p style={{ fontFamily: "Helvetica", color: "#bbb" }}>Loading…</p>;
    if (!sensors) return <p style={{ fontFamily: "Helvetica", color: "salmon" }}>No Data Found</p>;

    const rows = [
        { label: "Temperature (°C)", value: sensors?.TEMP_MODE?.temp ?? "-" },
        { label: "Light Level",      value: sensors?.TEMP_MODE?.light ?? "-" },
        { label: "Moisture (%)",     value: sensors?.SOIL_MOISTURE_MODE?.moisture ?? "-" },
    ];

    const wrap = { fontFamily: "Helvetica", background: "#1f1f1f", color: "#eaeaea", padding: 18, borderRadius: 16, maxWidth: 400 };
    const row = { display: "grid", gridTemplateColumns: "1fr 160px", gap: 8, alignItems: "center", marginBottom: 10 };
    const valueBox = { background: "#2a2a2a", color: "#eaeaea", border: "1px solid #3a3a3a", borderRadius: 12, padding: "8px 10px" };
    const status = { marginLeft: 12, opacity: 0.85 };

    return (
        <div style={wrap}>
            <h3 style={{ marginTop: 0 }}>Manual MODE</h3>

            {rows.map(({ label, value }) => (
                <div key={label} style={row}>
                    <span>{label}</span>
                    <div style={valueBox}>{value}</div>
                </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 165, marginTop: 16 }}>
                <ToggleSwitch checked={enabled} onToggle={handleToggle} disabled={saving} />
                <span style={status}>{enabled ? "Pump ON" : "Pump OFF"}</span>
            </div>

            {saving && <p style={{ marginTop: 8 }}>שומר…</p>}
            {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </div>
    );
}