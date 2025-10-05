import {http} from "./http";

export const users = {
    async getOptions() {
        const list = await this.userInfo();
        return list.map(p => ({ id: p.id, name: p.name, email: p.email,
            password: p.password, type: p.type, created_at: p.created_at }));
    },

    userInfo:() => http("/users/user_info", { method: "GET" }),
    list: () => http("/users/users_list", { method: "GET" }),
    edit: (id,payload) => http(`/users/update/${id}`, { method: "PATCH", body:payload }),
    delete: (id,payload) => http(`/users/delete/${id}`, {method: "DELETE", body: payload }),
}


