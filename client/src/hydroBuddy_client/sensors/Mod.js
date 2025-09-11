import {Link, Outlet} from "react-router-dom";
import React, {useCallback, useEffect, useState} from "react";
import {esp} from "../services/esp";
import "../style/Mod.css"


export default function Mod() {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState(null);
    const [err, setErr] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            const state = await esp.dataMode();
            setState(state);
        } catch (e) {
            setErr(e.message || "Failed to load plants");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);



    return (
        <div className="wrap">
            <h3 style={{ marginTop: 0 }}>Mod Page</h3>

            <div className="grid">
                <Link className="btnYellow" to="./temperature">Temperature Mod</Link>
                <Link className="btnYellow" to="./moisture">Moisture Mod</Link>
                <Link className="btnYellow" to="./saturday">Saturday Mod</Link>
                <Link className="btnYellow" to="./manual">Manual Mod</Link>
            </div>

            {err && <div style={{ color: "red", marginTop: 8 }}>Error: {err}</div>}

            <Outlet context={{state, loading, refresh }} />
            {/*<Outlet context={{state, loading }} />*/}
        </div>

        // <div className="mod-container">
        //     <div className="mod-sidebar">
        //         <h2>Mod Page</h2>
        //
        //     </div>
        //     <div className="mod-content">
        //         <button><Link to='./temperature'>Temperature Mod</Link></button>
        //         <button><Link to='./moisture'>Moisture Mod</Link></button>
        //         <button><Link to='./saturday'>Saturday Mod</Link></button>
        //         <button><Link to='./manual'>Manual Mod</Link></button>
        //         <Outlet/>
        //     </div>
        // </div>
    )
}