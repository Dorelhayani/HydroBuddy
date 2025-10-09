// plants.js

import {http} from "./http";

export const plants = {
    // getOptions: () => http("/PlantRout/list", { method: "GET" }),
    myPlants: () => http("/PlantRout/plantList", { method: "GET" }),
    add: (payload) => http("/PlantRout/add", { method: "POST", body: payload }),
    edit: (plantTypeId,payload) => http(`/PlantRout/update/${plantTypeId}`, { method: "PATCH", body: {plantTypeId,...payload} }),
    delete: (plantTypeId,payload) => http(`/PlantRout/delete/${plantTypeId}`, { method: "DELETE", body: {plantTypeId} }),
};