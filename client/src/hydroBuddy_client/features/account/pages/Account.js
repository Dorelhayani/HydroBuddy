/* ===== Account.js ===== */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {useT} from "../../../../local/useT";
import { formatDateDDMMYYYY } from "../../../shared/domain/formatters";
import FlashButton from "../../../ui/ButtonGenerate";
import Card, { useBorderFlash } from "../../../ui/Card";
import GenericForm from "../../../ui/FormGenerate";
import RequestBanner from "../../../ui/RequestBanner";
import {useAuth} from "../../auth/hooks/useAuth";
import {useAccount} from "../hooks/useAccount";

export default function Account() {
    const {t} = useT();
    const nav = useNavigate();
    const { variant, flashSuccess, flashWarning, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    const { setItems, update_account, remove_account } = useAccount();
    const { item, fetchUser, avatarUpload, changePassword, logout, loading: authLoading, err: authErr} = useAuth();

    function AccountInfo(){
        const [drawerOpen, setDrawerOpen] = React.useState(false);

        useEffect(() => {
            (async () => {
                try { const [usr] = await fetchUser(); setItems(usr);}
                catch (e) {}
            })();
        }, []);

        return (
            <Card
                className="account-card card--flow"
                variant={variant}
                header={ <h5 className="text-sm fw-600 text-muted-500 lh-1 text-center">{t("account.Account")}</h5> }
                title={<div className="account_card-title text-sm fw-600 text-muted-500 ">{t(`${item?.name}`)}</div>}
                imgsrc={
                    item && (
                        <div className="tooltip">
                            <span className="tooltiptext fw-600 text-xs">{t("account.Update_IMG")}</span>
                            <AvatarControl className="avatar-img" item={item} avatarUpload={avatarUpload}
                                           fetchUser={fetchUser}/>
                        </div>
                    )}
                body={
                <div className="account-card__body">
                    <div className="account_card-email text-sm fw-600 text-muted-500 lh-1 text-center">{item?.email}</div>

                    <div className="tooltip btn--transparent">
                        <FlashButton className="btn--transparent btn--sm">
                            <span className="tooltiptext fw-600 text-xs">{t('Analytics.title')}</span>
                            <i className="fa-solid fa-chart-pie fa-2xl" style={{ color: '#74C0FC'}} />
                            {/*<i className="fa-solid fa-chart-line" styles={{ color: "#74C0FC" }}/>*/}
                            {/*AnalyticsPanel*/}
                        </FlashButton>
                    </div>

                    <div className="account_card-joined text-sm fw-600 text-muted-500 lh-1 text-center">
                        {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                    </div>
                </div>
            }
                footer={
                <div className="account-card__footer">
                    <details
                        className="drawer" open={drawerOpen} onToggle={(e) => setDrawerOpen(e.currentTarget.open)} >
                        <summary className="drawer__summary u-center">
                            <i className="chev fa-solid fa-sort-up fa-xs" aria-hidden/>
                            <span className="fw-500 text-xs">{t("account.quick_actions")}</span>
                            <FlashButton className="btn--transparent btn--sm" title={drawerOpen ? "Collapse" : "Expand"}
                                onClick={(e) => {e.preventDefault(); e.stopPropagation(); setDrawerOpen((o) => !o);}}/>
                        </summary>

                        <div className="drawer__content">
                                <div className="drawer__viewport">
                                    <div className="u-center drawer__actions">

                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("update_account")}>
                                            <span className="tooltiptext fw-600 text-xs">{t("account.Update_Account")}</span>
                                            <i className="fa-solid fa-user-pen fa-beat fa-lg"/>
                                        </FlashButton>
                                    </div>

                                        <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("change_password")}>
                                            <span className="tooltiptext fw-600 text-xs">{t("account.Change_Password")}</span>
                                            <i className="fa-solid fa-key fa-beat fa-lg"/>
                                        </FlashButton>
                                    </div>

                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={()=> setActiveTab("log_out")}>
                                            <span className="tooltiptext fw-600 text-xs">{t("account.Log_Out")}</span>
                                            <i className="fa-solid fa-right-from-bracket fa-beat fa-lg"/>
                                        </FlashButton>
                                    </div>

                                    <div className="tooltip btn--transparent delete--tooltip">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("delete_account")}>
                                            <span className="tooltiptext fw-600 text-xs">{t("account.Delete_Account")}</span>
                                            <i className="fa-solid fa-trash-can fa-beat fa-lg"
                                               style={{color:"#ff0000"}}/>
                                        </FlashButton>

                                    </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                </div>
                }
            />
        );
    }

    /* ===== Avatar Control ===== */
    function AvatarControl({ item, avatarUpload, fetchUser }) {
        const inputRef = React.useRef(null);
        const [preview, setPreview] = React.useState(null);
        const [uploading, setUploading] = React.useState(false);
        const cacheBusterRef = React.useRef(0);

        const openPicker = () => inputRef.current?.click();
        const onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); } };

        const avatarSrc =
            preview ?? (item?.avatar_url ? `${item.avatar_url}?v=${item?.avatar_updated_at || cacheBusterRef.current}`
                : "/img/avatar-placeholder.png");

        const onChange = async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;

            const url = URL.createObjectURL(f);
            setPreview(url);

            const form = new FormData();
            form.append("avatar", f);

            try {
                setUploading(true);
                await avatarUpload(form);
                await fetchUser?.();
                cacheBusterRef.current = Date.now();
            } finally {
                setUploading(false);
                setPreview(null);
                URL.revokeObjectURL(url);
                e.target.value = "";
            }
        };

        return (
            <>
                <img key={avatarSrc} src={avatarSrc} alt="avatar" tabIndex={0} role="button" aria-label="Upload avatar"
                    aria-busy={uploading} onClick={openPicker} onKeyDown={onKey} className="avatar-img"/>
                <input ref={inputRef} type="file" accept="image/*" onChange={onChange} hidden />
            </>
        );
    }

    /* ===== Update Account ===== */
     function UpdateAccount({ variant}) {
        if (!item) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">{t("common.loading")}</div>
                </Card>
            );
        }
        const fields = [
            { name: "name", label:`${t("account.Name")}`, placeholder: item.name|| "Name", required: true },
            {
                name: "email", value: item.email, label: `${t("account.Email")}`, placeholder: item.email || "Email",
                type: "email", required: true, validate: (v) => (!v.includes("@") ? "Invalid email" : null),
            },
        ];
        const OnSubmit = async (val) => {
            try{
                const nextName  = (val.name?.trim?.() || item.name).trim();
                const nextEmail = String(val.email ?? item.email).trim();
                await update_account(item.id, { name: nextName, email: nextEmail });
                flashSuccess();
                setActiveTab('account');
            }catch(err){ flashDanger(2000); }
        };


        return (
            <Card
                className="action-card card--flow"
                variant={variant}
                header={t("account.Update_Account")}
                body={
                <div className="account_body">
                    <RequestBanner loading={authLoading} errorText={authErr} />
                    <GenericForm
                        labelClassNameAll="label-muted"
                        rowClassNameAll="text-sm fw-600"
                        fields={fields}
                        initialValues={{ name: item.name, email: item.email }}
                        onSubmit={OnSubmit}
                        customButton={({ onClick, loading }) => (
                            <FlashButton
                                className="btn btn--primary btn--block"
                                onClickAsync={onClick}
                                loading={loading || authLoading}
                                disabled={authLoading}>{t("account.Update")}</FlashButton>
                        )}
                    />
                </div>
                  }
                  footer={
                      <div className="">
                          <FlashButton className="btn--transparent btn--sm" onClick={() => setActiveTab("account")}>
                              <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                          </FlashButton>
                      </div>
                  }
            />
        );
    }

    /* ===== Change Password ===== */
    function ChangePassword({ variant, user }) {
        if (!user) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading account…</div>
                </Card>
            );
        }
        const fields = [
            { name: "currentPassword",label:`${t("account.Your_current_Password")}`, type:"password", required: true },
            { name: "newPassword", label:`${t("account.New_password")}`, type:"password", required: true },
            { name: "newPasswordConfirm", label:`${t("account.Confirm_New_Password")}`, type:"password", required: true },
        ]
        const OnSubmit = async (val) => {
            try {
                if(val.newPassword !== val.newPasswordConfirm) { new Error("Password not match!")}
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
                className="action-card card--flow"
                variant={variant}
                header={t("account.Change_Password")}
                body={
                    <>
                        <RequestBanner loading={authLoading} errorText={authErr} />
                        <GenericForm
                            labelClassNameAll="label-muted"
                            rowClassNameAll="text-sm fw-600"
                            fields={fields}
                            onSubmit={OnSubmit}
                            customButton={({ onClick, loading }) => (
                                <FlashButton
                                    className="btn btn--primary btn--block"
                                    onClickAsync={onClick}
                                    loading={loading || authLoading}
                                    disabled={authLoading}
                                >{t("account.Update")}</FlashButton>
                            )}
                        />
                    </>
                }
                footer={
                    <div className="">
                        <FlashButton
                            className="btn--transparent btn--sm"
                            onClick={() => setActiveTab("log")}>
                            <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    /* ===== Log out ===== */
    function Log_out({ onCancel }) {
        const handleLogOut = async () => {
            try {
                flashWarning();
                setTimeout(() => nav("/"), 300);
                await logout();
            } catch (err) {}
        };
        return (
            <div className="u-row">
                <p className="fw-600 text-xs">{t("account.Already_Leave")}</p>
                <div className="btn-row">
                    <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>{t("common.cancel")}</FlashButton>
                    <FlashButton className="btn btn--sm" onClickAsync={handleLogOut}>{t("account.Log_Out")}</FlashButton>
                </div>
            </div>
        );
    }

    /* ===== Delete Account ===== */
     function DeleteAccount({ item, onCancel }) {
        const nav = useNavigate();

        const handleDelete = async () => {
            try{
                if (!window.confirm()) return;
                await remove_account(item.id);
                await logout();
                nav("/");
            } catch (err) {}
        };
        return (
            <div className="">
            <small className="fw-600 text-xs">{t("account.delete_txt")}</small>
         <div className="btn-row">
             <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>{t("common.cancel")}</FlashButton>
             <FlashButton className="btn btn--danger btn--sm" onClickAsync={handleDelete}>{t("common.delete")}</FlashButton>
         </div>
            </div>
        );
    }

    return(
        <>
            <AccountInfo/>
            { activeTab === "update_account" ? ( <UpdateAccount variant={variant} user={item} />) :
            activeTab === "change_password" ? ( <ChangePassword variant={variant} user={item} /> ) :
            activeTab === "delete_account" ? ( <DeleteAccount variant={variant} onCancel={() => setActiveTab("account")}/> ) :
            activeTab === "log_out" ? (<Log_out variant={variant} onCancel={() => setActiveTab("dashboard")}/> ) : null }
        </>
    );
}