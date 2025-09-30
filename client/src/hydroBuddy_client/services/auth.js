import {http} from "./http";

export const auth = {
    me: () => http("/auth/me", { method: "GET" }),
    register: (user) => http("/auth/register", { method: "POST", body: user }),
    change_password:(user)=> http("/auth/change_password", { method: "PATCH", body: user }),
    login: (user) => http("/auth/login", { method: "POST", body: user }),
    logout: () => http("/auth/logout", { method: "POST" }),
};
