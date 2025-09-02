import {Outlet} from "react-router-dom";

export default function PlantPage({plants}) {


    return (
        <div className="Plant-container">
            <div className="plant-sidebar">

            </div>
            <div className="Plant-content">
                <Outlet/>
            </div>
        </div>
    )
}