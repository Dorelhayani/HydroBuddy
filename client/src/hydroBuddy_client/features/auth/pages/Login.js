/* ===== Login.js ===== */

import { useState } from "react";
import {useNavigate,Link} from "react-router-dom";

import {useT} from "../../../../local/useT";
import FlashButton from "../../../ui/ButtonGenerate";
import Card, { useBorderFlash } from "../../../ui/Card";
import FlipCard from "../../../ui/FlipCard";
import GenericForm from "../../../ui/FormGenerate";
import RequestBanner from "../../../ui/RequestBanner";
import {useAuth} from "../hooks/useAuth";
import {useReg} from "../hooks/useRegister";

export default function Login({ embed = false }) {
    const {t} = useT();
    const nav = useNavigate();
    const [flipped, setFlipped] = useState(false);

    const {register} = useReg();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const { login, loading: authLoading, err: authErr } = useAuth();

    function Log({flip}) {
        const fields = [
            { name: "name", label: `${t("login.name_label")}`, placeholder:`${t("login.name")}`, type: "text" },
            { name: "password", label: `${t("login.password_label")}`, placeholder: `${t("login.password")}`, type: "password" },
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
                        <small className="text-lg fw-600 mb-8 stack-8">{t("login.login_title")}</small>
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
                                {t("login.login_btn")}</FlashButton>
                        )}
                    />
                </>
                  }
                  footer={
                      <FlashButton className="btn--transparent text-muted-500" onClick={flip}>
                          {t("login.register_txt")}
                      </FlashButton>
                  }
            />
        );
    }

    function Register({unflip}) {
        const fields = [
            { name: "name",label:`${t("login.name_label")}`, placeholder: `${t("login.name")}`,
                type:"text", required: true },

            { name: "email",label:`${t("login.email_label")}`,  placeholder: `${t("login.email")}`,
                type: "email", required: true, validate: (v) => (!v.includes("@") ? "Invalid email" : null) },

            { name: "password",label:`${t("login.password_label")}`,  placeholder: `${t("login.password")}`,
                type: "password", required: true },

            { name: "passwordConfirm",label:`${t("login.confirm_label_password")}`,
                placeholder: `${t("login.confirm_password")}`, type: "password", required: true },
        ];

        const OnSubmit = async (val) => {
            if (val.password !== val.passwordConfirm) throw new Error("Passwords must match");
            try {
                await register({ name: val.name.trim(), email: String(val.email),
                    password: String(val.password), passwordConfirm: String(val.passwordConfirm) });
                flashSuccess(1400);
                setTimeout(() => nav("/"), 600);
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
                        <small className="text-lg fw-600 mb-8 stack-8">{t("login.register_title")}</small>
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
                            >{t("login.register_btn")}
                            </FlashButton>
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

    const front = ({ flip }) => ( <> <Log flip={() => {if (!flipped) flip();}} /> </>);
    const back = ({ unflip }) => ( <Register variant={variant} unflip={() => { if (flipped) unflip(); }}/> )
    const content =
        <div>
            <FlipCard
                front={front}
                back={back}
                flippable
                isFlipped={flipped}
                onFlip={setFlipped}
            />
        </div>

    return embed ? content : ( <div> {content} </div> );
}