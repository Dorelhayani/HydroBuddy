import React, { useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "../domain/formatters";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";

import {useAuth} from "../services/useAuth";
import {usePlants} from "../services/usePlants";
import {useAccount} from "../services/useAccount";

export default function Account() {
    const nav = useNavigate();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    const { setItems, update_account, remove_account } = useAccount();
    const { plantList, setPlantList, fetchPlants } = usePlants();
    const { item, fetchUser, avatarUpload, logout } = useAuth();

    const [flipped, setFlipped] = useState(false);

    function AccountInfo({flip}){

        useEffect(() => {
            (async () => {
                try {
                    const [usr, plnts] = await Promise.all([fetchUser(), fetchPlants()]);
                    setItems(usr);
                    setPlantList(plnts);
                } catch (e) {
                    // error;
                }
            })();
        }, []);

        const plantsListItems = useMemo(() => {
            if (!plantList || plantList.length === 0) return <li className="list-group-item">No plants yet</li>;
            return plantList.map((p) => (
                <li key={p.id} className="list-group-item">
                    <h6>{p.planttype_name}</h6>
                </li>
            ));
        }, [plantList]);

        return (
            <Card
                variant={variant}
                header="Account"
                title={item?.name}
                imgsrc={
                    item && (
                        <AvatarControl
                            item={item}
                            avatarUpload={avatarUpload}   // או {avatarUpload} אם אתה מוציא מה־useAuth
                            fetchUser={fetchUser}
                        />
                    )
                }
                text={item?.email}
                list={plantsListItems}
                footer={
                    <div className="footer-container" style={{ display: "flex", alignItems: "center" }}>
                        <small className="text-body-secondary">
                            {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                        </small>
                        <button className="btn ghost" style={{ marginLeft: "auto" }} onClick={flip}>
                            More ↪
                        </button>
                    </div>
                }
            />
        );
    }
    function AvatarControl({ item, avatarUpload }) {
        const inputRef = React.useRef(null);
        const [preview, setPreview] = React.useState(null);

        // חישוב ה-src כולל cache-busting
        // const src = preview || item?.avatar_url || "/img/avatar-placeholder.png";

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
                setPreview(null); // אחרי רענון, נעבור ל־URL האמיתי
            } finally {
                // מאפשר לבחור שוב אותו קובץ אם צריך
                e.target.value = "";
            }
        };

        return (
            <>
                <img
                    src={src}
                    alt="avatar"
                    tabIndex={0}
                    role="button"
                    aria-label="Upload avatar"
                    onClick={openPicker}
                    onKeyDown={onKey}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    hidden
                />
            </>
        );
    }

    async function onLogout() {
        if (!window.confirm("Are you sure you want to Log Out?.")) return;
        await logout();
        nav("/");
    }

        function UpdateAccount({ variant }) {
        if (!item) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading account…</div>
                </Card>
            );
        }
        const fields = [
            { name: "name", placeholder: `${item.name}`|| "Name", required: true },
            {
                name: "email",
                value: item.email,
                placeholder: `${item.email}` || "Email",
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
            }catch(err){
                flashDanger(2000);
                // error
            }
        };

        return (
            <Card variant={variant}
                  header="Update Account"
                  body={
                      <GenericForm
                          fields={fields}
                          initialValues={{ name: item.name, email: item.email }}
                          onSubmit={OnSubmit}
                          customButton={({ onClick, loading }) => (
                              <FlashButton onClickAsync={onClick} loading={loading}>Update</FlashButton>
                          )}
                      />
                  }
                  footer={
                      <button
                          className="btn"
                          onClick={() => setActiveTab("account")}

                      >
                          {"🢐 Back"}
                      </button>
                  }
            />
        );

    }

    function DeleteAccount({ variant, item, onCancel }) {
        const nav = useNavigate();

        const handleDelete = async () => {
            try{
                if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
                await remove_account(item.id);
                await logout();
                nav("/");
            } catch (err) {}

        };

        return (
            <Card variant={variant} title="Delete Account">
                <p className="txt">This action is permanent. All your plants and data may be removed.</p>
                <div className="btn-container" style={{display: "flex", gap: 8 }}>
                    <button className="btn ghost" onClick={onCancel}>Cancel</button>
                    <FlashButton onClickAsync={handleDelete}>Delete</FlashButton>
                </div>
            </Card>
        );
    }

    const front = ({ flip }) => (
        <>
            <AccountInfo flip={() => { if (!flipped) flip(); }} />
        </>
    );

    const back = ({ unflip }) => (
        activeTab === "update_account" ? ( <UpdateAccount variant={variant} user={item} />) :
            activeTab === "delete_account" ? ( <DeleteAccount variant={variant} onCancel={() => setActiveTab("account")}/> ) :
                (
            <Card
                variant={variant}
                header="Account Actions"
                body={
                    <div className="btn-container" style={{ display: "grid", gap: 8 }}>

                        <button className="footer-btn" onClick={() => setActiveTab("update_account")} >
                            Update Account
                        </button>

                        <button className="footer-btn" onClick={onLogout} > Log Out </button>

                        <button className="footer-btn" onClick={() => setActiveTab("delete_account")} >
                            Delete
                        </button>
                    </div>
                }
                footer={
                    <button
                        className="btn"
                        onClick={() => {
                            setActiveTab("account");
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
