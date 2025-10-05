import { useEffect, useState, useCallback } from "react";
import { auth } from "../services/auth";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const refresh = useCallback(async () => {
        try { setLoading(true); setUser(await auth.me()); setError(null); }
        catch (e) { setError(e); setUser(null); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const login = async (payload)   => { await auth.login(payload); await refresh(); };
    const register = async (payload)    => { await auth.register(payload);    /* לעיתים תרצה גם refresh */ };
    const logout = async ()       => { await auth.logout(); setUser(null); };
    const changePassword = async (id,payload) => { await auth.change_password(id,payload); };

    return { user, loading, error, refresh, login, register, logout, changePassword };
}
