import {Header} from "./header.tsx";
import {Outlet} from "react-router-dom";

export const Layout = () => {
    return (
        <div>
            <Header/>
            <Outlet/>
        </div>
    )
}