// import "../style/Home.css"
import {Link, Outlet} from "react-router-dom";
import React from "react";

export default function HomePage(){
    return (
        <div className="main-container">
            <div className="title">Home Page</div>

            {/*<div className="homepage-sidebar"></div>*/}
            <div className="grid">
                <div className="link-container">
                    <Link className="link" to='/mod'>Change Mod</Link>
                    <Link className="link" to='/plants'>Plants Page</Link>
                    <Link className="link" to='/users'>Users Page</Link>
                </div>
                <Outlet/>
            </div>
        </div>
    );
}