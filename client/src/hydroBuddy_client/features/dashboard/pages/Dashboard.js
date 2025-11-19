/* ===== Dashboard.js ===== */

import Mod from "../../mod/pages/Mod";
import Plants from "../../plants/pages/Plants";

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