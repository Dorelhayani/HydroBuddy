// import { useEffect, useState } from "react";
// import { Http } from "../services/http";
//
// export default function SensorsTable() {
//     const [err, setErr] = useState("");
//     // const[status, setStatus] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [rows, setRows] = useState([]);
//
//     useEffect(() => {
//         Http.getSensors()
//             .then((arr) => setRows(Array.isArray(arr) ? arr : []))
//             .catch((e) => setErr(e.message))
//             .finally(() => setLoading(false));
//     }, []);
//
//
//     // useEffect(() => {
//     //     Http.getDataMode()
//     //         .then((mode) => setStatus(mode)? mode : "No Mode Detected" )
//     //     .catch((e) => setErr(e.message))
//     //     .finally(() => setLoading(false));
//     // });
//
//
//     if (loading) return <div>Loading…</div>;
//     if (err) return <div style={{ color: "red" }}>Error: {err}</div>;
//
//     return (
//         <>
//             {/*<h4> Mode:{status} </h4>*/}
//             <table border="1" className="table" >
//                 <thead>
//                 <tr>
//                     <th>Temp</th>
//                     <th>Light</th>
//                     <th>Moisture</th>
//                     <th>Pump</th>
//                     <th>isRunning</th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {rows?.map((r) => (
//                     <tr key={r.id}>
//                         <td>{r.temp}</td>
//                         <td>{r.light}</td>
//                         <td>{r.moisture}</td>
//                         <td>{r.isRunning ? "ON" : "OFF"}</td>
//                     </tr>
//                 ))}
//                 </tbody>
//             </table>
//         </>
//     );
// }