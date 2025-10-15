// Plants.js

import React, { useEffect, useState } from "react";
import {Outlet} from "react-router-dom";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";

import {useEsp} from "../hooks/useEsp";
import {useAuth} from "../hooks/useAuth";
import {usePlants} from "../hooks/usePlants";
import { plantRenderer } from "../hooks/plantStatus";
import ClickableList from "../components/ClickableList";
import {formatDateDDMMYYYY} from "../domain/formatters";

export default function Plants() {
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("plant_info");
    const [pendingValue, setPendingValue] = useState(null);

    const {
        plantList:plant,
        setPlantList: setPlant,
        selectedPlant,setSelectedPlant, fetchPlants,
        add_plant, update_plant, remove_plant } = usePlants();

    const {loading: authLoading, err: authErr} = useAuth();
    const { state: currentState, loading: espLoading } = useEsp();
    const renderPlant = plantRenderer({ currentState, espLoading });

    const [flipped, setFlipped] = useState(false);

    // Plant Information card
    function PlnatInfo({flip, onItemClick}){
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
                header="Plant Info"
                body=" "
                list={
                <ClickableList
                    items={plant}
                    itemKey="ID"
                    onItemClick={(p) => {
                        setSelectedPlant(p);
                        onItemClick && onItemClick(p);
                        setActiveTab("update_plant");
                    }}
                    renderItem={(p) => (

                        <div
                            className={["list-card", pendingValue === p.value ? "is-pending" : ""].join(" ")}
                            aria-busy={pendingValue === p.value ? "true" : "false"}>

                            <div className="list-card__title">{p.planttype_name}</div>
                            {pendingValue === p.value && <div className="mod-card__spinner" />}
                        </div>
                    )}
                    emptyContent="No plants yet"
                    ariaLabel="Plants list"
                    className="plant-list"
                />
                }
                footer={
                    <div className="footer-row">
                            <small className="text-body-secondary">Add Plant</small>
                        <FlashButton className="btn ghost ml-auto"  onClickAsync={flip}>+</FlashButton>
                    </div>
                }
            />
        );
    }

    // Add Plant card
    function AddPlant({ variant, unflip }){
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
                        <FlashButton className="btn ghost ml-auto" onClick= {unflip}> {"🢐 Back"} </FlashButton>
                    </div>
                }
            />
        );
    }

    // Update Plant card
    function UpdatePlant({ variant }){
        if (!selectedPlant) {
            return (
                <Card variant={variant} title="Update Plant">
                    <div className="loading">Select a plant from the list…</div>
                    <div className="footer-row">
                        <FlashButton className="btn" onClick={() => setActiveTab("plant_info")}>
                            {"🢐 Back"}
                        </FlashButton>
                    </div>
                </Card>
            );
        }

        const fields = [ { name: "name", placeholder: selectedPlant.planttype_name  || "Plant", required: true } ];
        const OnSubmit = async (val) => {
            try{
                const nextName  = (val.name?.trim?.() || selectedPlant.planttype_name).trim();
                await update_plant(selectedPlant.PlantTypeID, { name: nextName });
                flashSuccess();
                setActiveTab('plant_info');
            }catch(err){
                flashDanger(2000);
                // error
            }
        };

        return (
            <Card variant={variant}
                  header="Edit Plant"
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
                              fields={fields}
                              initialValues={{ name: selectedPlant.planttype_name }}
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
                          <FlashButton className="btn" onClick={() => setActiveTab("plant_info")}> {"🢐 Back"} </FlashButton>
                          <FlashButton className="flash-btn" onClick={() => setActiveTab("delete_plant")} >
                              Delete Plant
                          </FlashButton>
                      </div>
                  }
            />
        );
    }

    // Delete Plant card
    function DeletePlant({ variant, onCancel }) {
        const handleDelete = async () => {
            try{
                if (!window.confirm(`Are you sure you want to delete ${selectedPlant.planttype_name} ? This cannot be undone.`)) return;
                await remove_plant(selectedPlant.PlantTypeID);
            } catch (err) {}

        };

        return (
            <Card variant={variant}>
                <small className="txt"> Are you sure you want to delete {selectedPlant.planttype_name}</small>
                <div className="btn-row">
                    <FlashButton className="btn ghost" onClick={onCancel}>Cancel</FlashButton>
                    <FlashButton onClickAsync={handleDelete}>Delete</FlashButton>
                </div>
            </Card>
        );
    }

    const front = ({flip})=> ( activeTab === "plant_info" && (<PlnatInfo flip={() => { if (!flipped) flip(); }}/>) );
    const back = ({unflip})=> ( <AddPlant variant={variant}  plnt={plant} unflip={() => { if (flipped) unflip(); }}/> );

    return (
        <div className="main-container">
            <div className="cards-grid">
                { activeTab === "update_plant" ? (<UpdatePlant variant={variant} />) :
                    activeTab === "delete_plant" ? (<DeletePlant variant={variant} onCancel={() => setActiveTab("update_plant")}/>):
                (
                <FlipCard
                    front={front}
                    back={back}
                    flippable
                    isFlipped={flipped}
                    onFlip={setFlipped}
                    autoHeight
                />
                )}
            </div>
            <Outlet />
        </div>
    );
}