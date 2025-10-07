import { useEffect, useState, useCallback } from "react";
import { auth } from "./auth";

export function useAuth() {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const fetchUser = useCallback(async () => {
        try { setLoading(true); setItem(await auth.me()); setError(null); }
        catch (e) { setError(e); setItem(null); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    const avatarUpload = async (formData) => { await auth.avatarUpload(formData); }
    const login = async (payload)=> { await auth.login(payload); await fetchUser(); };
    const register = async (payload)=> { await auth.register(payload);    /* לעיתים תרצה גם refresh */ };
    const logout = async ()=> { await auth.logout(); setItem(null); };

    const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
        if (!item?.id) throw new Error("Not authenticated");
        await auth.change_password(item.id, { currentPassword, newPassword, newPasswordConfirm });
        await fetchUser();
        // אם השרת מאפס סשן אחרי שינוי סיסמה:
        // await logout();
        // אחרת, אפשר: await fetchUser();
    };

    return { item, setItem, loading, error, refresh: fetchUser, avatarUpload, login, register, logout, changePassword };
}
