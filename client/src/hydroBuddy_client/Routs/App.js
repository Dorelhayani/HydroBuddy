// import { Link, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
// import Home from "../Pages/Home";
// import Login from "../Pages/Login"; // הובאה פשוטה וברורה
// import Plants, { AddPlant, EditPlant, DeletePlant } from "../components/Plants";
// import UsersPage, { Register } from "../components/UsersPage";
// import Mod, { TemperatureMode, MoistureMode, SaturdayMode, Manual } from "../components/Mod";
// import { ModDataProvider } from "../hooks/ModLoad";
// import React from "react";
// import {AuthProvider} from "../hooks/useAuth";
//
// export default function AppShell() {
//     const rtr = createBrowserRouter([
//         {
//             path: "/",
//             element: (
//                 <>
//                     <header className="main-container">
//                         <div className="navbar">
//                             <Link to="/Account"><i className="fa fa-fw fa-search"></i> Account</Link>
//                             <Link to="/home"><i className="fa fa-fw fa-envelope"></i> Home </Link>
//                             <Link to="/home"><i className="fa fa-fw fa-envelope"></i> Contact</Link>
//                             <Link to="users/"><i className="fa fa-fw fa-user"></i>Log out</Link>
//                         </div>
//                     </header>
//                     <Outlet />
//                 </>
//             ),
//             children: [
//                 { index: true, element: <Login /> },
//                 { path: "home", element: <Home /> },
//                 {
//                     path: "mod",
//                     element: (
//                         <ModDataProvider>
//                             <Mod />
//                         </ModDataProvider>
//                     ),
//                     children: [
//                         { path: "temperature", element: <TemperatureMode /> },
//                         { path: "moisture", element: <MoistureMode /> },
//                         { path: "saturday", element: <SaturdayMode /> },
//                         { path: "manual", element: <Manual /> },
//                     ],
//                 },
//                 {
//                     path: "plants",
//                     element: <Plants />,
//                     children: [
//                         { path: "add", element: <AddPlant /> },
//                         { path: "edit", element: <EditPlant /> },
//                         { path: "delete", element: <DeletePlant /> },
//                     ],
//                 },
//                 {
//                     path: "Account",
//                     element: <UsersPage />,
//                     children: [
//                         { path: "register", element: <Register /> },
//                         // { path: "edit", element: <EditInfo /> },
//                         // { path: "delete", element: <DeleteAccount /> },
//                     ],
//                 },
//             ],
//         },
//     ]);
//
//     return <AuthProvider><RouterProvider router={rtr} /></AuthProvider>;
// }

import React, { useState, Suspense } from "react";
import { Link, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import { ModDataProvider } from "../hooks/ModLoad";

import Home from "../Pages/Home";
import Login from "../Pages/Login"; // הובאה פשוטה וברורה
import Plants, { AddPlant, EditPlant, DeletePlant } from "../components/Plants";
// import Account, {ChangePassword, Register} from "../components/Account";
import Account from "../components/Account";
import Mod, { TemperatureMode, MoistureMode, SaturdayMode, Manual } from "../components/Mod";

function Layout() {
    const [open, setOpen] = useState(false);
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

                        <button aria-label="menu" className="burger" onClick={() => setOpen(v => !v)}>☰</button>
                    </div>

                    {/*<div className="brand">HydroBuddy</div>*/}
                    <Link className="brand" to="/home">HydroBuddy</Link>
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
            { path: "home", element: <Home /> },
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
                children: [
                    { path: "add", element: <AddPlant /> },
                    { path: "edit", element: <EditPlant /> },
                    { path: "delete", element: <DeletePlant /> },
                ],
            },
            {
                path: "Account",
                element: <Account />,
                // children: [
                //     { path: "register", element: <Register /> },
                //     { path: "ChangePassword", element: <ChangePassword /> }
                // ],
            },
        ],
    },
]);

export default function AppShell() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
