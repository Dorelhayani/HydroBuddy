import {Form} from "react-router-dom";
import {MoistureLoad} from "../hooks/ModLoad";

export default function MoistureMode(){
    const {sensors, form, setForm, save, loading, ok, err, message} = MoistureLoad();
    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    if (loading) return <p className="loading" >Loading…</p>;
    if (!sensors) return <p className="sensors" >No Data Found</p>;

    return (
        <div className="wrap">
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

            <Form className="grid" method="patch" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="label"> Moisture (%)</div>
                <input id="moisture" type="number" disabled value={form.moisture}
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