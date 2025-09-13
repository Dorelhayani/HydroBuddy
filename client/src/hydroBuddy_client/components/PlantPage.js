import { plants } from "../services/plants";
import { Link, Outlet, Form, useOutletContext } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {FlashButton} from "../hooks/Components" ;
import { useRequestStatus } from "../hooks/RequestStatus";


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
        <div className="main-container">
            <div className="main-title">Plant Page</div>

            <div className="link-container">
                <Link className="link" to="./add">Add Plant</Link>
                <Link className="link" to="./edit">Edit Plant</Link>
                <Link className="link" to="./delete">Delete Plant</Link>
            </div>

            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}

            <Outlet context={{ plantsList, listLoading, refresh }} />
        </div>
    );
}

export function AddPlant() {
    const { loading, start, succeed, fail } = useRequestStatus();
    const { refresh } = useOutletContext();
    const [plant, setPlant] = useState({ name: "", user_id: "" });

    const onChange = (e) => {
        const { name, value } = e.target;
        setPlant((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async () => {
        start();
        try {
            await plants.add({ name: plant.name.trim(), user_id: Number(plant.user_id) });
            succeed("Plant added successfully.");
            setPlant({ name: "", user_id: "" });
            await refresh();
        } catch (e) {
            fail(e);
            throw e;
        }
    };

    return (
        <div className="main-container">
            <div className="title">Add Plant</div>

            <Form method="post" onSubmit={(e) => e.preventDefault()}>
                <input className="input" type="text" name="name" value={plant.name}
                       onChange={onChange} placeholder="Plant" />

                <input className="input" type="number" name="user_id" value={plant.user_id}
                       onChange={onChange} placeholder="User Id" />

                <div className="btn-container">
                    <FlashButton onClickAsync={onSubmit} loading={loading}>Add Plant</FlashButton>
                </div>
            </Form>
        </div>
    );
}


export function EditPlant() {
    const { plantsList, listLoading, refresh } = useOutletContext();
    const { loading, start, succeed, fail } = useRequestStatus();
    const [editPlant, setEditPlant] = useState({ ID: "", name: "" });

    const onSelectChange = (e) => {
        const val = e.target.value;
        const chosen = plantsList.find((p) => String(p.id) === val);
        setEditPlant({
            ID: val,
            name: chosen?.name ?? "",
        });
    };

    const onFieldChange = (e) => {
        const { name, value } = e.target;
        setEditPlant(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async () => {
        start();
        try {
            const payload = { ID: Number(editPlant.ID), name: editPlant.name.trim() };
            if (!payload.ID || !payload.name) throw new Error("Please choose a plant and enter a name");
            await plants.edit(payload);
            succeed("Plant updated successfully.");
            await refresh();
        } catch (e) {
            fail(e);
            throw e;
        }
    };

    return (
        <div className="main-container">
            <div className="title">Edit Plant</div>

            {listLoading ? ( <div>Loading plants…</div> ) :
                (
                <Form method="patch" onSubmit={(e) => e.preventDefault()}>
                    <div className="label">
                        <select className="input" name="ID" value={editPlant.ID} onChange={onSelectChange}>
                            <option className="opt" value="" >— Select Plant—</option>
                            {plantsList.map((p) => (
                                <option key={p.id} value={p.id}> {p.name} </option>
                            ))}
                        </select>
                    </div>

                    <div className="label">
                        {/*<input className="input" type="text" name="name" value={editPlant.name} onChange={onNameChange}*/}
                        <input className="input" type="text" name="name" value={editPlant.name} onChange={onFieldChange}
                            placeholder="Enter new plant name" required />
                    </div>

                    <div className = "btn-container">
                        <FlashButton onClickAsync={onSubmit} loading={loading}>Edit Plant</FlashButton>
                    </div>
                </Form>
            )}
        </div>
    );
}


export function DeletePlant() {
    const { plantsList, listLoading, refresh } = useOutletContext();
    const [selectedID, setSelectedID] = useState("");
    const { loading, start, succeed, fail } = useRequestStatus();

    const onSelectChange = (e) => {
        setSelectedID(e.target.value);
    };

    const onSubmit = async () => {
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
            throw e;
        }
    };

    return (
        <div className="main-container">
            <div className="title">Delete Plant</div>

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="delete" onSubmit={(e) => e.preventDefault()}>
                    <select className="input" name="ID" value={selectedID} onChange={onSelectChange}>
                        <option value="">— Select Plant —</option>
                        {plantsList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <div className = "btn-container">
                        <FlashButton onClickAsync={onSubmit} loading={loading}>Delete Plant</FlashButton>
                    </div>
                </Form>
            )}
        </div>
    );
}





