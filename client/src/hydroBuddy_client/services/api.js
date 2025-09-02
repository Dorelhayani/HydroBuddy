const JSON_HEADERS = { "Content-Type": "application/json" };
const TEMP_MODE = false;
const SOIL_MOISTURE_MODE = false;
const SATURDAY_MODE = false;
const MANUAL_MODE = false;


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


function wrapTempMode(data) {
    return TEMP_MODE ? { TEMP_MODE: data } : data;
}

function wrapMoistureMode(data) {
    return SOIL_MOISTURE_MODE ? { SOIL_MOISTURE_MODE: data } : data;
}

function wrapSATURDAYMODE(data) {
    return SATURDAY_MODE ? { SATURDAY_MODE: data } : data;
}

function wrapManualMode(data) {
    return MANUAL_MODE ? { MANUAL_MODE: data } : data;
}


export const Api = {
    esp:{ getSensors: () => http("/esp/sendJSON") },
    temp:{
        setTemp: (temp) =>
            http("/esp/temp", {
                method: "PATCH",
                headers: JSON_HEADERS,
                body: JSON.stringify(wrapTempMode(temp)),
            }),
        saveChanges: (tempMode)=> Api.temp.setTemp({ ...tempMode })
    },

    moisture:{
        setmoist: (moisture) =>
            http("/esp/moisture", {
                method: "PATCH",
                headers: JSON_HEADERS,
                body: JSON.stringify(wrapMoistureMode(moisture)),
            }),
        saveChanges: (moistureMode)=> Api.moisture.setmoist({ ...moistureMode })
    },

    saturday:{
        setSaturday: (saturday) =>
            http("/esp/Saturday", {
                method: "PATCH",
                headers: JSON_HEADERS,
                body: JSON.stringify(wrapSATURDAYMODE(saturday)),
            }),

        saveChanges: (saturdayMode)=> Api.saturday.setSaturday({ ...saturdayMode })
    },

    manual:{
        setmanual: (manual) =>
            http("/esp/manual", {
                method: "PATCH",
                headers: JSON_HEADERS,
                body: JSON.stringify(wrapManualMode(manual)),
            }),
        saveChanges: (manualMode)=> Api.manual.setmanual({ ...manualMode })
    },

    getSensors: () => http("/esp/sendJSON").then(toArray),


    // plants:{
    //     getPlants:  () => http("/PlantRout/list").then(toArray),
    //
    //     setPlantAdd: (plant) =>
    //         http("/PlantRout/add", {
    //             method: "POST",
    //             headers: JSON_HEADERS,
    //             body: JSON.stringify(plant),
    //         }),
    //
    //     setPlantEdit: (plant) =>
    //         http("/PlantRout/update", {
    //             method: "PATCH",
    //             headers: JSON_HEADERS,
    //             body: JSON.stringify(plant),
    //         }),
    //
    //     setPlantDelete: (plant) =>
    //         http("/PlantRout/delete", {
    //             method: "DELETE",
    //             headers: JSON_HEADERS,
    //             body: JSON.stringify(plant),
    //         }),
    //
    //     async getPlantOptions() {
    //         const list = await this.getPlants();
    //         return list.map(p => ({ id: p.ID, name: p.name }));
    //     },
    // },

    getDataMode: () => http("/esp/dataMode").then(toArray),

    getPlants:  () => http("/PlantRout/list").then(toArray),

    setPlantAdd: (plant) =>
        http("/PlantRout/add", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setPlantEdit: (plant) =>
        http("/PlantRout/update", {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    setPlantDelete: (plant) =>
        http("/PlantRout/delete", {
            method: "DELETE",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    async getPlantOptions() {
        const list = await this.getPlants();
        return list.map(p => ({ id: p.ID, name: p.name }));
    },


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
