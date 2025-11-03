/* ===== usePlants.js ===== */

import { plants } from "../services/plants";
import {useEffect, useState, useCallback } from "react";
import { useRequestStatus } from "./RequestStatus";


export function usePlants() {
    const status = useRequestStatus();
    const [plant, setPlant] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState(null);

    const fetchPlants = useCallback(async () => {
        await status.run(async () => {
            const rows = await plants.myPlants();
            setPlant(rows);
            return rows;
        });

    }, []);

    useEffect(() => { fetchPlants(); }, [fetchPlants]);

    const add_plant = async (payload)  => status.run(async () => { await plants.add(payload); await fetchPlants(); });
    const update_plant = async (id, p)   => status.run(async () => { await plants.edit(id, p); await fetchPlants(); });
    const remove_plant = async (id)    => status.run(async () => { await plants.delete(id); await fetchPlants(); });

    return{
        plantList: plant, setPlantList: setPlant,selectedPlant,setSelectedPlant,
        add_plant, update_plant, remove_plant,
        refetch: fetchPlants, err: status.err, error: status.error, loading: status.loading,
    };
}