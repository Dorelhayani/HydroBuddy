import { useEffect, useState, useCallback } from "react";
import { users } from "../services/users";

export function useUsers() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const fetchAll = useCallback(async () => {
        try { setLoading(true); setItems(await users.list()); setError(null); }
        catch (e) { setError(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const edit  = async (id,p) => { await users.edit(id,p); await fetchAll(); };
    const remove= async (id)   => { await users.delete(id); await fetchAll(); };

    return { items, loading, error, refetch: fetchAll, edit, remove };
}