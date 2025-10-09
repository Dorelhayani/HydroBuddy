// useAccount.js

import { account } from "../services/account";
import {useState } from "react";
import { useRequestStatus } from "./RequestStatus";

export function useAccount() {
    const [items, setItems] = useState([]);
    const status = useRequestStatus();


    const update_account = async (id, p) => status.run(async () => { await account.update(id, p); });
    const remove_account = async (id)    => status.run(async () => { await account.delete(id); });


    return {
        items, setItems,
        update_account, remove_account,
        loading: status.loading,error: status.error,err: status.err
    };
}