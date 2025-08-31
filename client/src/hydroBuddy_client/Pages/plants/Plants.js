import {Form, Outlet, useNavigate, useLoaderData} from "react-router-dom";
import { useState} from "react";
import { Api } from "../../services/api";

export default function PlantPage({plants}) {



    return (
    <div className="Plant-container">
        <div className="plant-sidebar">

        </div>
        <div className="Plant-content">
            <Outlet/>
        </div>
    </div>
)
}

export function AddPlant(){
    // const navigate = useNavigate();
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);  // להתחיל ב-false כדי להראות את הטופס
    const [ok, setOk] = useState(false);
    const [newPlant, setNewPlant] = useState({
        name: "",
        user_id: ""
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setNewPlant((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setOk(false);
        setLoading(true);
        try {
            const payload = { name: newPlant.name.trim(), user_id: Number(newPlant.user_id) };
            await Api.setPlantAdd(payload);
            setOk(true);
            // אופציונלי: לנווט לרשימת הצמחים או לאפס טופס
            // navigate("/plants");
            setNewPlant({ name: "", user_id: "" });
        } catch (e) {
            setErr(e.message || "Failed to add plant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h3>Add New Plant</h3>

            <Form method="post" onSubmit={onSubmit}>
                <label>
                    Plant
                    <input
                        type="text"
                        name="name"
                        value={newPlant.name}
                        onChange={onChange}
                        required
                    />
                </label>

                <label>
                    User Id
                    <input
                        type="number"
                        name="user_id"
                        value={newPlant.user_id}
                        onChange={onChange}
                        required
                    />
                </label>

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Plant"}
                </button>
            </Form>

            {ok && <div style={{ color: "green", marginTop: 8 }}>Plant added successfully.</div>}
            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
        </div>
    );
}