import { plants } from "./plants";
import React, {useEffect, useState, useCallback, useMemo} from "react";
import { useRequestStatus } from "../hooks/RequestStatus";

export function usePlants() {
    const [plantList, setPlantList] = useState([]);
    const status = useRequestStatus();

    const fetchPlants = useCallback(async () => {
        await status.run(async () => {
            const rows = await plants.myPlants();
            setPlantList(rows);
            return rows;
        });

    }, []);

    const plantsListItems = useMemo(() => {
        if (!plantList || plantList.length === 0) return <li className="list-group-item">No plants yet</li>;
        return plantList.map((p) => (
            <li key={p.id} className="list-group-item">
                <h6>{p.planttype_name}</h6>
            </li>
        ));
    }, [plantList]);


    useEffect(() => { fetchPlants(); }, [fetchPlants]);
    const add_plant = async (payload)  => status.run(async () => { await plants.add(payload);   await fetchPlants(); });
    const update_plant = async (id, p)   => status.run(async () => { await plants.edit(id, p);    await fetchPlants(); });
    const remove_plant = async (id)    => status.run(async () => { await plants.delete(id);     await fetchPlants(); });

    return{
        plantList, setPlantList,plantsListItems,
        add_plant, update_plant, remove_plant,
        refetch: fetchPlants, err: status.err, error: status.error, loading: status.loading,
    };
}