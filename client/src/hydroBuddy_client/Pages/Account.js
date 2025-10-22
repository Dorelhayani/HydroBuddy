// Account.js

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "../domain/formatters";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";

import {useAuth} from "../hooks/useAuth";
import {useAccount} from "../hooks/useAccount";

export default function Account() {
    const nav = useNavigate();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    const { setItems, update_account, remove_account } = useAccount();
    const { item, fetchUser, avatarUpload, changePassword, logout, loading: authLoading, err: authErr} = useAuth();
    const avatarSrc = item?.avatar_url || "/img/default-avatar.png";

    const [flipped, setFlipped] = useState(false);

    // Account Information card
    function AccountInfo({flip}){
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
                                <div className="drawer__actions">
                                    <FlashButton className="btn" onClick={() => setActiveTab("update_account")}> Update Account </FlashButton>
                                    <FlashButton className="btn" onClick={() => setActiveTab("change_password")}> Change Password </FlashButton>
                                    <FlashButton className="btn btn--danger" onClick={() => setActiveTab("delete_account")}> Delete </FlashButton>
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
        const src = preview || (item?.avatar_url ? `${item.avatar_url}?t=${item?.avatar_updated_at 
        || Date.now()}` : "/img/avatar-placeholder.png");

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
                          <FlashButton className="btn--transparent btn--sm shadow-sm"
                                       onClick={() => setActiveTab("account")}>
                              <span className="text-subtle">&#706;</span></FlashButton>
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
                            className="btn--transparent btn--sm shadow-sm"
                            onClick={() => setActiveTab("log")}>
                            <span className="text-subtle">&#706;</span>
                        </FlashButton>
                    </div>
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
                <p className="txt__delete">This action is permanent. All your plants and data may be removed.</p>
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
            activeTab === "delete_account" ? ( <DeleteAccount variant={variant} onCancel={() => setActiveTab("account")}/> ) : null }
        </>
    );

    // const front = ({ flip }) => ( <AccountInfo flip={() => { if (!flipped) flip();}}/> );
    // const back = ({ unflip }) => (
    //     activeTab === "update_account" ? ( <UpdateAccount variant={variant} user={item} />) :
    //         activeTab === "change_password" ? ( <ChangePassword variant={variant} user={item} /> ) :
    //         activeTab === "delete_account" ? ( <DeleteAccount variant={variant} onCancel={() => setActiveTab("account")}/> ) :
    //             (
    //         <Card
    //             variant={variant}
    //             header="Account Actions"
    //             body={
    //                 <div className="btn-grid">
    //                     {/*<FlashButton onClick={() => setActiveTab("update_account")}> Update Account </FlashButton>*/}
    //                     {/*<FlashButton onClick={() => setActiveTab("change_password")}> Change Password </FlashButton>*/}
    //                     {/*<FlashButton onClick={() => setActiveTab("delete_account")}> Delete </FlashButton>*/}
    //                 </div>
    //             }
    //             footer={
    //                 <div className="footer-row left">
    //                     <FlashButton className="btn ghost" onClick={() => { setActiveTab("account"); unflip(); }} >
    //                         ↩ Back
    //                     </FlashButton>
    //                 </div>
    //             }
    //         />
    //     )
    // );
    //
    // return (
    //     <div className="main-container">
    //         <div className="cards-grid">
    //             <FlipCard
    //                 front={front}
    //                 back={back}
    //                 flippable
    //                 isFlipped={flipped}
    //                 onFlip={setFlipped}
    //                 autoHeight
    //
    //             />
    //         </div>
    //         {/*<Outlet />*/}
    //     </div>
    // );


}