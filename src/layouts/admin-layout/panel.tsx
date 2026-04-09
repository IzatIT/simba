import { useState } from 'react';
import {Outlet, NavLink, useNavigate, Navigate} from 'react-router-dom';
import {
    SettingsIcon,
    GridIcon,
    TagIcon,
    UtensilsIcon,
    CalendarIcon,
    LogOutIcon,
} from 'lucide-react';
import {useQueryClient} from "@tanstack/react-query";
import {Storage} from "../../shared/utils/storage.ts";
import {useAuth} from "../../hooks/use-auth.ts";

const AdminPanel = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    const menuItems = [
        { path: '/admin/profile', name: 'Профиль', icon: SettingsIcon },
        { path: '/admin/categories', name: 'Категории', icon: GridIcon },
        { path: '/admin/tags', name: 'Теги', icon: TagIcon },
        { path: '/admin/menu', name: 'Меню', icon: UtensilsIcon },
        { path: '/admin/book', name: 'Бронирования', icon: CalendarIcon },
    ];

    const handleLogout = async () => {
        try {
            Storage.removeItem("ACCESS_TOKEN")
            Storage.removeItem("REFRESH_TOKEN")
            await queryClient.clear();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 fixed h-full z-20 shadow-xl`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 mr-1 bg-amber-500 rounded-xl flex items-center justify-center">
                            <UtensilsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Simba</h1>
                            <p className="text-xs text-gray-400">Панель управления</p>
                        </div>
                    </div>
                </div>

                <nav className="mt-6 px-3">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                                    isActive
                                        ? 'bg-amber-500 text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                    >
                        <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Выход</span>
                    </button>
                </div>
            </aside>

            <div className={`flex-1 ml-72 transition-all duration-300`}>
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex-1 max-w-md">

                        </div>

                        <div className="flex items-center space-x-4">


                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        A
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-medium text-gray-700">Администратор</p>
                                        <p className="text-xs text-gray-500">admin@restaurant.com</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;