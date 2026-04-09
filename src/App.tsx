import {Home} from "./pages/home.tsx";
import {Route, Routes, useLocation} from "react-router-dom";
import {Reservations} from "./pages/reservations.tsx";
import {Contacts} from "./pages/contact.tsx";
import {Layout} from "./layout";
import {Menu} from "./pages/menu.tsx";
import {Cart} from "./pages/cart.tsx";
import {useEffect} from "react";

function App() {
    const {pathname} = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
  return (
      <Routes>
         <Route element={<Layout/>}>
             <Route path="/" element={<Home/>}/>
             <Route path="/reservations" element={<Reservations/>}/>
             <Route path="/contacts" element={<Contacts/>}/>
             <Route path="/menu" element={<Menu/>}/>
             <Route path="/cart" element={<Cart/>}/>
         </Route>
      </Routes>
  );
}

export default App;