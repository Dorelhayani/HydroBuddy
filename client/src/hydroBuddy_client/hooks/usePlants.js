// usePlants.js

import { plants } from "../services/plants";
import React, {useEffect, useState, useCallback, useMemo} from "react";
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

    const plantsListItems = useMemo(() => {
        if (!plant || plant.length === 0) return <li className="list-group-item">No plants yet</li>;
        return plant.map((p) => (
            <li key={p.id} className="list-group-item" >
                <h6>{p.planttype_name}</h6>
            </li>
        ));
    }, [plant]);


    function ClickablePlantList(onItemClick, renderContent) {
        if (!plant || plant.length === 0) return <li className="list-group-item">No plants yet</li>;
        return (
                plant.map( p => (
                    <li
                        key={p.ID}
                        onClick={()=> {
                            setSelectedPlant(p);
                            onItemClick && onItemClick(p)
                        }}
                        className="list-group-item">
                        {renderContent ? renderContent(p) : <h6>{p.planttype_name}</h6>}
                    </li>
                ))
        );
    }

    useEffect(() => { fetchPlants(); }, [fetchPlants]);
    const add_plant = async (payload)  => status.run(async () => { await plants.add(payload);   await fetchPlants(); });
    const update_plant = async (id, p)   => status.run(async () => { await plants.edit(id, p);    await fetchPlants(); });
    const remove_plant = async (id)    => status.run(async () => { await plants.delete(id);     await fetchPlants(); });

    return{
        plantList: plant, setPlantList: setPlant,selectedPlant,setSelectedPlant, plantsListItems,ClickablePlantList,
        add_plant, update_plant, remove_plant,
        refetch: fetchPlants, err: status.err, error: status.error, loading: status.loading,
    };
}