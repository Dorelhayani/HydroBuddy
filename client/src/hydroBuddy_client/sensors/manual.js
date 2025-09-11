
import { ManualLoad } from "../hooks/ModLoad";
import {ToggleSwitch} from "../domain/formatters";

export default function Manual() {
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
        <div className="wrap">
            <h3 className="title">Manual MODE</h3>

            {rows.map(({ label, value }) => (
                <div key={label} className="row">
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
