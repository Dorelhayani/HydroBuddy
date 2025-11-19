/* ===== App.js ===== */

import { Suspense,useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";

import {LocaleProvider } from "../../../local/LocaleProvider";
import Account from "../../features/account/pages/Account";
import Login from "../../features/auth/pages/Login";
import Dashboard from "../../features/dashboard/pages/Dashboard";
import FlashButton from "../../ui/ButtonGenerate";
import LanguageSwitcher from "../../ui/LanguageSwitcher";
import { AuthProvider } from "../providers/AuthProvider";
import AnalyticsPanel from '../../features/analytics/pages/Analytics';

function Layout() {
    const location = useLocation();
    const isLoginPage = location.pathname === "/";
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <LocaleProvider>
        <div className="app-root layout-wrapper">
            <header className="site-header">
                <div className="header-inner">
                    {!isLoginPage && (
                        <div className="header-actions">
                            <FlashButton
                                className="btn--transparent btn--sm"
                                onClick={() => setSidebarCollapsed((s) => !s)}
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                                { sidebarCollapsed ? <i className="fa-solid fa-bars fa-beat"/> :
                                    <i className="fa-solid fa-bars fa-beat fa-lg"/>}
                            </FlashButton>
                        </div>
                    )}
                    <i className="fa-solid fa-seedling fa-bounce fa-2xl" style={{color: "#63E6BE"}}/>
                    <div className="brand text-2xl">HydroBuddy</div>
                    <LanguageSwitcher compact/>
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
                    <div className="muted">Built with
                        <i className="fa-solid fa-heart fa-beat" style={{color: "#ff8080"}}/>— responsive & modular</div>
                </div>
            </footer>
        </div>
        </LocaleProvider>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Login /> },
            { path: "dashboard", element: <Dashboard /> },
            {path: "analytics", element: <AnalyticsPanel /> },
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
