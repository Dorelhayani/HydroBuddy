// useRegister.js

import {reg} from "../services/register";
export function useReg() {
    const register = async (payload) => await reg.register(payload);
    return {register};
}
