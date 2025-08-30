
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
    getDataMode: () => http("/esp/dataMode").then(toArray),
    getPlants:  () => http("/plants").then(toArray),
    getUsers:   () => http("/users").then(toArray),

    setPlantAdd: (plant) =>
        http("/PlantRout/add", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),


    // setTempConfig: (temp) =>
    //     http("/esp/temp-config", {
    //         method: "PATCH",
    //         headers: JSON_HEADERS,
    //         body: JSON.stringify({ temp }),
    //     }),
};
