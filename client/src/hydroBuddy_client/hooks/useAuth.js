// useAuth.js

import { auth } from "../services/auth";
import { useEffect, useState, useCallback } from "react";
import { useRequestStatus } from "./RequestStatus";

export function useAuth() {
    const [item, setItem] = useState(null);
    const status = useRequestStatus();


    const fetchUser = useCallback(async () => {
        try{
            await status.run(async () => {
                const usr = await auth.me();
                setItem(usr);
                return usr;
            });
        } catch (error) {}

    }, []);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    async function onLogout() {
        if (!window.confirm("Are you sure you want to Log Out?.")) return;
        await logout();

    }

    const avatarUpload = async (formData) => status.run(async () => { await auth.avatarUpload(formData); });
    const login = async (payload) => status.run(async () => { await auth.login(payload); await fetchUser(); });
    const register = async (payload) => status.run(async () => { await auth.register(payload); await fetchUser();});
    const logout = async () => status.run(async () => { await auth.logout(); setItem(null); });
    const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
        if (!item?.id) throw new Error("Not authenticated");
        await status.run(async () => {
            await auth.change_password(item.id, { currentPassword, newPassword, newPasswordConfirm });
            // await fetchUser(); // או logout() אם השרת מאפס session
            });
        }

    return {
        item, setItem,
        loading: status.loading,
        error: status.error,
        err: status.err,
        message: status.message,
        refresh: fetchUser,
        avatarUpload, login, register, logout,onLogout, changePassword
    };
}
