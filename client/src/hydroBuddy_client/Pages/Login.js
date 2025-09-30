// import React, { useState } from "react";
// import {Form, useNavigate} from "react-router-dom";
// import { auth } from "../services/auth";
// import { FlashButton } from "../hooks/Components";
// import { useRequestStatus } from "../hooks/RequestStatus";
//
// export default function Login() {
//     const navigate = useNavigate();
//     const { loading, start, succeed, fail } = useRequestStatus();
//
//     const [form, setForm] = useState({ name: "", password: "" });
//     const [err, setErr] = useState("");
//
//     const onChange = (e) => {
//         const { name, value } = e.target;
//         setForm((p) => ({ ...p, [name]: value }));
//     };
//
//     const onSubmit = async (e) => {
//         if (e && typeof e.preventDefault === "function") e.preventDefault();
//
//         setErr("");
//         start();
//         try {
//             await auth.login({ name: form.name.trim(), password: form.password });
//             succeed("Logged in");
//             navigate("/plants");
//         } catch (error) {
//             setErr(error.message || "Login failed");
//             fail(error);
//         }
//     };
//     return (
//         <div className="main-container">
//             <h3 className="title">Login</h3>
//
//             <Form className="grid" onSubmit={onSubmit}>
//                 <label className="label">Name</label>
//                 <input
//                     className="input"
//                     type="text"
//                     name="name"
//                     value={form.name}
//                     onChange={onChange}
//                     placeholder="Your name or email"
//                     required
//                 />
//
//                 <label className="label">Password</label>
//                 <input
//                     className="input"
//                     type="password"
//                     name="password"
//                     value={form.password}
//                     onChange={onChange}
//                     placeholder="Password"
//                     required
//                 />
//
//                 <div className="btn-container" style={{ marginTop: 12 }}>
//                     <FlashButton onClickAsync={onSubmit} loading={loading}>
//                         Sign In
//                     </FlashButton>
//                 </div>
//
//                 {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
//             </Form>
//
//             <div style={{ marginTop: 12 }}>
//                 <small>Not registered yet?</small>
//                 <button className="btn" onClick={() => navigate("Account/register")} style={{ marginLeft: 8 }}>
//                     Create account
//                 </button>
//             </div>
//         </div>
//     );
// }

import React, { useState } from "react";
import {Form, useNavigate} from "react-router-dom";
import { auth } from "../services/auth";
import { FlashButton } from "../hooks/Components";
import { useRequestStatus } from "../hooks/RequestStatus";

export default function Login() {
    const navigate = useNavigate();
    const { loading, start, succeed, fail } = useRequestStatus();

    const [form, setForm] = useState({ name: "", password: "" });
    const [err, setErr] = useState("");

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const onSubmit = async (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();

        setErr("");
        start();
        try {
            await auth.login({ name: form.name.trim(), password: form.password });
            succeed("Logged in");
            navigate("/plants");
        } catch (error) {
            setErr(error.message || "Login failed");
            fail(error);
        }
    };
    return (
        <div className="main-container">
            <h3 className="title">Login</h3>

            <Form className="grid" onSubmit={onSubmit}>
                <label className="label">Name</label>
                <input
                    className="input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your name or email"
                    required
                />

                <label className="label">Password</label>
                <input
                    className="input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Password"
                    required
                />

                <div className="btn-container" style={{ marginTop: 12 }}>
                    <FlashButton onClickAsync={onSubmit} loading={loading}>
                        Sign In
                    </FlashButton>
                </div>

                {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
            </Form>

            <div style={{ marginTop: 12 }}>
                <small>Not registered yet?</small>
                <button className="btn" onClick={() => navigate("Account/register")} style={{ marginLeft: 8 }}>
                    Create account
                </button>
            </div>
        </div>
    );
}
