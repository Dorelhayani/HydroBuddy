/* ===== AuthProvider.js ===== */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { auth } from "../../features/auth/services/auth";
import { useRequestStatus } from "../../shared/hooks/RequestStatus";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [item, setItem] = useState(null);
    const status = useRequestStatus();

    const didInit = useRef(false);
    const inflight = useRef(null);

    const fetchUser = async () => {
        if (inflight.current) return inflight.current;
        inflight.current = status.run(async () => {
            const usr = await auth.me();
            setItem(usr);
            return usr;
        });
        try { return await inflight.current; }
        finally { inflight.current = null; }
    };

    const login = async (payload) => {
        await status.run(() => auth.login(payload));
        return fetchUser();
    };

    const logout = async () => {
        await status.run(() => auth.logout());
        setItem(null);
    };

    const avatarUpload = async (formData) => {
        await status.run(() => auth.avatarUpload(formData));
        return fetchUser();
    };

    const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
        if (!item?.id) throw new Error("Not authenticated");
        await status.run(() => auth.change_password(item.id, { currentPassword, newPassword, newPasswordConfirm }));
    };


    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        fetchUser().catch(() => {});
    }, [fetchUser]);

    const value = useMemo(() => ({
        item, setItem,
        loading: status.loading,
        error: status.error,
        err: status.err,
        message: status.message,
        refresh: fetchUser,
        avatarUpload, login, logout, changePassword

    }), [item, status.loading, status.error, status.err, status.message]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}