//
// import React, {useState, useEffect} from "react";
//
// export default function HomePage({plant,setPlant}){
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     useEffect(()=>{
//         const fetchData = async () => {
//             try{
//                 const response = await fetch('http://localhost:5050/esp/state');
//                 if(!response.ok){
//                     throw new Error(`HTTP error: ${response.status}`);
//                 }
//                 const result = await response.json();
//                 setData(result);
//             } catch(error){
//                 setError(error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchData();
//     },[])
//
//     if(loading){ return <p>Loading...</p> }
//     if(error){ return <p>Error: {error.message}</p> }
//
//     return (
//         <>
//             <h1>HomePage</h1>
//             <pre>{JSON.stringify(data,null,2)}</pre>
//         </>
//     );
//
// }






// import React, {useState, useEffect} from "react";
//
// export default function HomePage(){
//     let [data, setData] = useState(null);
//
//     const patchData = async (value) => {
//         try {
//              data = await fetch(`http://localhost:5050/esp/state`,{
//                 method:'PATCH',
//                 headers:{'Content-Type': 'application/json'},
//                 body: JSON.stringify(value),
//             });
//             if(!data.ok){
//                 throw new Error("Failed to fetch data. status: " + data.status);
//             }
//             const result = await data.json();
//             setData(result);
//             console.log('PATCH successful:', data);
//         }
//
//         catch(error){
//             console.log('Error patching data',error);
//         }
//         patchData();
//     }
//
//
//     return (
//         <>
//             <h1>HomePage</h1>
//         </>
//     );
//
// }