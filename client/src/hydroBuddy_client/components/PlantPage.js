import { Link, Outlet, Form, useOutletContext } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { plants } from "../services/plants";
import { useRequestStatus } from "../hooks/RequestStatus";
import "../style/Plant.css"

export default function PlantPage() {
    const [plantsList, setPlantsList] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [err, setErr] = useState("");

    const refresh = useCallback(async () => {
        setListLoading(true);
        setErr("");
        try {
            const opts = await plants.getOptions();
            setPlantsList(opts);
        } catch (e) {
            setErr(e.message || "Failed to load plants");
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return (
        <div className="wrap">
            <h3 style={{ marginTop: 0 }}>Plant Page</h3>

            <div className="grid">
                <Link className="btnYellow" to="./add">Add Plant</Link>
                <Link className="btnYellow" to="./edit">Edit Plant</Link>
                <Link className="btnYellow" to="./delete">Delete Plant</Link>
            </div>

            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}

            <Outlet context={{ plantsList, listLoading, refresh }} />
        </div>
    );
}


export function AddPlant() {
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();
    const { refresh } = useOutletContext();
    const [plant, setPlant] = useState({ name: "", user_id: "" });

    const onChange = (e) => {
        const { name, value } = e.target;
        setPlant((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            await plants.add({ name: plant.name.trim(), user_id: Number(plant.user_id) });
            succeed("Plant added successfully.");
            setPlant({ name: "", user_id: "" });
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="wrap">
            {/*<div className="title">${plants.add.title}</div>*/}
            <div className="title">Add Plant</div>

            <Form method="post" onSubmit={onSubmit}>
                <input className="input" type="text" name="name" value={plant.name} onChange={onChange} placeholder="Pant" />

                <input className="input" type="number" name="user_id" value={plant.user_id} onChange={onChange} placeholder="User Id"/>

                <div className = "btn-container">
                    <button className="btnYellow" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Add Plant"}
                    </button>
                </div>
            </Form>

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant added successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}


export function EditPlant() {
    const { plantsList, listLoading, refresh } = useOutletContext();
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();
    const [editPlant, setEditPlant] = useState({ ID: "", name: "" });

    const onSelectChange = (e) => {
        const val = e.target.value;
        const chosen = plantsList.find((p) => String(p.id) === val);
        setEditPlant({
            ID: val,
            name: chosen?.name ?? "",
        });
    };

    const onNameChange = (e) => {
        const { value } = e.target;
        setEditPlant((prev) => ({ ...prev, name: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            const payload = { ID: Number(editPlant.ID), name: editPlant.name.trim() };
            if (!payload.ID || !payload.name) throw new Error("Please choose a plant and enter a name");
            await plants.edit(payload);
            succeed("Plant updated successfully.");
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="wrap">
            <div className="title">Edit Plant</div>
            {/*<h4 style={{ marginTop: 0 }}>Edit Plant</h4>*/}

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="patch" onSubmit={onSubmit}>
                    <div className="label">
                        <select className="input" name="ID" value={editPlant.ID} onChange={onSelectChange}>
                            <option className="opt" value="" >— Select Plant—</option>
                            {plantsList.map((p) => (
                                <option key={p.id} value={p.id}> {p.name} </option>
                            ))}
                        </select>
                    </div>

                    <div className="label">
                        <input className="input" type="text" name="name" value={editPlant.name} onChange={onNameChange}
                            placeholder="Enter new plant name" required />
                    </div>

                    <div className = "btn-container">
                        <button className="btnYellow" type="submit" disabled={loading}>
                            {loading ? "Saving…" : "Edit Plant"}
                        </button>
                    </div>
                </Form>
            )}

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant updated successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}


export function DeletePlant() {
    const { plantsList, listLoading, refresh } = useOutletContext();
    const [selectedID, setSelectedID] = useState("");
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();

    const onSelectChange = (e) => {
        setSelectedID(e.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            const payload = { ID: parseInt(selectedID) };
            if (!payload.ID) throw new Error("Please choose a plant");
            await plants.delete(payload);
            succeed("Plant deleted successfully.");
            setSelectedID("");
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="wrap">
            {/*<h4 style={{ marginTop: 0 }}>Delete Plant</h4>*/}
            <div className="title">Delete Plant</div>

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="delete" onSubmit={onSubmit}>
                    <select className="input" name="ID" value={selectedID} onChange={onSelectChange}>
                        <option value="">— Select Plant —</option>
                        {plantsList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <div className = "btn-container">
                        <button className="btnYellow" type="submit" disabled={loading}>
                            {loading ? "Saving…" : "Delete Plant"}
                        </button>
                    </div>
                </Form>
            )}

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant deleted successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}





