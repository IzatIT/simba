import {Header} from "./header.tsx";
import {Outlet} from "react-router-dom";

export const ClientLayout = () => {
    return (
        <div>
            <Header/>
            <Outlet/>
        </div>
    )
}