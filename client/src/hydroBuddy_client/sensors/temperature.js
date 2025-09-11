import { Form } from "react-router-dom";
import {TemperatureLoad} from "../hooks/ModLoad";

export default function TemperatureMode(){
    const {sensors, form, setForm, save, loading, ok, err, message} = TemperatureLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading) return <p className="loading" >Loading…</p>;
    if (!sensors) return <p className="sensors" >No Data Found</p>;

    return (
        <div className="wrap">
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

            <Form className="grid" method="patch" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="label"> Temperature (°C)</div>
                <input id="temp" type="number" disabled value={form.temp}
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
                <input id="light" type="number" disabled value={form.light}
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