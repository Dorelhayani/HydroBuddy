import React, { useState, Suspense } from "react";
import { Link, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import {AuthProvide} from "../context/AuthProvider";
import { ModDataProvider } from "../hooks/ModLoad";

import Home from "../Pages/Home";
import Login from "../Pages/Login";
// import Plants, { AddPlant, EditPlant, DeletePlant } from "../Pages/Plants";
import Plants from "../Pages/Plants";
import Account from "../Pages/Account";
import Mod, { TemperatureMode, MoistureMode, SaturdayMode, Manual } from "../Pages/Mod";
function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-root layout-wrapper">
            <header className="site-header">
                <div className="header-inner">
                    {/* <<< actions moved to left */}
                    <div className="header-actions">
                        <button className="btn ghost sidebar-toggle" onClick={() => setSidebarCollapsed(s => !s)}
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            {sidebarCollapsed ? "▸" : "▾"}
                        </button>
                    </div>

                    <Link className="brand" to="/home">⌂</Link>
                    <div className="brand" >HydroBuddy</div>
                </div>
            </header>

            <div className="body-area">
                <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                    <div className="sidebar-inner">
                        <div className="sidebar-section">
                            <div className="card">
                                <div className="card-title">Menu</div>
                                <div className="card-body">
                                    <nav className="side-nav">
                                        <Link to="/plants">My Plants</Link>
                                        <Link to="/mod">Modes</Link>
                                        <Link to="/Account">Account</Link>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <div className="card">
                                <div className="card-title">Quick Actions</div>
                                <div className="card-body">
                                    <button className="btn">Add plant</button>
                                    <button className="btn ghost" style={{ marginLeft: 8 }}>Settings</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
                    <div className="main-container">
                        <Suspense fallback={<div className="loading">Loading…</div>}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>

            <footer className="site-footer">
                <div className="footer-inner">
                    <div>© {new Date().getFullYear()} HydroBuddy</div>
                    <div className="muted">Built with ❤️ — responsive & modular</div>
                </div>
            </footer>
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Login /> },
            // { path: "home", element: <Home /> },
            { path: "home", element:(<ModDataProvider><Home /></ModDataProvider>)},
            {
                path: "mod",
                element: (
                    <ModDataProvider>
                        <Mod />
                    </ModDataProvider>
                ),
                children: [
                    { path: "temperature", element: <TemperatureMode /> },
                    { path: "moisture", element: <MoistureMode /> },
                    { path: "saturday", element: <SaturdayMode /> },
                    { path: "manual", element: <Manual /> },
                ],
            },
            {
                path: "plants",
                element: <Plants />,
                // children: [
                //     { path: "add", element: <AddPlant /> },
                //     { path: "edit", element: <EditPlant /> },
                //     { path: "delete", element: <DeletePlant /> },
                // ],
            },
            {
                path: "Account",
                element: <Account />,
            },
        ],
    },
]);

export default function AppShell() {
    return (
        <AuthProvide>
            <RouterProvider router={router} />
        </AuthProvide>
    );
}
