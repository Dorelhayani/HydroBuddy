import { Form } from "react-router-dom";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";

export default function EditPlant() {
    const [err, setErr] = useState("");
    const [ok, setOk] = useState(false);

    // רשימת הצמחים לבחירה
    const [plants, setPlants] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    // שמירת הטופס
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

        Api.getPlantOptions()
            .then(opts => { if (mounted) setPlants(opts); })
            .catch(e => { if (mounted) setErr(e.message); })
            .finally(() => { if (mounted) setListLoading(false); });

        return () => { mounted = false; };
    }, []);

    // שינוי טקסט בשם החדש
    const onNameChange = (e) => {
        const { value } = e.target;
        setEditPlant((prev) => ({ ...prev, name: value }));
        setOk(false);
        setErr("");
    };

    // שליחת עדכון
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
            await Api.setPlantEdit(payload); // ראה הערה למטה לגבי הנתיב
            setOk(true);
        } catch (e) {
            setErr(e.message || "Failed to update plant");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-container">
            <h3>Edit Plant</h3>

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

                    <label>
                        New Name
                        <input
                            type="text"
                            name="name"
                            value={editPlant.name}
                            onChange={onNameChange}
                            placeholder="Enter new plant name"
                            required
                        />
                    </label>

                    <button className="btn" type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Edit Plant"}
                    </button>
                </Form>
            )}

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant updated successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}
