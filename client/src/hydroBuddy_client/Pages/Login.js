/* ===== Login.js ===== */

import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

import {useReg} from "../hooks/useRegister";
import {useAuth} from "../hooks/useAuth";
import GenericForm from "../components/FormGenerate";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import RequestBanner from "../components/RequestBanner";

export default function Login({ embed = false }) {
    const nav = useNavigate();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();

    const {register} = useReg();
    const { login, loading: authLoading, err: authErr } = useAuth();
    const [flipped, setFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState("register");

    function Log({flip}) {
        const fields = [
            { name: "name", label: "Enter Name", placeholder:"Name", type: "text" },
            { name: "password", label: "Enter Password", placeholder: "Password", type: "password" },
        ];

        const OnSubmit = async (val) => {
            try {
                await login({ name: val.name.trim(), password: val.password })
                flashSuccess(1200);
                nav("/dashboard");
            } catch (err) {
                flashDanger(1800);
                throw new Error(err.message || "Login failed");
            }
        };

        return (
            <Card
                variant={variant}
                header={
                    <div className="mx-auto-flex mb-8">
                        <small className="text-lg fw-600 mb-8 stack-8">Login</small>
                    </div>
                }
                body={
                <>
                    <RequestBanner loading={authLoading} errorText={authErr} />
                    <GenericForm
                        className="form--inline form--roomy stack-16"
                        labelClassNameAll="label-muted"
                        placeholderClassAll="ph-muted ph-sm"
                        rowClassNameAll="text-sm fw-600"
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton
                                className="btn btn--primary btn--block"
                                onClickAsync={onClick}
                                loading={loading || authLoading}
                                disabled={authLoading}>
                                Login</FlashButton> )}
                    />
                </>
                  }

                  footer={
                      <div className="">
                          <small className="fw-600" >Not Register yet? </small>
                          <FlashButton className="nudge-r-120" disabled={authLoading} onClickAsync={flip}>
                              Create account
                          </FlashButton>
                      </div>
                  }
            />
        );
    }

    function Register({unflip}) {
        const fields = [
            { name: "name",label:"Enter Name", placeholder: "Name", type:"text", required: true },
            { name: "email",label:"Enter Email",  placeholder: "Email", type: "email", required: true,
                validate: (v) => (!v.includes("@") ? "Invalid email" : null) },
            { name: "password",label:"Enter Password",  placeholder: "Password", type: "password", required: true },
            { name: "passwordConfirm",label:"Confirm Your Password",  placeholder: "Confirm Password", type: "password", required: true },
        ];

        const OnSubmit = async (val) => {
            if (val.password !== val.passwordConfirm) throw new Error("Passwords must match");
            try {
                await register({ name: val.name.trim(), email: String(val.email),
                    password: String(val.password), passwordConfirm: String(val.passwordConfirm) });
                flashSuccess(1400);
                setTimeout(() => setActiveTab("/"), 600);
            } catch (err) {
                flashDanger(2000);
                throw new Error(err.message || "Register failed");
            }
        };

        return (
            <Card
                variant={variant}
                header={
                    <div className="mx-auto-flex mb-8">
                        <small className="text-lg fw-600 mb-8 stack-8">Register</small>
                    </div>
                }
                body={
                <>
                    <RequestBanner loading={authLoading} errorText={authErr} />
                    <GenericForm
                        className="form--inline form--roomy max-w-700"
                        labelClassNameAll="label-muted"
                        placeholderClassAll="ph-muted ph-sm"
                        rowClassNameAll="text-xs fw-600"
                        fields={fields}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton
                                className="btn btn--primary btn--block"
                                onClickAsync={onClick}
                                loading={loading || authLoading}
                                disabled={authLoading}
                            >Create</FlashButton>
                        )}
                    />
                </>
                }
                footer={
                    <div>
                        <FlashButton className="btn--left btn--transparent" onClick={unflip}>
                            <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    const front = ({ flip }) => ( <> <Log flip={() => {setActiveTab("login");  if (!flipped) flip(); }} /> </>);
    const back = ({ unflip }) => ( <Register
        variant={variant} unflip={() => {
            setActiveTab("register");
            if (flipped) unflip(); }}/> )

    const content =
        <div>
            <FlipCard
                front={front}
                back={back}
                flippable
                isFlipped={flipped}
                onFlip={setFlipped}
                autoHeight
            />
        </div>

    return embed ? content : (
        <div>
            {content}
        </div>
    );
}