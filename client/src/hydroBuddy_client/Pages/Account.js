/* ===== Account.js ===== */

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

    function AccountInfo(){
        const [drawerOpen, setDrawerOpen] = React.useState(false);

        useEffect(() => {
            (async () => {
                try {
                    const [usr] = await fetchUser();
                    setItems(usr);
                } catch (e) { }
            })();
        }, []);

        return (
            <Card className="account-card card--flow"
                variant={variant}
                header={
                    <h5 className="text-sm fw-600 text-muted-500 lh-1 text-center">Account</h5>
                }
                title={<div className="account_card-title text-sm fw-600 text-muted-500 ">{item?.name}</div>}
                imgsrc={
                    item && (
                        <AvatarControl
                            className="avatar-img"
                            item={item}
                            avatarUpload={avatarUpload}
                            fetchUser={fetchUser}
                        />
                    )
                }
                body={
                <div className="account-card__body">
                    <div className="account_card-email text-sm fw-600 text-muted-500 lh-1 text-center">{item?.email}</div>
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
                            <span className="fw-500 text-xs"> Quick Account Actions </span>

                            <FlashButton
                                className="btn--transparent btn--sm"
                                title={drawerOpen ? "Collapse" : "Expand"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDrawerOpen((o) => !o);
                                }}/>
                        </summary>

                        <div className="drawer__content">
                                <div className="drawer__viewport">
                                    <div className="drawer__actions">

                                    {/* update account */}
                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("update_account")}>
                                            <span className="tooltiptext fw-600 text-xs">Update Account</span>
                                            <i className="fa-solid fa-user-pen fa-beat fa-lg"></i>
                                        </FlashButton>
                                    </div>

                                        {/* change password */}
                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("change_password")}>
                                            <span className="tooltiptext fw-600 text-xs">Change Password</span>
                                            <i className="fa-solid fa-key fa-beat fa-lg"></i>
                                        </FlashButton>
                                    </div>

                                        {/* log out */}
                                    <div className="tooltip btn--transparent">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("log_out")}>
                                            <span className="tooltiptext fw-600 text-xs">Log Out</span>
                                            <i className="fa-solid fa-right-from-bracket fa-beat fa-lg"></i>
                                        </FlashButton>
                                    </div>

                                        {/* delete account */}
                                    <div className="tooltip btn--transparent delete--tooltip">
                                        <FlashButton
                                            className="btn--transparent"
                                            onClick={() => setActiveTab("delete_account")}>
                                            <span className="tooltiptext fw-600 text-xs">Delete Account</span>
                                            <i className="fa-solid fa-trash-can fa-beat fa-lg"
                                               style={{color: "#ff0000"}}></i>
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
                <Card variant={variant} title="Update Account"> <div className="loading">Loading account…</div> </Card>
            );
        }

        const fields = [
            { name: "name", label:"Name", placeholder: item.name|| "Name", required: true },
            {
                name: "email", value: item.email, label: "Email", placeholder: item.email || "Email", type: "email",
                required: true, validate: (v) => (!v.includes("@") ? "Invalid email" : null),
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
                header="Update Account"
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
                                disabled={authLoading}
                            >Update</FlashButton>
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
                className="action-card card--flow"
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
                            <i className="fa-solid fa-arrow-left fa-fade fa-lg"/>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    /* ===== Log out ===== */
    function Log_out({ variant, onCancel }) {
        const handleLogOut = async () => {
            try {
                flashWarning();
                setTimeout(() => nav("/"), 300);
                await logout();
            } catch (err) {}
        };
        return (
            <div className="u-row">
                <p className="fw-600 text-xs">Already Leave ?</p>
                <div className="btn-row">
                    <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</FlashButton>
                    <FlashButton className="btn btn--sm" onClickAsync={handleLogOut}>Logout</FlashButton>
                </div>
            </div>
            // <Card
            //     className="action-card card--flow"
            //     variant={variant}
            //     body={
            //         <>
            //             <p className="fw-600 text-xs">Already Leave ?</p>
            //             <div className="btn-row">
            //                 <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</FlashButton>
            //                 <FlashButton className="btn btn--sm" onClickAsync={handleLogOut}>Log Out</FlashButton>
            //             </div>
            //         </>
            //     }
            // />
        );
    }

    /* ===== Delete Account ===== */
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
            <Card className="action-card card--flow" variant={variant} title="Delete Account">
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