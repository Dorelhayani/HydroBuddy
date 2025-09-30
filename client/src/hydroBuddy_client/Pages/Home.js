import {Link, Outlet} from "react-router-dom";
import React from "react";

export default function Home(){

    return (
        <div className="main-container">
            <div className="title">Home Page</div>

            <div className="homepage-sidebar"></div>
            <div className="navbar">
                <div className="link-container">
                    <Link to="/Account/register"><i className="fa fa-fw fa-user"></i>Register New Member</Link>
                    <Link className="link" to='/mod'>Change Mod</Link>
                    <Link className="link" to='/plants'>Plants Page</Link>
                </div>
                <Outlet/>
            </div>
        </div>
    );
}