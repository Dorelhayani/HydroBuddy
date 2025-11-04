/* ===== register.js ===== */

import http from "../../../shared/services/http";
export const reg = { register: (user) => http("/register/reg", { method: "POST", body: user }) }

