import {http} from "./http";
// const JSON_HEADERS = { "Content-Type": "application/json" };

// export const plants = {
//
//     async getOptions() {
//         const list = await this.list();
//         return list.map(p => ({ id: p.ID, name: p.name }));
//     },
//
//     list: () => http("/PlantRout/list"),
//
//     add: (plant) =>
//         http("/PlantRout/add", {
//             method: "POST",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(plant),
//         }),
//
//     edit: (plant) =>
//         http("/PlantRout/update", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(plant),
//         }),
//
//     delete: (plant) =>
//         http("/PlantRout/delete", {
//             method: "DELETE",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(plant),
//         }),
// }


export const plants = {
    // getOptions: () => http("/PlantRout/list", { method: "GET" }),
    myPlants: () => http("/PlantRout/plantList", { method: "GET" }),
    add: (payload) => http("/PlantRout/add", { method: "POST", body: payload }),
    edit: (payload) => http("/PlantRout/update", { method: "PATCH", body: payload }),
    delete: (payload) => http("/PlantRout/delete", { method: "DELETE", body: payload }),
};