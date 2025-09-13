import {http} from "./http";
const JSON_HEADERS = { "Content-Type": "application/json" };

export const users = {

    async getOptions() {
        const list = await this.list();
        return list.map(p => ({ id: p.id, name: p.name, email: p.email,
            password: p.password, type: p.type, created_at: p.created_at }));
    },

    list: () => http("/users/users_list"),
    // list: () => http("/users/list"),

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
