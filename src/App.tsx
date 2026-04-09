import {Home} from "./pages/client/home.tsx";
import {Route, Routes, useLocation} from "react-router-dom";
import {Reservations} from "./pages/client/reservations.tsx";
import {Contacts} from "./pages/client/contact.tsx";
import {Menu} from "./pages/client/menu.tsx";
import {Cart} from "./pages/client/cart.tsx";
import {useEffect} from "react";
import {Breakfast} from "./pages/client/breakfast.tsx";
import {ClientLayout} from "./layouts/client-layout";
import AdminLogin from "./pages/admin/login.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {QueryClient} from "@tanstack/query-core";
import AdminPanel from "./layouts/admin-layout/panel.tsx";
import {AdminProfile} from "./pages/admin/profile.tsx";
import {AdminConfiguration} from "./pages/admin/configuration.tsx";

const queryClient = new QueryClient()

function App() {
    const {pathname} = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <QueryClientProvider client={queryClient}>

        <Routes>
            <Route element={<ClientLayout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/reservations" element={<Reservations/>}/>
                <Route path="/contacts" element={<Contacts/>}/>
                <Route path="/menu" element={<Menu/>}/>
                <Route path="/breakfast" element={<Breakfast/>}/>
                <Route path="/cart" element={<Cart/>}/>
                <Route path="/login" element={<AdminLogin/>}/>
            </Route>
            <Route element={<AdminPanel/>}>
                <Route path="/admin/profile" element={<AdminConfiguration/>}/>
            </Route>
        </Routes>
        </QueryClientProvider>

    );
}

export default App;