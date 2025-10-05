import React, { useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "../domain/formatters";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import GenericForm from "../components/FormGenerate";

import {useAuth} from "../hooks/useAuth";
import {usePlants} from "../hooks/usePlants";
import {useAccount} from "../hooks/useAccount";

export default function Account() {
    const nav = useNavigate();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    const {setItems, error, update, remove} = useAccount();
    const {list, setList,fetchList} = usePlants();
    const {item, fetchUser,logout } = useAuth();


    useEffect(() => {
        (async () => {
            try {
                const [usr, plnts] = await Promise.all([fetchUser, fetchList]);
                setItems(usr);
                setList(plnts);
            } catch (e) { error(e.message); }
        })();
    }, []);

    const plantsListItems = useMemo(() => {
        if (!list || list.length === 0) {
            return <li className="list-group-item">No plants yet</li>;
        }
        return list.map((p) => (
            <li key={p.id} className="list-group-item">
                <h6>{p.planttype_name}</h6>
            </li>
        ));
    }, [list]);

    async function onLogout() {
        if (!window.confirm("Are you sure you want to Log Out?.")) return;
        await logout();
        nav("/");
    }

    function Main({ variant, item, plantsListItems }) {
        if (!item) return null;
        return (
            <Card
                variant={variant}
                header="Account"
                title={item.name}
                imgsrc=""
                text={item.email}
                list={plantsListItems}
                footer={`Joined: ${formatDateDDMMYYYY(item.created_at)}`}
            />
        );
    }

    function UpdateAccount({ variant, item }) {
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
                await update(item.id, { name: nextName, email: nextEmail });
                flashSuccess();
                setActiveTab('account');
            }catch(err){
                flashDanger(2000);
                (error(err.message))
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
                          onClick={() => setActiveTab(activeTab === "Update" ? "Back" : "account")}
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
                await remove(item.id);
                await logout();
                nav("/");
            } catch (err) {error(err.message)}

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

    return (
        <div className="main-container">

            {activeTab === "account" ? (
                <Main variant={variant} item={item} plantsListItems={plantsListItems} />
            ) : activeTab === "update_account" ? (
                <UpdateAccount variant={variant} item={item} />
            ) : activeTab === "delete_account" ? (
                <DeleteAccount variant={variant} item={item} onCancel={() => setActiveTab('account')} />
            ) : null}


            <div style={{ marginTop: 12 }}>
                <button
                    className="btn ghost"
                    style={{ marginLeft: 8 }}
                    onClick={() => setActiveTab('update_account')}
                >
                    Update Account
                </button>


                <button className="btn ghost" style={{ marginLeft: 8 }} onClick={onLogout}>
                    Log Out
                </button>

                <button
                    className="btn ghost"
                    style={{ marginLeft: 8 }}
                    onClick={() => setActiveTab('delete_account')}
                >
                    Delete Account
                </button>
            </div>
            <Outlet />
        </div>
    );
}