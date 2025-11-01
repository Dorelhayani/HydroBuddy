/* ===== Plants.js ===== */

import React, { useState } from "react";
import {Outlet} from "react-router-dom";
import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";
import FlipCard from "../components/FlipCard";
import GenericForm from "../components/FormGenerate";
import RequestBanner from "../components/RequestBanner";

import {useT} from "../../local/useT";
import {useAuth} from "../hooks/useAuth";
import {usePlants} from "../hooks/usePlants";
import PumpStatus from "../hooks/plantStatus";
import Icon, {iconName} from "../components/Icons";
import ClickableList from "../components/ClickableList";

export default function Plants({ embed = false }) {
    const {t} = useT();
    const [flipped, setFlipped] = useState(false);
    const { variant, flashSuccess, flashDanger } = useBorderFlash();
    const [activeTab, setActiveTab] = useState("plant_info");

    const {
        plantList:plant,
        setPlantList: setPlant,
        selectedPlant,setSelectedPlant, fetchPlants,
        add_plant, update_plant, remove_plant } = usePlants();

    const {loading: authLoading, err: authErr} = useAuth();

    // Plant Information card
    function PlantInfo({flip, onItemClick}){

        return (
            // <Card className= "card-body scroll-area"
            <Card
                variant={variant}
                header={
                        <div className="mx-auto-flex" >
                            <small className="text-lg fw-600 mb-8 stack-8">{t("plants.plants_info_title")}</small>
                        </div>
                }
                body={
                         <ClickableList
                            items={plant}
                            itemKey="ID"
                            className="text-muted"
                            onItemClick={(p) => {
                                setSelectedPlant(p);
                                onItemClick && onItemClick(p);
                                setActiveTab("update_plant");
                            }}
                            renderItem={(p) => (
                                <div className="tile tile--sm" onClick={() => setActiveTab("update_plant")}>
                                    <div className="tile__avatar">
                                        <Icon
                                            name={iconName({name: p.planttype_name, kind: "plant"})}
                                            size={24}
                                            fill={1}
                                            weight={600}
                                            className="icon"
                                        />
                                    </div>

                                    <div className="tile tile--free">
                                        <div className="tile__title text-muted-500">{p.planttype_name}</div>
                                        <div className="text-muted-500">
                                            <span className="state-status"><PumpStatus/></span>
                                        </div>
                                    </div>
                                    <i className="tile__chev fa-solid fa-caret-right fa-beat-fade"></i>
                                </div>
                            )}
                            emptyContent="No plants yet"
                            ariaLabel="Plants list"
                         />
            }
                footer={
                    <div className="tooltip">
                        <FlashButton
                            className="btn--right btn--sm btn--transparent"
                            onClickAsync={flip}>
                            <span className="tooltiptext fw-600 text-xs">{t("plants.add_title")}</span>
                            <i className="fa-solid fa-plus fa-bounce fa-lg"></i>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    function AddPlant({ variant, unflip }){
        const fields = [
            { name: "name", label:`${t("plants.add_label")}` ,placeholder: `${t("plants.add_placeholder")}`, required: true },
        ];

        const OnSubmit = async (val) => {
            try {
                await add_plant({ name: val.name.trim() });
                fetchPlants().then(setPlant);
                flashSuccess(1400);
            } catch (err) {
                flashDanger(2000);
                throw new Error(err.message || "Plant Add failed");
            }
        };
        return (
            <Card
                variant={variant}
                header={t("plants.add_title")}
                body={
                    <>
                        <RequestBanner loading={authLoading} errorText={authErr} />
                        <GenericForm
                            className="form-row--inline max-w-320 stack-24"
                            labelClassNameAll="label-muted"
                            placeholderClassAll="ph-muted ph-sm"
                            rowClassNameAll="text-sm fw-600"
                            fields={fields}
                            onSubmit={OnSubmit}
                            customButton={({ onClick, loading }) => (
                                <FlashButton
                                    className="btn btn__icon"
                                    onClickAsync={onClick}
                                    loading={loading || authLoading}
                                    disabled={authLoading}
                                ><span className="text-subtle">+</span></FlashButton>
                            )}
                        />
                    </>

                }
                footer={
                    <div className="">
                        <FlashButton className="btn--left btn--transparent btn--sm" onClick= {unflip}>
                            <i className="fa-solid fa-arrow-left fa-fade fa-lg"></i>
                        </FlashButton>
                    </div>
                }
            />
        );
    }

    function UpdatePlant({ variant }){
        if (!selectedPlant) {
            return (
                <Card
                    variant={variant}
                    title={t("plants.update_title")}
                >
                    <div className="loading">Select a plant from the list…</div>
                    <div className="footer-row">
                        <FlashButton
                            className="btn btn--outline btn--sm shadow-sm"
                            onClick={() => setActiveTab("plant_info")}>
                            Back
                        </FlashButton>
                    </div>
                </Card>
            );
        }

        const fields = [ { name: "name", label: `${t("plants.update_label")}`, disabled: true } ];
        const OnSubmit = async (val) => {
            try{
                const nextName  = (val.name?.trim?.() || selectedPlant.planttype_name).trim();
                await update_plant(selectedPlant.PlantTypeID, { name: nextName });
                flashSuccess();
                setActiveTab('plant_info');
            }catch(err){ flashDanger(2000); }
        };

        return (
            <Card variant={variant}
                  header={t("plants.update_title")}
                  body={
                      <>
                          <RequestBanner loading={authLoading} errorText={authErr} />
                          <GenericForm
                              className="form--inline form--roomy stack-16"
                              labelClassNameAll="label-muted"
                              placeholderClassAll="ph-muted ph-lg"
                              rowClassNameAll="text-sm fw-600"
                              fields={fields}
                              initialValues={{ name: selectedPlant.planttype_name }}
                              onSubmit={OnSubmit}
                              customButton={({ onClick, loading }) => (
                                  <FlashButton
                                      className="btn btn--primary btn--block shadow-md"
                                      onClickAsync={onClick}
                                      loading={loading || authLoading}
                                      disabled={authLoading}
                                  >{t("plants.update_btn")}</FlashButton>
                              )}
                          />


                      </>

                  }
                  footer={
                    <div className="">
                        <FlashButton
                            className="btn--transparent btn--sm"
                            onClick={() => setActiveTab("plant_info")}>
                            <i className="fa-solid fa-arrow-left fa-fade fa-lg"></i>
                        </FlashButton>


                        <FlashButton
                            className="btn btn--danger btn--sm nudge-r-230 shadow-sm"
                            onClick={() => setActiveTab("delete_plant")}
                        > {t("plants.delete_plant")} </FlashButton>
                    </div>
            }
            />
        );
    }

    function DeletePlant({ variant, onCancel }) {

        const OnSubmit = async () => {
            try{
                if (!window.confirm(`Are you sure you want to delete ${selectedPlant.planttype_name} ? This cannot be undone.`)) return;
                await remove_plant(selectedPlant.PlantTypeID);
            } catch (err) {}
        };

        return (
            <Card variant={variant}>
                <small className="txt u-center fw-600"> Are you sure you want to delete {selectedPlant.planttype_name}</small>
                <div className="btn-row">
                    <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>
                        {t("common.cancel")}</FlashButton>

                    <FlashButton className="btn btn--danger nudge-r-120 btn--sm" onClickAsync={OnSubmit}>
                        {t("plants.delete_plant_btn")}</FlashButton>
                </div>
            </Card>
        );
    }

    const front = ({flip})=> ( activeTab === "plant_info" && (<PlantInfo flip={() => { if (!flipped) flip(); }}/>) );
    const back = ({unflip})=> ( <AddPlant variant={variant}  plnt={plant} unflip={() => { if (flipped) unflip(); }}/> );
    const content = (
        <div className="cards-grid">
            {activeTab === "update_plant" ? (
                    <UpdatePlant variant={variant} />
            ) : activeTab === "delete_plant" ? (
                    <DeletePlant variant={variant} onCancel={() => setActiveTab("update_plant")} />
            ) : (
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
    );
    return embed ? content : (
            <div className="main-container">
                  {content}
                  <Outlet />
                </div>
          );

}