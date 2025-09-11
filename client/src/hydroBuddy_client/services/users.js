import {http} from "./http";
const JSON_HEADERS = { "Content-Type": "application/json" };

export const users = {
    list:   () => http("/users/list"),

    add: (plant) =>
        http("/users/add", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    edit: (plant) =>
        http("/users/update", {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),

    delete: (plant) =>
        http("/users/delete", {
            method: "DELETE",
            headers: JSON_HEADERS,
            body: JSON.stringify(plant),
        }),
}
