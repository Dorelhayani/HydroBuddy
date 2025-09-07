const JSON_HEADERS = { "Content-Type": "application/json" };
// let routArr = ["list", "add", "update", "delete"];

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

    getDataMode: () => http("/esp/dataMode").then(toArray),

    esp:{ getSensors: () => http("/esp/sendJSON") },
    temp:{
        setTemp: ({ temp, tempLVL, minTime, maxTime, light, lightThresHold, minLight, maxLight}) =>
            http("/esp/temp", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: new URLSearchParams({
                    temp,
                    tempLVL,
                    minTime,
                    maxTime,
                    light,
                    lightThresHold,
                    minLight,
                    maxLight,
                }),
            }),
    },

    moisture:{
        setMoist: ({ moisture, minMoisture, maxMoisture,moistureLVL }) =>
            http("/esp/moisture", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: new URLSearchParams({
                    moisture,
                    minMoisture,
                    maxMoisture,
                    moistureLVL,
                }),
            }),
    },

    saturday: {
        setSaturday: ({ dateAct, timeAct, duration }) =>
            http("/esp/Saturday", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: new URLSearchParams({
                    dateAct,
                    timeAct,
                    duration: String(duration),
                }),
            }),
    },

    manual:{
        setEnabled: (enabled) =>
            http("/esp/manual", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: new URLSearchParams({ enabled: String(enabled) }),
            }),
    },

    plants:{
        async getOptions() {
            const list = await this.list();
            return list.map(p => ({ id: p.ID, name: p.name }));
        },

        // list:  () => http("/PlantRout/list").then(toArray),
        list:  () => http("/PlantRout/list"),

        add: (plant) =>
            http("/PlantRout/add", {
                method: "POST",
                headers: JSON_HEADERS,
                body: JSON.stringify(plant),
            }),

        edit: (plant) =>
            http("/PlantRout/update", {
                method: "PATCH",
                headers: JSON_HEADERS,
                body: JSON.stringify(plant),
            }),

        delete: (plant) =>
            http("/PlantRout/delete", {
                method: "DELETE",
                headers: JSON_HEADERS,
                body: JSON.stringify(plant),
            }),
    },

    users:{
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
    }
};
