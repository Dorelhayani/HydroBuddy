// import { plants } from "../services/plants";
// import { Link, Outlet, Form, useOutletContext } from "react-router-dom";
// import React, { useEffect, useState, useCallback  } from "react";
// import {FlashButton} from "../hooks/Components" ;
// import { useRequestStatus } from "../hooks/RequestStatus";
//
// export default function Plants() {
//     const [plantsList, setPlantsList] = useState([]);
//     const [listLoading, setListLoading] = useState(true);
//     const [err, setErr] = useState("");
//
//     const refresh = useCallback(async () => {
//         setListLoading(true);
//         setErr("");
//         try {
//             const opts = await plants.getOptions();
//             setPlantsList(opts);
//         } catch (e) {
//             setErr(e.message || "Failed to load plants");
//         } finally {
//             setListLoading(false);
//         }
//     }, []);
//
//     useEffect(() => { refresh(); }, [refresh]);
//
//     return (
//         <div className="main-container">
//             <div className="main-title">Plant Page</div>
//
//             <div className="link-container">
//                 <Link className="link" to="./add">Add Plant</Link>
//                 <Link className="link" to="./edit">Edit Plant</Link>
//                 <Link className="link" to="./delete">Delete Plant</Link>
//             </div>
//
//             {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
//
//             <Outlet context={{ plantsList, listLoading, refresh }} />
//             <Link className="link" to='/home'>Home Page</Link>
//         </div>
//     );
// }
//
// export function AddPlant() {
//     const { loading, start, succeed, fail } = useRequestStatus();
//     const { refresh } = useOutletContext();
//     const [plant, setPlant] = useState({ name: "", user_id: "" });
//
//     const onChange = (e) => {
//         const { name, value } = e.target;
//         setPlant((prev) => ({ ...prev, [name]: value }));
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             // await plants.add({ name: plant.name.trim(), user_id: Number(plant.user_id) });
//             await plants.add({ name: plant.name.trim() });
//             succeed("Plant added successfully.");
//             setPlant({ name: "", user_id: "" });
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Add Plant</div>
//
//             <Form method="post" onSubmit={(e) => e.preventDefault()}>
//                 <input className="input" type="text" name="name" value={plant.name}
//                        onChange={onChange} placeholder="Plant" />
//
//                 <input className="input" type="number" name="user_id" value={plant.user_id}
//                        onChange={onChange} placeholder="User Id" />
//
//                 <div className="btn-container">
//                     <FlashButton onClickAsync={onSubmit} loading={loading}>Add Plant</FlashButton>
//                 </div>
//             </Form>
//         </div>
//     );
// }
//
//
// export function EditPlant() {
//     const { plantsList, listLoading, refresh } = useOutletContext();
//     const { loading, start, succeed, fail } = useRequestStatus();
//     const [editPlant, setEditPlant] = useState({ ID: "", name: "" });
//
//     const onSelectChange = (e) => {
//         const val = e.target.value;
//         const chosen = plantsList.find((p) => String(p.id) === val);
//         setEditPlant({
//             ID: val,
//             name: chosen?.name ?? "",
//         });
//     };
//
//     const onFieldChange = (e) => {
//         const { name, value } = e.target;
//         setEditPlant(prev => ({ ...prev, [name]: value }));
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             const payload = { ID: Number(editPlant.ID), name: editPlant.name.trim() };
//             if (!payload.ID || !payload.name) throw new Error("Please choose a plant and enter a name");
//             await plants.edit(payload);
//             succeed("Plant updated successfully.");
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Edit Plant</div>
//
//             {listLoading ? ( <div>Loading plants…</div> ) :
//                 (
//                 <Form method="patch" onSubmit={(e) => e.preventDefault()}>
//                     <div className="label">
//                         <select className="input" name="ID" value={editPlant.ID} onChange={onSelectChange}>
//                             <option className="opt" value="" >— Select Plant—</option>
//                             {plantsList.map((p) => (
//                                 <option key={p.id} value={p.id}> {p.name} </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div className="label">
//                         <input className="input" type="text" name="name" value={editPlant.name} onChange={onFieldChange}
//                             placeholder="Enter new plant name" required />
//                     </div>
//
//                     <div className = "btn-container">
//                         <FlashButton onClickAsync={onSubmit} loading={loading}>Edit Plant</FlashButton>
//                     </div>
//                 </Form>
//             )}
//         </div>
//     );
// }
//
//
// export function DeletePlant() {
//     const { plantsList, listLoading, refresh } = useOutletContext();
//     const [selectedID, setSelectedID] = useState("");
//     const { loading, start, succeed, fail } = useRequestStatus();
//
//     const onSelectChange = (e) => {
//         setSelectedID(e.target.value);
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             const payload = { ID: parseInt(selectedID) };
//             if (!payload.ID) throw new Error("Please choose a plant");
//             await plants.delete(payload);
//             succeed("Plant deleted successfully.");
//             setSelectedID("");
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Delete Plant</div>
//
//             {listLoading ? (
//                 <div>Loading plants…</div>
//             ) : (
//                 <Form method="delete" onSubmit={(e) => e.preventDefault()}>
//                     <select className="input" name="ID" value={selectedID} onChange={onSelectChange}>
//                         <option value="">— Select Plant —</option>
//                         {plantsList.map((p) => (
//                             <option key={p.id} value={p.id}>
//                                 {p.name}
//                             </option>
//                         ))}
//                     </select>
//
//                     <div className = "btn-container">
//                         <FlashButton onClickAsync={onSubmit} loading={loading}>Delete Plant</FlashButton>
//                     </div>
//                 </Form>
//             )}
//         </div>
//     );
// }

// import { plants } from "../services/plants";
// import { Link, Outlet, Form, useOutletContext } from "react-router-dom";
// import React, { useEffect, useState, useCallback  } from "react";
// import FlashButton from "../components/ButtonGenerate" ;
// import { useRequestStatus } from "../hooks/RequestStatus";
//
// export default function Plants() {
//     const [plantsList, setPlantsList] = useState([]);
//     const [listLoading, setListLoading] = useState(true);
//     const [err, setErr] = useState("");
//
//     const refresh = useCallback(async () => {
//         setListLoading(true);
//         setErr("");
//         try {
//             const opts = await plants.getOptions();
//             setPlantsList(opts);
//         } catch (e) {
//             setErr(e.message || "Failed to load plants");
//         } finally {
//             setListLoading(false);
//         }
//     }, []);
//
//     useEffect(() => { refresh(); }, [refresh]);
//
//     return (
//         <div className="main-container">
//             <div className="main-title">Plant Page</div>
//
//             <div className="link-container">
//                 <Link className="link" to="./add">Add Plant</Link>
//                 <Link className="link" to="./edit">Edit Plant</Link>
//                 <Link className="link" to="./delete">Delete Plant</Link>
//             </div>
//
//             {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}
//
//             <Outlet context={{ plantsList, listLoading, refresh }} />
//         </div>
//     );
// }
//
// export function AddPlant() {
//     const { loading, start, succeed, fail } = useRequestStatus();
//     const { refresh } = useOutletContext();
//     const [plant, setPlant] = useState({ name: "", user_id: "" });
//
//     const onChange = (e) => {
//         const { name, value } = e.target;
//         setPlant((prev) => ({ ...prev, [name]: value }));
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             // await plants.add({ name: plant.name.trim(), user_id: Number(plant.user_id) });
//             await plants.add({ name: plant.name.trim() });
//             succeed("Plant added successfully.");
//             setPlant({ name: "", user_id: "" });
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Add Plant</div>
//
//             <Form method="post" onSubmit={(e) => e.preventDefault()}>
//                 <input className="input" type="text" name="name" value={plant.name}
//                        onChange={onChange} placeholder="Plant" />
//
//                 {/*<input className="input" type="number" name="user_id" value={plant.user_id}*/}
//                 {/*       onChange={onChange} placeholder="User Id" />*/}
//
//                 <div className="btn-container">
//                     <FlashButton onClickAsync={onSubmit} loading={loading}>Add Plant</FlashButton>
//                 </div>
//             </Form>
//         </div>
//     );
// }
//
//
// export function EditPlant() {
//     const { plantsList, listLoading, refresh } = useOutletContext();
//     const { loading, start, succeed, fail } = useRequestStatus();
//     const [editPlant, setEditPlant] = useState({ ID: "", name: "" });
//
//     const onSelectChange = (e) => {
//         const val = e.target.value;
//         const chosen = plantsList.find((p) => String(p.id) === val);
//         setEditPlant({
//             ID: val,
//             name: chosen?.name ?? "",
//         });
//     };
//
//     const onFieldChange = (e) => {
//         const { name, value } = e.target;
//         setEditPlant(prev => ({ ...prev, [name]: value }));
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             const payload = { ID: Number(editPlant.ID), name: editPlant.name.trim() };
//             if (!payload.ID || !payload.name) throw new Error("Please choose a plant and enter a name");
//             await plants.edit(payload);
//             succeed("Plant updated successfully.");
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Edit Plant</div>
//
//             {listLoading ? ( <div>Loading plants…</div> ) :
//                 (
//                     <Form method="patch" onSubmit={(e) => e.preventDefault()}>
//                         <div className="label">
//                             <select className="input" name="ID" value={editPlant.ID} onChange={onSelectChange}>
//                                 <option className="opt" value="" >— Select Plant—</option>
//                                 {plantsList.map((p) => (
//                                     <option key={p.id} value={p.id}> {p.name} </option>
//                                 ))}
//                             </select>
//                         </div>
//
//                         <div className="label">
//                             <input className="input" type="text" name="name" value={editPlant.name} onChange={onFieldChange}
//                                    placeholder="Enter new plant name" required />
//                         </div>
//
//                         <div className = "btn-container">
//                             <FlashButton onClickAsync={onSubmit} loading={loading}>Edit Plant</FlashButton>
//                         </div>
//                     </Form>
//                 )}
//         </div>
//     );
// }
//
//
// export function DeletePlant() {
//     const { plantsList, listLoading, refresh } = useOutletContext();
//     const [selectedID, setSelectedID] = useState("");
//     const { loading, start, succeed, fail } = useRequestStatus();
//
//     const onSelectChange = (e) => {
//         setSelectedID(e.target.value);
//     };
//
//     const onSubmit = async () => {
//         start();
//         try {
//             const payload = { ID: parseInt(selectedID) };
//             if (!payload.ID) throw new Error("Please choose a plant");
//             await plants.delete(payload);
//             succeed("Plant deleted successfully.");
//             setSelectedID("");
//             await refresh();
//         } catch (e) {
//             fail(e);
//             throw e;
//         }
//     };
//
//     return (
//         <div className="main-container">
//             <div className="title">Delete Plant</div>
//
//             {listLoading ? (
//                 <div>Loading plants…</div>
//             ) : (
//                 <Form method="delete" onSubmit={(e) => e.preventDefault()}>
//                     <select className="input" name="ID" value={selectedID} onChange={onSelectChange}>
//                         <option value="">— Select Plant —</option>
//                         {plantsList.map((p) => (
//                             <option key={p.id} value={p.id}>
//                                 {p.name}
//                             </option>
//                         ))}
//                     </select>
//
//                     <div className = "btn-container">
//                         <FlashButton onClickAsync={onSubmit} loading={loading}>Delete Plant</FlashButton>
//                     </div>
//                 </Form>
//             )}
//         </div>
//     );
// }

import React, { useEffect, useState } from "react";
import {Outlet, useNavigate} from "react-router-dom";
import { formatDateDDMMYYYY } from "../domain/formatters";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";

import {useAuth} from "../hooks/useAuth";
import {usePlants} from "../hooks/usePlants";
import {plants} from "../services/plants";
// import {useAccount} from "../hooks/useAccount";

export default function Plants() {

    const nav = useNavigate();
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("account");

    // const { setItems, update_account, remove_account } = useAccount();
    const { plant, setPlant, plantsListItems, fetchPlants, add_plant, update_plant, remove_plant} = usePlants();
    const { item, fetchUser, avatarUpload, logout, loading: authLoading, err: authErr} = useAuth();

    const [flipped, setFlipped] = useState(false);

    function PlnatInfo({flip}){
        useEffect(() => {
            (async () => {
                try {
                    const plnts = await fetchPlants();
                    setPlant(plnts);
                } catch (e) {
                    console.error(e);
                }
            })();
        }, []);

        return (
            <Card
                variant={variant}
                header="Plant"
                title={plant?.name}
                // imgsrc={
                //     item && (
                //         <AvatarControl
                //             item={item}
                //             avatarUpload={avatarUpload}   // או {avatarUpload} אם אתה מוציא מה־useAuth
                //             fetchUser={fetchUser}
                //         />
                //     )
                // }
                list={plantsListItems}
                footer={
                    <div className="footer-row">
                        <small className="text-body-secondary">
                            {item ? `Joined: ${formatDateDDMMYYYY(item.created_at)}` : "Loading..."}
                        </small>
                        <button className="btn ghost ml-auto" onClick={flip}> More ↪ </button>
                    </div>
                }
            />
        );
    }

    function AddPlant({ variant }){
        const fields = [
            { name: "name", placeholder: "Plant", required: true },
        ];

        const OnSubmit = async (val) => {
            try {
                await add_plant({ name: val.name.trim() });
                flashSuccess(1400);
                setTimeout(() => setActiveTab("log"), 600);
            } catch (err) {
                flashDanger(2000);
                throw new Error(err.message || "Plant Add failed");
            }
        };

        return (
            <Card
                variant={variant}
                header="Add Plant"
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
                                >Add</FlashButton>
                            )}
                        />
                    </>

                }
                footer={
                    <div className="footer-row">
                        <button
                            className="btn ghost ml-auto"
                            onClick={() => setActiveTab("log")}
                        >
                            {"🢐 Back"}
                        </button>
                    </div>
                }
            />
        );
    }

    function UpdatePlant({ variant }){
        if (!plant) {
            return (
                <Card variant={variant} title="Update Account">
                    <div className="loading">Loading Plants…</div>
                </Card>
            );
        }
        const fields = [ { name: "name", placeholder: `${plant.name}`|| "Plant", required: true } ];
        const OnSubmit = async (val) => {
            try{
                const nextName  = (val.name?.trim?.() || item.name).trim();
                await update_plant(item.id, { name: nextName });
                flashSuccess();
                setActiveTab('account');
            }catch(err){
                flashDanger(2000);
                // error
            }
        };

        return (
            <Card variant={variant}
                  header="Update Plant"
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
                              fields={fields}
                              initialValues={{ name: item.name }}
                              onSubmit={OnSubmit}
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
                                      onClickAsync={onClick}
                                      loading={loading || authLoading}
                                      disabled={authLoading}
                                  >Update</FlashButton>
                              )}
                          />
                      </>

                  }
                  footer={
                      <div className="footer-row">
                          <button className="btn" onClick={() => setActiveTab("plant")}> {"🢐 Back"} </button>
                      </div>
                  }
            />
        );
    }

    function DeletePlant({ variant, plant, onCancel }) {
        const nav = useNavigate();

        const handleDelete = async () => {
            try{
                if (!window.confirm("Are you sure you want to delete your plant? This cannot be undone.")) return;
                await remove_plant(plant.id);
                nav("/plant");
            } catch (err) {}

        };

        return (
            <Card variant={variant} title="Delete Account">
                <p className="txt">This action is permanent. All your plants and data may be removed.</p>
                <div className="btn-row">
                    <button className="btn ghost" onClick={onCancel}>Cancel</button>
                    <FlashButton onClickAsync={handleDelete}>Delete</FlashButton>
                </div>
            </Card>
        );
    }

    const front = ({ flip }) => (
        <>
            <PlnatInfo flip={() => { if (!flipped) flip(); }} />
        </>
    );

    const back = ({ unflip }) => (
        activeTab === "add_plant" ? ( <AddPlant variant={variant} user={item} />) :
        activeTab === "update_plant" ? ( <UpdatePlant variant={variant} user={item} />) :
            activeTab === "delete_plant" ? ( <DeletePlant variant={variant} onCancel={() => setActiveTab("plant")}/> ) :
                (
                    <Card
                        variant={variant}
                        header="Account Actions"
                        body={
                            <div className="btn-grid">

                                <button className="footer-btn" onClick={() => setActiveTab("add_plant")} >
                                    Add Plant
                                </button>

                                <button className="footer-btn" onClick={() => setActiveTab("update_plant")} >
                                    Update Plant
                                </button>

                                <button className="footer-btn" onClick={() => setActiveTab("delete_plant")} >
                                    Delete
                                </button>
                            </div>
                        }
                        footer={
                            <button
                                className="btn"
                                onClick={() => {
                                    setActiveTab("plant");
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


