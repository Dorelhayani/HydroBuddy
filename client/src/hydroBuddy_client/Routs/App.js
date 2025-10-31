/* ===== App.js ===== */

import React, { useState, Suspense } from "react";
import { Outlet, createBrowserRouter, RouterProvider, useLocation } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";

import Dashboard from "../Pages/Dashboard";
import Login from "../Pages/Login";
import Account from "../Pages/Account";
import FlashButton from "../components/ButtonGenerate";

function Layout() {
    const location = useLocation();

    const isLoginPage = location.pathname === "/";
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-root layout-wrapper">
            <header className="site-header">
                <div className="header-inner">
                    {!isLoginPage && (
                        <div className="header-actions">
                            <FlashButton
                                className="btn--transparent btn--sm"
                                onClick={() => setSidebarCollapsed((s) => !s)}
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                                { sidebarCollapsed ? <i className="fa-solid fa-left-long fa-beat fa-lg"/> :
                                    <i className="fa-solid fa-right-long fa-beat fa-lg"/> }
                            </FlashButton>
                        </div>
                    )}
                    <i className="fa-solid fa-seedling fa-bounce fa-2xl" style={{color: "#63E6BE"}}/>
                    <div className="brand">HydroBuddy</div>
                </div>
            </header>

            {isLoginPage ? (
                <main className="auth-center">
                        <Suspense fallback={<div className="loading">Loading…</div>}>
                            <Outlet />
                        </Suspense>
                </main>
            ) : (
                <div className="body-area">
                    <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                        <nav className="side-nav">
                            <Account />
                        </nav>
                    </aside>

                    <main className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
                        <div className="main-container">
                            <Suspense fallback={<div className="loading">Loading…</div>}>
                                <Outlet />
                            </Suspense>
                        </div>
                    </main>
                </div>
            )}

            <footer className="site-footer">
                <div className="footer-inner">
                    <div>© {new Date().getFullYear()} HydroBuddy</div>
                    {/*<div className="muted">Built with ❤️ — responsive & modular</div>*/}
                    <div className="muted">Built with
                        <i className="fa-solid fa-heart fa-beat" style={{color: "#ff8080"}}/>
                        — responsive & modular</div>
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
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
