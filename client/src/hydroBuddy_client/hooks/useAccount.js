import { useEffect, useState, useCallback } from "react";
import { account } from "../services/account";

export function useAccount() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const fetchAll = useCallback(async () => {
        try { setLoading(true); setItems(await account.list()); setError(null); }
        catch (e) { setError(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const update  = async (id,p)=> { await account.update(id,p); await fetchAll(); };
    const remove= async (id)=> { await account.delete(id); await fetchAll(); };

    return { items, setItems, loading, error, update, remove, refetch: fetchAll };
}