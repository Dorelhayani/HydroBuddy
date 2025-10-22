// App.js

import React, { useState, Suspense } from "react";
import { Outlet, createBrowserRouter, RouterProvider, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "../context/AuthProvider";

import Dashboard from "../Pages/Dashboard";
import Login from "../Pages/Login";
import Account from "../Pages/Account";

import FlashButton from "../components/ButtonGenerate";
import Card, { useBorderFlash } from "../components/Card";

function Layout() {
    const nav = useNavigate();
    const location = useLocation();
    const {logout} = useAuth();

    const isLoginPage = location.pathname === "/";

    const [activeTab, setActiveTab] = useState("dashboard");
    const {variant, flashWarning} = useBorderFlash();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    function Log_out({ variant, onCancel }) {
        const handleLogOut = async () => {
            try {
                if (!window.confirm()) return;
                flashWarning();
                setTimeout(() => nav("/"), 300);
                await logout();
            } catch (err) {}
        };

        return (
            <Card
                className="cards-grid"
                variant={variant}
                header="Log Out"
                body={
                    <>
                        <p className="txt__delete">Are you sure you want to Log Out ?</p>
                        <div className="btn-row">
                            <FlashButton className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</FlashButton>
                            <FlashButton className="btn btn--primary  btn--sm" onClickAsync={handleLogOut}>Log Out</FlashButton>
                        </div>
                    </>
                }
            />
        );
    }

    // {activeTab === "log_out" && (
    //     <Log_out variant={variant} onCancel={() => setActiveTab("dashboard")} />
    // )}

    return (
        <div className="app-root layout-wrapper">
            <header className="site-header">
                <div className="header-inner">
                    {!isLoginPage && (
                        <div className="header-actions">
                            <FlashButton
                                className="btn--transparent btn--sm"
                                onClick={() => setSidebarCollapsed((s) => !s)}
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} >
                                {sidebarCollapsed ? <span className="btn--transparent">&#709;</span> :
                                    <span className="btn--transparent">&#708;</span>}
                            </FlashButton>
                        </div>
                    )}

                    <div className="logo">&#129716;</div>
                    <div className="brand">HydroBuddy</div>

                    {!isLoginPage && (
                        <>
                            {activeTab === "log_out" && (
                                <Log_out variant={variant} onCancel={() => setActiveTab("dashboard")} />
                            )}
                            <FlashButton className="btn btn--sm btn--ghost" onClick={() => setActiveTab("log_out")}>
                                Log Out
                            </FlashButton>
                        </>
                    )}
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
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
