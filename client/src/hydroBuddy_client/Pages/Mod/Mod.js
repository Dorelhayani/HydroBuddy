import {Link, Outlet} from "react-router-dom";
import React from "react";

export default function Mod() {


    return (
        <div className="mod-container">
            <div className="mod-sidebar">
                <h2>Mod Page</h2>

            </div>
            <div className="mod-content">
                <button><Link to='./temperature'>Temperature Mod</Link></button>
                <button><Link to='./moisture'>Moisture Mod</Link></button>
                <button><Link to='./saturday'>Saturday Mod</Link></button>
                <button><Link to='./manual'>Manual Mod</Link></button>
                <Outlet/>
            </div>
        </div>
    )
}