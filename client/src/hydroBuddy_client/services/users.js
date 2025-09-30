// const JSON_HEADERS = { "Content-Type": "application/json" };
// export const users = {
//
//     async getOptions() {
//         const list = await this.list();
//         return list.map(p => ({ id: p.id, name: p.name, email: p.email,
//             password: p.password, type: p.type, created_at: p.created_at }));
//     },
//
//     list: () => http("/users/users_list"),
//     // list: () => http("/users/list"),
//
//     add: (user) =>
//         http("/users/add", {
//             method: "POST",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(user),
//         }),
//
//     edit: (user) =>
//         http("/users/update", {
//             method: "PATCH",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(user),
//         }),
//
//     delete: (user) =>
//         http("/users/delete", {
//             method: "DELETE",
//             headers: JSON_HEADERS,
//             body: JSON.stringify(user),
//         }),
// }

import {http} from "./http";
export const users = {

    async getOptions() {
        const list = await this.userInfo();
        return list.map(p => ({ id: p.id, name: p.name, email: p.email,
            password: p.password, type: p.type, created_at: p.created_at }));
    },

    userInfo:() => http("/users/user_info", { method: "GET" }),
    list: () => http("/users/users_list", { method: "GET" }),
    add: (payload) => http("/users/add", { method: "POST", body: payload }),
    edit: (payload) => http("/users/update", { method: "PATCH", body: payload }),
    delete: (payload) => http("/users/delete", {method: "DELETE", body: payload }),
}


