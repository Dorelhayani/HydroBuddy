import {Link, Outlet} from "react-router-dom";
import React from "react";

export default function HomePage(){
    return (
        <div className="homepage-container">
            <div className="homepage-sidebar">
                <h2>Home Page</h2>

            </div>
            <div className="homepage-content">
                <button><Link to='/mod'>Change Mod</Link></button>
                <button><Link to='/plants'>Plants Page</Link></button>
                {/*<Link to='/mod_change'>Change sensors</Link>*/}
                <Outlet/>
            </div>
        </div>
    );
}