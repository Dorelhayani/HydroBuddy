import { Form } from "react-router-dom";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";

export default function DeletePlant() {
    const [err, setErr] = useState("");
    const [ok, setOk] = useState(false);

    const [plants, setPlants] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [editPlant, setEditPlant] = useState({ ID: "", name: "" });


    const onSelectChange = (e) => {
        const val = e.target.value; // מחרוזת
        const chosen = plants.find((p) => String(p.id) === val);
        setEditPlant({
            ID: val,
            name: chosen?.name ?? "",
        });
        setOk(false);
        setErr("");
    };

    useEffect(() => {
        let mounted = true;
        setListLoading(true);
        setErr("");

        Api.plants.getPlantOptions()
            .then(opts => { if (mounted) setPlants(opts); })
            .catch(e => { if (mounted) setErr(e.message); })
            .finally(() => { if (mounted) setListLoading(false); });

        return () => { mounted = false; };
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setOk(false);
        setErr("");
        setSaving(true);
        try {
            const payload = { ID: Number(editPlant.ID), name: editPlant.name.trim() };
            if (!payload.ID || !payload.name) {
                throw new Error("Please choose a plant and enter a name");
            }
            await Api.plants.setPlantDelete(payload); // ראה הערה למטה לגבי הנתיב
            setOk(true);
        } catch (e) {
            setErr(e.message || "Failed to update plant");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-container">
            <h3>Delete Plant</h3>

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="patch" onSubmit={onSubmit}>
                    <label>
                        Choose Plant
                        <select name="ID" value={editPlant.ID} onChange={onSelectChange} required>
                            <option value="">— Select —</option>
                            {plants.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button className="btn" type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Delete Plant"}
                    </button>
                </Form>
            )}

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant updated successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}
