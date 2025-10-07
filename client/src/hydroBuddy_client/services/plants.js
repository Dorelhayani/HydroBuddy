import {http} from "./http";

export const plants = {
    // getOptions: () => http("/PlantRout/list", { method: "GET" }),
    myPlants: () => http("/PlantRout/plantList", { method: "GET" }),
    add: (payload) => http("/PlantRout/add", { method: "POST", body: payload }),
    edit: (id,payload) => http(`/PlantRout/update/${id}`, { method: "PATCH", body: payload }),
    delete: (id,payload) => http(`/PlantRout/delete/${id}`, { method: "DELETE", body: payload }),
};