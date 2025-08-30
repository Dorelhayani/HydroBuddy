// import { createBrowserRouter, Link, RouterProvider, Outlet, redirect } from 'react-router-dom';
// import React, {useState } from 'react';
// import LoginPage from '../Pages/login_page';
// import AdminPage from '../Pages/admin';
// import HomePage from '../Pages/home_page';
// import DataTable from "../Pages/data_table";
// import DataGraph from "../Pages/data_graph";
//
// export default function App() {
//     const [login, setLogin] = useState(null);
//     const [logout, setLogout] = useState(null);
//     const [plant, setPlant] = useState([]);
//
//     function loaderPlants() { return plant; }
//     function loaderMode() {}
//
//     function loaderLogin() { }
//     function loaderLogout() { }
//
//     function plantEdit({params}){
//         let id = parseInt(params.id);
//         return plant.find(elem => elem.id === id) || {} ;
//     }
//
//
//     const mainRouter = createBrowserRouter([{
//         path: '/',
//         element: (
//             <>
//                 <header className="App-header"></header>
//                 <Outlet />
//             </>
//         ),
//         children: [
//             {
//                 path: 'login_page',
//                 element: <LoginPage />,
//                 loading: loaderLogin,
//                 children: [
//                     {
//                         path:'remove_user',
//                         element: <AdminPage />,
//                     }
//                 ]
//             },
//             {
//                 index: true,
//                 path: 'home_page',
//                 element: <HomePage plant = {plant} setPlant={setPlant} />,
//                 loader: loaderPlants,
//                 children: [
//                     {
//                         path:'add_user',
//                     },
//                     {
//                         path: 'edit_user',
//                     },
//                     {
//                         path:'add_plant',
//                     },
//                     {
//                         path:'edit_plant',
//                     },
//                     {
//                         path: 'mod_change',
//                     }
//                 ]
//             },
//             {
//                 path: 'data_table',
//                 element: <DataTable/>,
//                 loader: loaderPlants,
//             },
//             {
//                 path: 'data_graph',
//                 element: <DataGraph/>,
//                 loader: loaderPlants,
//             }
//
//         ]
//     }
//     ]);
//
//     return <RouterProvider router={mainRouter}/>;
// }