import {http} from "./http";

export const auth = {
    me: () => http("/auth/me", { method: "GET" }),
    avatarUpload:(payload) => http("/auth/avatar", { method: "POST", body:payload }),
    register: (user) => http("/auth/register", { method: "POST", body: user }),
    change_password:(id,user)=> http(`/auth/change_password/${id}`, { method: "PATCH", body: user }),
    login: (user) => http("/auth/login", { method: "POST", body: user }),
    logout: () => http("/auth/logout", { method: "POST" }),
};
