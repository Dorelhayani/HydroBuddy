/* ===== Dashboard.js ===== */

// import Mod from "../../mod/pages/Mod";
// import Plants from "../../plants/pages/Plants";
// import AnalyticsPanel from "../../analytics/pages/Analytics"
//
// export default function Dashboard() {
//
//     return (
//         <div className="main-container">
//             <section className="content-grid two-col">
//                 <Plants embed />
//                 <Mod embed />
//              </section>
//
//           <section className="content-grid">
//             <AnalyticsPanel />
//           </section>
//          </div>
//      );
// }




/* ===== Dashboard.js ===== */

import Mod from "../../mod/pages/Mod";
import Plants from "../../plants/pages/Plants";
import AnalyticsPanel from "../../analytics/pages/Analytics"

export default function Dashboard() {

  const isDashboard= location.pathname === "/dashboard";


  return (
    <div className="main-container">
      <section className="content-grid two-col">
        <Plants embed />
        <Mod embed />
      </section>

      <section className="content-grid">
        <AnalyticsPanel />
      </section>
    </div>
  );
}