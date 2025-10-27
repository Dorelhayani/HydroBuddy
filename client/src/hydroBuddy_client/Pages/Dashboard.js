/* ===== Dashboard.js ===== */

import Plants from "./Plants";
import Mod from "./Mod";


export default function Dashboard() {
    return (
        <div className="main-container">
            <section className="content-grid two-col">
                <Plants embed />
                <Mod embed />
            </section>
        </div>
    );
}