import React, { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ChevronDown,
    Phone,
    Calendar,
    Utensils,
    Home,
    Mail,
    Instagram,
    MessageCircle,
    Send,
    Star
} from 'lucide-react';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    // Отслеживание скролла
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Закрытие мобильного меню при смене маршрута
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    // Навигационные ссылки
    const navLinks = [
        { path: '/', label: 'Главная', icon: <Home className="w-4 h-4" />,
            dropdown: [
                { path: '/#statistic', label: 'Статистика' },
                { path: '/#atmosphere', label: 'Атмосфера' },
                { path: '/#chef', label: 'Шеф-повар' },
                { path: '/#events', label: 'События' },
            ]},
        { path: '/menu', label: 'Меню', icon: <Utensils className="w-4 h-4" />,
            dropdown: [
                { path: '/breakfast', label: 'Завтраки' },
                { path: '/menu', label: 'Все меню' },
            ]},
        { path: '/reservations', label: 'Бронирование', icon: <Calendar className="w-4 h-4" /> },
        { path: '/contacts', label: 'Контакты', icon: <Mail className="w-4 h-4" /> },
    ];

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();

        // Разделяем путь и якорь
        const [basePath, anchor] = path.split('#');

        if (location.pathname === basePath) {
            // Мы уже на нужной странице - просто скроллим
            const element = document.getElementById(anchor);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        } else {
            // Переходим на другую страницу с якорем
            navigate(`${basePath}#${anchor}`);
        }

        setIsMobileMenuOpen(false);
    };

    // Социальные сети
    const socialLinks = [
        { icon: <Instagram className="w-4 h-4" />, url: 'https://www.instagram.com/__s1mona__/', label: 'Instagram' },
        { icon: <MessageCircle className="w-4 h-4" />, url: 'https://wa.me/996703530377', label: 'WhatsApp' },
        { icon: <Send className="w-4 h-4" />, url: 'https://t.me/lebistrot', label: 'Telegram' },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled
                        ? 'bg-white/90 backdrop-blur-md shadow-lg py-3'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Логотип */}
                        <Link to="/">
                            <motion.div
                                className="flex items-center gap-3 group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Иконка-логотип */}
                                <div className="relative">
                                    <img className={`w-12 h-12 rounded-2xl shadow-lg group-hover:shadow-xl transition-all`} src="/logo.png"/>

                                    {/* Декоративная точка */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-300 rounded-full animate-ping" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full" />
                                </div>

                                <div>
                                    <h1 className={`font-display font-bold text-xl leading-tight transition-colors ${
                                        isScrolled ? 'text-gray-900' : 'text-white'
                                    }`}>
                                        Le Simba
                                    </h1>
                                    <p className={`text-xs tracking-wider transition-colors ${
                                        isScrolled ? 'text-gray-500' : 'text-white/80'
                                    }`}>
                                        FRENCH CUISINE
                                    </p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Десктопная навигация */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    {link.dropdown ? (
                                        // Ссылка с выпадающим меню
                                        <button
                                            className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all ${
                                                isScrolled
                                                    ? 'text-gray-700 hover:text-accent-600 hover:bg-accent-50'
                                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {link.icon}
                                                {link.label}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${
                                                activeDropdown === link.label ? 'rotate-180' : ''
                                            }`} />
                                        </button>
                                    ) : (
                                        // Обычная ссылка
                                        <Link
                                            to={link.path!}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                                                location.pathname === link.path
                                                    ? isScrolled
                                                        ? 'bg-accent-500 text-gray-900'
                                                        : 'bg-white/20 text-white backdrop-blur-sm'
                                                    : isScrolled
                                                        ? 'text-gray-700 hover:text-accent-600 hover:bg-accent-50'
                                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {link.icon}
                                            {link.label}
                                        </Link>
                                    )}

                                    {link.dropdown && activeDropdown === link.label && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-0 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100"
                                        >
                                            {link.dropdown.map((item) => (
                                                <Link
                                                    onClick={(e) => handleAnchorClick(e, item.path)}
                                                    key={item.path}
                                                    to={item.path}
                                                    className="block px-4 py-2 text-gray-700 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Контактная информация и соцсети */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Телефон */}
                            <a
                                href="tel:+996703530377"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                    isScrolled
                                        ? 'bg-accent-500 text-black hover:bg-accent-600'
                                        : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
                                }`}
                            >
                                <Phone className="w-4 h-4" />
                                <span className="font-medium">+996 703 530 377</span>
                            </a>

                            {/* Социальные сети */}
                            <div className="flex items-center gap-2">
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-2 rounded-lg transition-all ${
                                            isScrolled
                                                ? 'text-gray-600 hover:text-accent-600 hover:bg-accent-50'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка мобильного меню */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`lg:hidden p-2 rounded-lg transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 hover:bg-gray-100'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Мобильное меню */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 lg:hidden"
                    >
                        {/* Затемнение фона */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Панель меню */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6">
                                {/* Логотип в мобильном меню */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-gray-600 flex items-center justify-center">
                                            <Utensils className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-display font-bold text-gray-900">Le Simba</h2>
                                            <p className="text-xs text-gray-500">FRENCH CUISINE</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Навигация */}
                                <nav className="space-y-1 mb-8">
                                    {navLinks.map((link) => (
                                        <div key={link.label}>
                                            {link.dropdown ? (
                                                // Мобильный дропдаун
                                                <div className="border-b border-gray-100 pb-2">
                                                    <button
                                                        onClick={() => setActiveDropdown(
                                                            activeDropdown === link.label ? null : link.label
                                                        )}
                                                        className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                    >
                                                        <span className="flex items-center gap-3 font-medium">
                                                            {link.icon}
                                                            {link.label}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${
                                                            activeDropdown === link.label ? 'rotate-180' : ''
                                                        }`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeDropdown === link.label && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden pl-11"
                                                            >
                                                                {link.dropdown.map((item) => (
                                                                    <Link
                                                                        key={item.path}
                                                                        to={item.path}
                                                                        className="block px-4 py-2 text-gray-600 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                                    >
                                                                        {item.label}
                                                                    </Link>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <Link
                                                    to={link.path!}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                        location.pathname === link.path
                                                            ? 'bg-gray-500 text-white'
                                                            : 'text-gray-700 hover:bg-accent-50 hover:text-accent-600'
                                                    }`}
                                                >
                                                    {link.icon}
                                                    <span className="font-medium">{link.label}</span>
                                                    {location.pathname === link.path && (
                                                        <Star className="w-4 h-4 ml-auto" />
                                                    )}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </nav>

                                {/* Контакты в мобильном меню */}
                                <div className="border-t border-gray-200 pt-6">
                                    <a
                                        href="tel:+79991234567"
                                        className="flex items-center justify-center gap-2 w-full bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors mb-4"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Позвонить нам
                                    </a>

                                    <a
                                        href="https://wa.me/79991234567"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors mb-4"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Написать в WhatsApp
                                    </a>

                                    <div className="flex justify-center gap-3">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.label}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-colors"
                                                aria-label={social.label}
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Часы работы */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Часы работы:</p>
                                    <p className="text-xs text-gray-500">Ежедневно 12:00 - 00:00</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};