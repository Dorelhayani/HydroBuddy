// register.js

import http from "./http";
export const reg = { register: (user) => http("/register/reg", { method: "POST", body: user }) }

