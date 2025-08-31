const JSON_HEADERS = { "Content-Type": "application/json" };

async function http(path, options = {}) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

function toArray(x) {
    if (Array.isArray(x)) return x;
    if (x && typeof x === "object") {
        if (Array.isArray(x.state)) return x.state;
        return Object.values(x);
    }
    return [];
}


export const Api = {
    getSensors: () => http("/esp/sendJSON").then(toArray),

    // setTempConfig: (temp) =>
    //     http("/esp/temp-config", {
    //         method: "PATCH",
    //         headers: JSON_HEADERS,
    //         body: JSON.stringify({ temp }),
    //     }),

    getDataMode: () => http("/esp/dataMode").then(toArray),


    getPlants:  () => http("/PlantRout/list").then(toArray),

    async getPlantOptions() {
        const list = await this.getPlants();
        return list.map(p => ({ id: p.ID, name: p.name }));
    },


    setPlantAdd: (plant) =>
        http("/PlantRout/add", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setPlantDelete: (plant) =>
        http("/PlantRout/delete", {
            method: "DELETE",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setPlantEdit: (plant) =>
        http("/PlantRout/update", {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),




    getUsers:   () => http("/users/list").then(toArray),

    setUserAdd: (plant) =>
        http("/users/add", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setUserDelete: (plant) =>
        http("/users/delete", {
            method: "DELETE",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setUserEdit: (plant) =>
        http("/users/update", {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),


};
