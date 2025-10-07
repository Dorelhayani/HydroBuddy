import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {useAuth} from "../services/useAuth";
import GenericForm from "../components/FormGenerate";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import {formatDateDDMMYYYY} from "../domain/formatters";
import FlipCard from "../components/FlipCard";

export default function Login() {
    const nav = useNavigate();

    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const {item, login, register, changePassword} = useAuth();

    const [activeTab, setActiveTab] = useState("log");
    const [flipped, setFlipped] = useState(false);


    function Log({flip}) {
        const fields = [
            { name: "name", placeholder: "Name", required: true },
            { name: "password", placeholder: "Password", type: "password", required: true },
        ];

        const OnSubmit = async (val) => {
            try {
                await login({ name: val.name.trim(), password: val.password })
                flashSuccess(1200);
                setTimeout(() => nav("/home"), 300);
            } catch (err) {
                flashDanger(1800);
                throw new Error(err.message || "Login failed");
            }
        };

        return (
            <Card variant={variant}
                  header="Login"
                  body={
                      <GenericForm
                          fields={fields}
                          onSubmit={OnSubmit}
                          customButton={({ onClick, loading }) => (
                              <FlashButton onClickAsync={onClick} loading={loading}>Login</FlashButton> )}
                      />
                  }

                  footer={
                      <div className="footer-container">
                          <div className="footer-container" style={{ display: "flex", alignItems: "center" }}>
                              <small className="text-body-secondary">
                                  {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                              </small>
                              <button className="btn ghost" style={{ marginLeft: "auto" }} onClick={flip}>
                                  More ↪
                              </button>
                          </div>
                      </div>
                  }
            />
        );
    }

    function ChangePassword({ variant, user }) {
        if (!user) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading account…</div>
                </Card>
            );
        }
        const fields = [
            { name: "currentPassword", placeholder: `${user.currentPassword}`, required: true },
            { name: "newPassword", placeholder: "New password", required: true },
            { name: "newPasswordConfirm", placeholder: "Confirm New Password", required: true },
        ]

        const OnSubmit = async (val) => {
            try {
                if(val.password !== val.passwordConfirm) { throw new Error("Password not match!")}
                await changePassword({
                    currentPassword: val.currentPassword,
                    newPassword: val.newPassword,
                    newPasswordConfirm: val.newPasswordConfirm
                });
                flashSuccess(1200);
                setTimeout(() => nav("/"), 300);
            } catch (err) {
                flashDanger(1800);
                throw new Error(err.message || "password change failed");
            }
        };

        return (
            <Card
                variant={variant}
                header="Change Password"
                body={
                    <GenericForm
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton onClickAsync={onClick} loading={loading}>Change</FlashButton> )}
                    />
                }
                footer={
                    <div className="footer-container">
                        <button
                            className="footer-btn"
                            onClick={() => setActiveTab("log")}
                        >
                            {"🢐 Back"}
                        </button>
                    </div>
                }
            />
        );
    }

    function Register() {
        const fields = [
            { name: "name", placeholder: "Name", required: true },
            { name: "email", placeholder: "Email", type: "email", required: true, validate: (v) => (!v.includes("@") ? "Invalid email" : null) },
            { name: "password", placeholder: "Password", type: "password", required: true },
            { name: "passwordConfirm", placeholder: "Confirm Password", type: "password", required: true },
        ];

        const OnSubmit = async (val) => {
            if (val.password !== val.passwordConfirm) throw new Error("Passwords must match");
            try {
                await register({ name: val.name.trim(), email: String(val.email),
                    password: String(val.password), passwordConfirm: String(val.passwordConfirm) });
                flashSuccess(1400);
                setTimeout(() => setActiveTab("log"), 600);
            } catch (err) {
                flashDanger(2000);
                throw new Error(err.message || "Register failed");
            }
        };

        return (
            <Card
                variant={variant}
                header="Register"
                body={
                    <GenericForm
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton onClickAsync={onClick} loading={loading}>Create</FlashButton>
                        )}
                    />
                }
                footer={
                    <div className="footer-container">
                        <button
                            className="footer-btn"
                            onClick={() => setActiveTab("log")}
                        >
                            {"🢐 Back"}
                        </button>
                    </div>
                }
            />
        );
    }


    const front = ({ flip }) => (
        <>
            <Log flip={() => { if (!flipped) flip(); }} />
        </>
    );

    const back = ({ unflip }) => (
        activeTab === "change_password" ? (
            <ChangePassword variant={variant} user={item} />
        ) : activeTab === "register" ? (
            <Register variant={variant} />
        ) : (
            <Card
                variant={variant}
                header="Account Actions"
                body={
                    <div className="btn-container" style={{ display: "grid", gap: 8 }}>
                        <h5>Forgot password?</h5>
                        <button
                            className="footer-btn"
                            onClick={() => setActiveTab("change_password")}
                        >
                            Change Password
                        </button>

                        <h5>Not Register yet?</h5>
                        <button
                            className="footer-btn"
                            onClick={() => setActiveTab("register")}
                        >
                            Create account
                        </button>
                    </div>
                }
                footer={
                    <button
                        className="btn"
                        onClick={() => {
                            setActiveTab("log");
                            unflip();
                        }}
                    >
                        ↩ Back
                    </button>
                }
            />
        )
    );
    return (
        <div className="main-container">

            <div className="cards-grid">
                <FlipCard
                    front={front}
                    back={back}
                    flippable
                    isFlipped={flipped}
                    onFlip={setFlipped}
                />
            </div>
            <Outlet />
        </div>
    );
}