import { Form } from "react-router-dom";
import { SaturdayLoad } from "../hooks/ModLoad";

export default function SaturdayMode() {
    const {sensors, form, setForm, save, loading, ok, err, message} = SaturdayLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading && !sensors) return <p className="loading">Loading…</p>;
    if (!sensors) return <p className="sensors">No Data Found</p>;

    return (
        <div className="wrap">
            <h3 className="title">Saturday Mod</h3>

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

            <h5 className="sub-title">Set Mod with Numbers between 1 - 10</h5>

            <Form className="grid" method="patch" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="label">Set Activation Date (DD/MM/YYYY)</div>
                <input
                    id="dateAct" type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)}
                    className="input" required/>

                <div className="label">Activation Time (HH:MM)</div>
                <input id="timeAct" type="time" value={form.time} onChange={(e) => onChange("time", e.target.value)}
                    className="input" required/>

                <div className="label">Set Duration</div>
                <input id="duration" type="number" value={form.duration} onChange={(e) => onChange("duration", e.target.value)}
                    className="input" min={1} required/>

                <div className="btn-container">
                    <button className="btnYellow" type="submit" disabled={loading}>
                        {loading ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </Form>

            {ok && <p className="saving">{message || "Saved"}</p>}
            {err && <p className="msg">{err}</p>}
        </div>
    );
}