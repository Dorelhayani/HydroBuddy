import {useState } from "react";
import { account } from "./account";

export function useAccount() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);


    const update  = async (id,p)=> { await account.update(id,p);};
    const remove= async (id)=> { await account.delete(id);};

    return { items, setItems, setLoading, setError, loading, error, update, remove};
}