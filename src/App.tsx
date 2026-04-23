import {Home} from "./pages/client/home.tsx";
import {Route, Routes, useLocation} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import {Reservations} from "./pages/client/reservations.tsx";
import {Contacts} from "./pages/client/contact.tsx";
import {Menu} from "./pages/client/menu.tsx";
import {Cart} from "./pages/client/cart.tsx";
import {useEffect} from "react";
import {Breakfast} from "./pages/client/breakfast.tsx";
import {ClientLayout} from "./layouts/client-layout";
import AdminLogin from "./pages/admin/login/login.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {QueryClient} from "@tanstack/query-core";
import AdminPanel from "./layouts/admin-layout/panel.tsx";
import {AdminProfilePreview} from "./pages/admin/profile/preview.tsx";
import {AdminProfileConfiguration} from "./pages/admin/profile/configuration.tsx";
import {AdminMenuCategories} from "./pages/admin/categories/categories.tsx";
import {AdminProductTags} from "./pages/admin/tags/tags.tsx";
import {AdminMenu} from "./pages/admin/menu/menu.tsx";
import {AdminBookings} from "./pages/admin/booking/booking.tsx";
import {AdminUsers} from "./pages/admin/users/users.tsx";
import {AdminCustomers} from "./pages/admin/customers/customers.tsx";
import {AdminCustomerDetail} from "./pages/admin/customers/customer-detail.tsx";
import {AdminOrders} from "./pages/admin/orders/orders.tsx";
import {AdminOrderDetail} from "./pages/admin/orders/order-detail.tsx";

const queryClient = new QueryClient()

function App() {
    const {pathname} = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
                <Route path="/admin/profile" element={<AdminProfilePreview/>}/>
                <Route path="/admin/profile/edit" element={<AdminProfileConfiguration/>}/>
                <Route path="/admin/categories" element={<AdminMenuCategories/>}/>
                <Route path="/admin/tags" element={<AdminProductTags/>}/>
                <Route path="/admin/menu" element={<AdminMenu/>}/>
                <Route path="/admin/book" element={<AdminBookings/>}/>
                <Route path="/admin/customers" element={<AdminCustomers/>}/>
                <Route path="/admin/customers/:phone" element={<AdminCustomerDetail/>}/>
                <Route path="/admin/orders" element={<AdminOrders/>}/>
                <Route path="/admin/orders/:id" element={<AdminOrderDetail/>}/>
                <Route path="/admin/users" element={<AdminUsers/>}/>
            </Route>
        </Routes>
        </QueryClientProvider>

    );
}

export default App;