import {Link, Outlet} from "react-router-dom";
import React from "react";

export default function PlantPage() {


    return (
        <div className="Plant-container">
            <div className="plant-sidebar">
                <h2>Plant Page</h2>

            </div>
            <div className="Plant-content">
                <button><Link to='./add'>Add Plant</Link></button>
                <button><Link to='./edit'>Edit Plant</Link></button>
                <button> <Link to='./delete'>Delete Plant</Link></button>

                <Outlet/>
            </div>
        </div>
    )
}