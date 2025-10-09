// useEsp.js

import {esp} from "../services/esp";
import React, {useEffect, useState, useCallback, useMemo} from "react";
import { useRequestStatus } from "./RequestStatus";

export function useEsp() {
        const status = useRequestStatus();
        const [state, setState] = useState(null);

        const fetchEspState = useCallback(async () => {
            await status.run(async () => {
                const s = await esp.StateData();
                setState(s);
                return s;
            });
        }, []);

        useEffect(() => { fetchEspState(); }, [fetchEspState]);

        return {
            state, refetch: fetchEspState,
            loading: status.loading, err: status.err, error: status.error,
        };



}

