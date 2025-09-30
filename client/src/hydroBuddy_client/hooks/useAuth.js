import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    async function refresh() {
        try {
            const me = await auth.me();
            setUser(me);
        } catch (e) {
            setUser(null);
        }
    }

    useEffect(() => { refresh(); }, []);
    return <AuthContext.Provider value={{ user, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);