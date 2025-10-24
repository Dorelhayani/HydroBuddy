// Account.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "../domain/formatters";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";

import {useAuth} from "../hooks/useAuth";
import {useAccount} from "../hooks/useAccount";

export default function Account() {
    const nav = useNavigate();
    const { variant, flashSuccess, flashWarning, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    const { setItems, update_account, remove_account } = useAccount();
    const { item, fetchUser, avatarUpload, changePassword, logout, loading: authLoading, err: authErr} = useAuth();
    const avatarSrc = item?.avatar_url || "/img/default-avatar.png";

    // Account Information card
    function AccountInfo(){
        const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
        useEffect(() => {
            (async () => {
                try {
                    const [usr] = await fetchUser();
                    setItems(usr);
                } catch (e) { }
            })();
        }, []);

        return (
            <Card
                variant={variant}
                header="Account"
                title={item?.name}
                imgsrc={
                    item && (
                        <AvatarControl
                            item={item}
                            avatarUpload={avatarUpload}
                            fetchUser={fetchUser}
                        />
                    )
                }
                text={item?.email}
                list={
                    <small className="text-body-secondary">
                        {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                    </small>
                }
                footer={
                        <details className="drawer">
                            <summary className="drawer__summary">
                                <span className="chev" aria-hidden>▾</span>
                                <span className="fw-500 text-xs">Quick Account Actions</span>
                                <FlashButton
                                    className="btn--transparent btn--sm"
                                    onClick={() => setSidebarCollapsed((s) => !s)}
                                    title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} >
                                </FlashButton>
                            </summary>

                            <div className="drawer__content">
                                <div className="drawer__viewport">
                                    <div className="drawer__actions">

                                    <div className="ms-auto">
                                    {/* update account */}
                                    <div className="tooltip btn--transparent">
                                    <FlashButton
                                        className="btn--transparent"
                                        onClick={() => setActiveTab("update_account")}>
                                            <span className="tooltiptext fw-600 text-xs">Update Account</span>
                                        <i className="fa-solid fa-user"/>
                                    </FlashButton>
                                </div>

                                    {/* change password */}
                                    <div className="tooltip btn--transparent">
                                    <FlashButton
                                        className="btn--transparent"
                                        onClick={() => setActiveTab("change_password")}>
                                        <span className="tooltiptext fw-600 text-xs">Change Password</span>
                                        <i className="fa-solid fa-key"/>
                                    </FlashButton>
                                    </div>

                                    {/* log out */}
                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("log_out")}>
                                            <span className="tooltiptext fw-600 text-xs">Log Out</span>
                                            <i className="fas fa-sign-out-alt"/>
                                        </FlashButton>
                                    </div>

                                    {/* delete account */}
                                    <div className="tooltip btn--transparent delete--tooltip">
                                    <FlashButton
                                        className="btn--transparent"
                                        onClick={() => setActiveTab("delete_account")}>
                                        <span className="tooltiptext fw-600 text-xs">Delete Account</span>
                                        <i className="fa-solid fa-trash-can"/>
                                    </FlashButton>

                                    </div>
                                    </div>

                                    </div>
                                </div>
                            </div>
                        </details>
                }
            />
        );
    }

    // Avatar Control function
    function AvatarControl({ item, avatarUpload }) {
        const inputRef = React.useRef(null);
        const [preview, setPreview] = React.useState(null);
        // const src = preview || (item?.avatar_url ? `${item.avatar_url}?t=${item?.avatar_updated_at
        // || Date.now()}` : "/img/avatar-placeholder.png");

        // פתיחת דיאלוג הקובץ בלחיצה על התמונה / מקלדת
        const openPicker = () => inputRef.current?.click();
        const onKey = (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); }
        };

        // שינוי קובץ + preview + העלאה + רענון user
        const onChange = async (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;

            // Preview מיידי
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(f);

            // העלאה
            const form = new FormData();
            form.append("avatar", f); // השם "avatar" חייב להתאים ל-upload.single('avatar') בשרת
            try {
                await avatarUpload(form);
                setPreview(null);
            } finally {
                e.target.value = "";
            }
        };

        return (
            <>
                <img key={avatarSrc} src={avatarSrc} alt="avatar" tabIndex={0} role="button" aria-label="Upload avatar" onClick={openPicker}
                    onKeyDown={onKey} className="avatar-img" />
                <input ref={inputRef} type="file" accept="image/*" onChange={onChange} hidden/>
            </>
        );
    }

    // Update Account card
     function UpdateAccount({ variant}) {
        if (!item) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading account…</div>
                </Card>
            );
        }

        const fields = [
            { name: "name", label:"Name", placeholder: item.name|| "Name", required: true },
            {
                name: "email",
                value: item.email,
                label: "Email",
                placeholder: item.email || "Email",
                type: "email",
                required: true,
                validate: (v) => (!v.includes("@") ? "Invalid email" : null),
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
            <Card variant={variant}
                  header="Update Account"
                  body={
                <>
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
                                disabled={authLoading}
                            >Update</FlashButton>
                        )}
                    />
                </>

                  }
                  footer={
                      <div className="">
                          <FlashButton className="btn--transparent btn--sm"
                                       onClick={() => setActiveTab("account")}>
                              <i className="fa-solid fa-circle-arrow-left"></i></FlashButton>
                      </div>
                  }
            />
        );
    }

    // Change Password card
    function ChangePassword({ variant, user }) {
        if (!user) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading account…</div>
                </Card>
            );
        }
        const fields = [
            { name: "currentPassword", placeholder: "Your current Password", type:"password", required: true },
            { name: "newPassword", placeholder: "New password", type:"password", required: true },
            { name: "newPasswordConfirm", placeholder: "Confirm New Password", type:"password", required: true },
        ]

        const OnSubmit = async (val) => {
            try {
                if(val.newPassword !== val.newPasswordConfirm) { throw new Error("Password not match!")}
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
                                >Change</FlashButton> )}
                        />
                    </>
                }
                footer={
                    <div className="">
                        <FlashButton
                            className="btn--transparent btn--sm"
                            onClick={() => setActiveTab("log")}>
                            <i className="fa-solid fa-circle-arrow-left"></i>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    // Log Out Card
    function Log_out({ variant, onCancel }) {
        const handleLogOut = async () => {
            try {
                flashWarning();
                setTimeout(() => nav("/"), 300);
                await logout();
            } catch (err) {}
        };

        return (
            <Card
                className="cards-grid"
                variant={variant}
                body={
                    <>
                        <p className="fw-600 text-xs">Already Leave ?</p>
                        <div className="btn-row">
                            <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</FlashButton>
                            <FlashButton className="btn btn--sm" onClickAsync={handleLogOut}>Log Out</FlashButton>
                        </div>
                    </>
                }
            />
        );
    }

    // Delete Account card
     function DeleteAccount({ variant, item, onCancel }) {
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
            <Card variant={variant} title="Delete Account">
                <p className="fw-600 text-xs">This action is permanent. All your plants and data may be removed.</p>
                <div className="btn-row">
                    <FlashButton className="btn btn--outline btn--sm"  onClick={onCancel}>Cancel</FlashButton>
                    <FlashButton className="btn btn--danger btn--sm" onClickAsync={handleDelete}>Delete</FlashButton>
                </div>
            </Card>
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