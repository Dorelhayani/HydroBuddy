// import "../style/users.css"
import { users } from "../services/users";
import { useRequestStatus } from "../hooks/RequestStatus";
import React, { useEffect, useState, useCallback } from "react";
import { Link, Outlet, Form, useOutletContext } from "react-router-dom";

export default function UserPage() {
    const [userList, setUserList] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [err, setErr] = useState("");

    const refresh = useCallback(async () => {
        setListLoading(true);
        setErr("");
        try {
            const opts = await users.getOptions();
            setUserList(opts);
        } catch (e) {
            setErr(e.message || "Failed to load plants");
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return (
        <div className="main-container">
            <div className="main-title">Users Page</div>

            <div className="link-container">
                <Link className="link" to="./add">Add User</Link>
                <Link className="link" to="./edit">Edit User</Link>
                <Link className="link" to="./delete">Delete User</Link>
            </div>

            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}

            <Outlet context={{ userList, listLoading, refresh }} />
        </div>
    );
}


export function AddUser() {
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();
    const { refresh } = useOutletContext();
    const [user, setUser] = useState({ name: "", email: "", password: "", type: "", created_at: "" });

    const onChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            await users.add({ name: user.name.trim(), email: String(user.email), password: String(user.password), type: Number(user.type) });
            succeed("user added successfully.");
            setUser({ name: "", email: "", password: "", type: "", created_at: ""});
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="main-container">
            <div className="title">Add User</div>

            <Form method="post" onSubmit={onSubmit}>
                <input className="input" type="text" name="name" value={user.name} onChange={onChange} placeholder="user name" />

                <input className="input" type="text" name="email" value={user.email} onChange={onChange} placeholder="email"/>

                <input className="input" type="text" name="password" value={user.password} onChange={onChange} placeholder="password"/>

                <input className="input" type="number" name="type" value={user.type} onChange={onChange} placeholder="type"/>

                <div className = "btn-container">
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Add user"}
                    </button>
                </div>
            </Form>

            {/*{ok && <div style={{ color: "green", marginTop: 8 }}>Plant added successfully.</div>}*/}
            {/*{err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}*/}
        </div>
    );
}


export function EditUser() {
    const { userList, listLoading, refresh } = useOutletContext();
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();
    const [edituser, setEdituser] = useState({ id: "", name: "", email: "", password: "", type: "", created_at: "" });

    const onSelectChange = (e) => {
        const val = e.target.value;
        const chosen = userList.find((p) => String(p.id) === val);
        setEdituser({
            id: val,
            name: chosen?.name ?? "",
            email: chosen?.email ?? "",
            password: chosen?.password ?? "",
            type: chosen?.type ?? "",
            created_at: chosen?.created_at ?? "",
        });
    };

    const onFieldChange = (e) => {
        const { name, value } = e.target;
        setEdituser(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            const payload = { id: Number(edituser.id), name: edituser.name.trim() , email: String(edituser.email), password: edituser.password, type: Number(edituser.type) };
            if (!payload.id || !payload.name) throw new Error("Please choose a user and enter a name");
            await users.edit(payload);
            succeed("User updated successfully.");
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="main-container">
            <div className="title">Edit User</div>

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="patch" onSubmit={onSubmit}>
                    <div className="label">
                        <select className="input" name="id" value={edituser.id} onChange={onSelectChange}>
                            <option className="opt" value="" >— Select User—</option>
                            {userList.map((p) => (
                                <option key={p.id} value={p.id}> {p.name} </option>
                            ))}
                        </select>
                    </div>

                    <div className="label">
                        <input className="input" type="text" name="name" value={edituser.name} onChange={onFieldChange}
                               placeholder="Enter new User name" required />
                    </div>

                    <div className="label">
                        <input className="input" type="text" name="email" value={edituser.email} onChange={onFieldChange}
                               placeholder="Enter new email" required />
                    </div>

                    <div className="label">
                        <input className="input" type="text" name="password" value={edituser.password} onChange={onFieldChange}
                               placeholder="Enter new password" required />
                    </div>

                    <div className="label">
                        <input className="input" type="number" name="type" value={edituser.type} onChange={onFieldChange}
                               placeholder="Enter new type" required />
                    </div>

                    <div className = "btn-container">
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Saving…" : "Edit user"}
                        </button>
                    </div>
                </Form>
            )}

            {/*{ok && <div style={{ color: "green", marginTop: 8 }}>Plant updated successfully.</div>}*/}
            {/*{err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}*/}
        </div>
    );
}


export function DeleteUser() {
    const { userList, listLoading, refresh } = useOutletContext();
    const [selectedID, setSelectedID] = useState("");
    const { loading, ok, err, start, succeed, fail } = useRequestStatus();

    const onSelectChange = (e) => {
        setSelectedID(e.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        start();
        try {
            const payload = { id: parseInt(selectedID) };
            if (!payload.id) throw new Error("Please choose a plant");
            await users.delete(payload);
            succeed("User deleted successfully.");
            setSelectedID("");
            await refresh();
        } catch (e) {
            fail(e);
        }
    };

    return (
        <div className="main-container">
            <div className="title">Delete User</div>

            {listLoading ? (
                <div>Loading plants…</div>
            ) : (
                <Form method="delete" onSubmit={onSubmit}>
                    <select className="input" name="id" value={selectedID} onChange={onSelectChange}>
                        <option value="">— Select Plant —</option>
                        {userList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <div className = "btn-container">
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Saving…" : "Delete Plant"}
                        </button>
                    </div>
                </Form>
            )}

            {/*{ok && <div style={{ color: "green", marginTop: 8 }}>Plant deleted successfully.</div>}*/}
            {/*{err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}*/}
        </div>
    );
}





