// Login.js

import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {useAuth} from "../hooks/useAuth";
import GenericForm from "../components/FormGenerate";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import {formatDateDDMMYYYY} from "../domain/formatters";
import RequestBanner from "../components/RequestBanner";

export default function Login() {
    const nav = useNavigate();

    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const { item, login, register, loading: authLoading, err: authErr } = useAuth();

    const [activeTab, setActiveTab] = useState("log");
    const [flipped, setFlipped] = useState(false);

    // Log card
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
                <>
                    <RequestBanner loading={authLoading} errorText={authErr} />
                    {authErr && <div style={{color:"salmon", marginBottom:8}}>{authErr}</div>}
                    <GenericForm
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton onClickAsync={onClick} loading={loading || authLoading} disabled={authLoading}>
                                Login</FlashButton> )}
                    />
                </>
                  }

                  footer={
                      <div className="footer-row">
                              <small className="text-body-secondary">
                                  {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                              </small>


                              <button className="btn ghost ml-auto" onClick={() => { if (!authLoading) flip(); }}
                                      disabled={authLoading}><small>Not Register yet? </small></button>
                      </div>
                  }
            />
        );
    }

    // Register card
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
                <>
                    <RequestBanner loading={authLoading} errorText={authErr} />
                    <GenericForm
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton
                                onClickAsync={onClick}
                                loading={loading || authLoading}
                                disabled={authLoading}
                            >Create</FlashButton>
                        )}
                    />
                </>

                }
                footer={
                    <div className="footer-row">
                        <button  className="btn ghost ml-auto" onClick={() => setActiveTab("log")} >
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
            activeTab === "register" ? ( <Register variant={variant} /> ) :
                (
            <Card
                variant={variant}
                header="Account Actions"
                body={
                    <div className="btn-grid">
                        <button className="footer-btn" onClick={() => setActiveTab("register")}>
                            Create account
                        </button>
                    </div>
                }
                footer={
                    <div className="footer-row">
                    <button  className="btn ghost" onClick={() => { setActiveTab("log"); unflip(); }} >
                        ↩ Back
                    </button>
                    </div>
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