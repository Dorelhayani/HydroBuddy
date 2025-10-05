import {http} from "./http";

export const account = {
    async getOptions() {
        const list = await this.accountInfo();
        return list.map(p => ({ id: p.id, name: p.name, email: p.email,
            password: p.password, type: p.type, created_at: p.created_at }));
    },

    accountInfo:() => http("/account/user_info", { method: "GET" }),
    // list: () => http("/account/users_list", { method: "GET" }),
    update: (id, payload) => http(`/users/update/${id}`, { method: "PATCH", body:payload }),
    delete: (id,payload) => http(`/users/delete/${id}`, {method: "DELETE", body: payload }),
}


