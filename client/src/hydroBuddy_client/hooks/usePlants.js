import { useEffect, useState, useCallback } from "react";
import { plants } from "../services/plants";

export function usePlants() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const fetchList = useCallback(async () => {
        try { setLoading(true); setList(await plants.myPlants()); setError(null); }
        catch (e) { setError(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchList(); }, [fetchList]);

    const add = async (payload)=> { await plants.add(payload);   await fetchList(); };
    const edit = async (id,p)=> { await plants.edit(id,p);     await fetchList(); };
    const remove = async (id)=> { await plants.delete(id);     await fetchList(); };

    return { list, setList, loading, error, add, edit, remove , refetch: fetchList};
}