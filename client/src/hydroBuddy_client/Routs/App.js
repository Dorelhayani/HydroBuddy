// // App.js
//
// import React, { useState, Suspense } from "react";
// import { Link, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
//
// import { useAuth } from "../hooks/useAuth";
// import {AuthProvide} from "../context/AuthProvider";
//
// import Mod from "../Pages/Mod";
// import Home from "../Pages/Home";
// import Login from "../Pages/Login";
// import Plants from "../Pages/Plants";
// import Account from "../Pages/Account";
//
// import FlashButton from "../components/ButtonGenerate";
//
//
// function Layout() {
//     const { onLogout } = useAuth();
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//
//
//     return (
//         <div className="app-root layout-wrapper">
//             <header className="site-header">
//                 <div className="header-inner">
//                     {/* <<< actions moved to left */}
//                     <div className="header-actions">
//                         <FlashButton className="btn ghost sidebar-toggle" onClick={() => setSidebarCollapsed(s => !s)}
//                                 title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
//                             {sidebarCollapsed ? "▸" : "▾"}
//                         </FlashButton>
//                     </div>
//                     <Link className="brand" to="/home">⌂</Link>
//                     <div className="brand" >HydroBuddy</div>
//                 </div>
//             </header>
//
//             <div className="body-area">
//                 <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
//                     <div className="sidebar-inner">
//                         <div className="sidebar-section">
//                             <div className="card">
//                                 <div className="card-title">Menu</div>
//                                 <div className="card-body">
//                                     <nav className="side-nav">
//                                         <Account/>
//                                         <Link to="/plants">My Plants</Link>
//                                         <Link to="/mod">Modes</Link>
//                                         <Link to="/Account">Account</Link>
//                                     </nav>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="sidebar-section">
//                             <div className="card">
//                                 <div className="card-title">Quick Actions</div>
//                                 <div className="card-body">
//                                     <FlashButton className="flash-btn" onClick={onLogout} > Log Out </FlashButton>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </aside>
//
//                 <main className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
//                     <div className="main-container">
//                         <Suspense fallback={<div className="loading">Loading…</div>}>
//                             <Outlet />
//                         </Suspense>
//                     </div>
//                 </main>
//             </div>
//
//             <footer className="site-footer">
//                 <div className="footer-inner">
//                     <div>© {new Date().getFullYear()} HydroBuddy</div>
//                     <div className="muted">Built with ❤️ — responsive & modular</div>
//                 </div>
//             </footer>
//         </div>
//     );
// }
//
// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <Layout />,
//         children: [
//             { index: true, element: <Login /> },
//             { path: "home", element: <Home /> },
//             { path: "mod", element: <Mod/>},
//             { path: "plants",  element: <Plants /> },
//             { path: "Account", element: <Account /> },
//         ],
//     },
// ]);
//
// export default function AppShell() {
//     return (
//         <AuthProvide>
//             <RouterProvider router={router} />
//         </AuthProvide>
//     );
// }
















// App.js

import React, { useState, Suspense } from "react";
import {Link, Outlet, createBrowserRouter, RouterProvider, useNavigate} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import {AuthProvide} from "../context/AuthProvider";

import Dashboard from "../Pages/Dashboard";
import Login from "../Pages/Login";
import Account from "../Pages/Account";

import FlashButton from "../components/ButtonGenerate";
import Card, {useBorderFlash} from "../components/Card";


function Layout() {
    const nav = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const { variant, flashWarning } = useBorderFlash();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


    function Log_out({ variant, onCancel }) {
        const handleLogOut = async () => {
            try{
                if (!window.confirm()) return;
                flashWarning();
                setTimeout(() => nav("/"), 300);
                await logout();
            } catch (err) {}

        };

        return (
            <Card
                variant={variant}
                header="Log Out"
                body={
                <>
                    <p className="txt__delete">Are you sure you want to Log Out ?</p>
                    <div className="btn-row">
                        <FlashButton className="btn btn--outline btn--sm"  onClick={onCancel}>Cancel</FlashButton>
                        <FlashButton className="btn btn--primary btn--block" onClickAsync={handleLogOut}>Log Out</FlashButton>
                    </div>
                </>
            }
                />
        );
    }

    return (
        <div className="app-root layout-wrapper">
            <header className="site-header">
                <div className="header-inner">
                    {/* <<< actions moved to left */}
                    <div className="header-actions">
                        <FlashButton className="btn ghost sidebar-toggle" onClick={() => setSidebarCollapsed(s => !s)}
                                     title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            {sidebarCollapsed ? "▸" : "▾"}
                        </FlashButton>
                    </div>
                    <Link className="brand" to="/dashboard">⌂</Link>
                    <div className="brand" >HydroBuddy</div>

                    { activeTab === "log_out" && <Log_out variant={variant} onCancel={() => setActiveTab("dashboard")}/> }
                    <FlashButton className="btn btn--ghost" onClick={() => setActiveTab("log_out")} >Log Out</FlashButton>
                </div>
            </header>

            <div className="body-area">
                <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                    <nav className="side-nav"> <Account/> </nav>
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
            { path: "dashboard", element: <Dashboard /> },
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























