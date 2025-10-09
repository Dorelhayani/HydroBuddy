// Home.js

import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useModData } from "../hooks/ModLoad";
import { usePlants } from "../hooks/usePlants";
import { useAuth } from "../hooks/useAuth";
import Card, { useBorderFlash } from "../components/Card";

export default function Home(){
    const { variant } = useBorderFlash();
    const nav = useNavigate();

    const { plantsListItems, setPlant, fetchPlants } = usePlants();
    const { item, setItem, fetchUser } = useAuth();

    const go = (path) => () => nav(path);
    const onKeyGo = (path) => (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav(path); } };


    function DisplayMod(){
        const { state } = useModData();
        const labelMap = {61:"Temperature Mod", 62:"Moisture Mod", 63:"Saturday Mod", 64:"Manual Mod"};

        return (
                <div className="sub-title">
                    <small>Current Mod:{labelMap[state]}</small>
                </div>
        )
    }

        useEffect(() => {
            (async () => {
                try {
                    const [usr, plnts] = await Promise.all([fetchUser, fetchPlants]);
                    setItem(usr);
                    setPlant(plnts);
                } catch (e) {
                    console.error(e);
                }
            })();
        }, []);


    if (!item) return null;
    return (
        <div className="main-container">
            <div className="title">Home Page</div>

            <div className="cards-grid">

                <Card
                    className="home-card clickable"
                    variant={variant}
                    header="Modes"
                    list = {DisplayMod()}
                    onClick={go("/mod")}
                    tabIndex={0}
                    onKeyDown={onKeyGo("/mod")}
                    footer=" "
                />

                <Card
                    className="home-card clickable"
                    variant={variant}
                    header="Your Plants"
                    list ={plantsListItems}
                    onClick={go("/plants")}
                    tabIndex={0}
                    onKeyDown={onKeyGo("/plants")}
                    footer=" "
                />

                <Card
                    className="home-card clickable"
                    variant={variant}
                    header="Account"
                    title={item.name}
                    body=" "
                    onClick={go("/account")}
                    tabIndex={0}
                    onKeyDown={onKeyGo("/account")}
                    footer=" "
                />
            </div>

            <Outlet/>
        </div>
    );
}