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
    Star,
    ShoppingCart,
} from 'lucide-react';
import { usePublicConfig } from '../../entities/public-config/api.ts';
import { selectCartCount, useCartStore } from '../../entities/cart/store.ts';

const FALLBACK_BRAND = { title: '', subtitle: '' };

function formatWorkingHours(
    items?: { dayKey: string; openTime: string | null; closeTime: string | null; isClosed: boolean }[],
    is24Hours?: boolean,
): string {
    if (is24Hours) return 'Круглосуточно';
    if (!items?.length) return '';
    const open = items.filter((i) => !i.isClosed && i.openTime && i.closeTime);
    if (open.length === 0) return '';
    const allSame =
        open.length === 7 &&
        open.every((i) => i.openTime === open[0].openTime && i.closeTime === open[0].closeTime);
    if (allSame) return `Ежедневно ${open[0].openTime} - ${open[0].closeTime}`;
    return `${open[0].openTime} - ${open[0].closeTime}`;
}

// Только tel: — чистим телефон от всего кроме + и цифр.
function telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { data: config } = usePublicConfig();
    const cartCount = useCartStore(selectCartCount);

    const brandTitle = config?.siteTitle ?? FALLBACK_BRAND.title;
    const brandSubtitle = config?.siteSubtitle ?? FALLBACK_BRAND.subtitle;
    const phone = config?.phoneNumbers?.[0] || "";
    const instagramUrl = config?.socialLinks?.instagram ?? null;
    const whatsappUrl = config?.socialLinks?.whatsapp ?? null;
    const telegramUrl = config?.socialLinks?.telegram ?? null;
    const workingHours = formatWorkingHours(config?.worktimeItems, config?.is24Hours);
    const logoUrl =
        config?.siteConfigMedia?.find((m) => m.slot === 'LOGO')?.media?.url ?? '/logo.png';
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
                // { path: '/breakfast', label: 'Завтраки' },
                // { path: '/menu', label: 'Все меню' },
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
            navigate(`${basePath}${anchor ? `#${anchor}` : ''}`);
        }

        setIsMobileMenuOpen(false);
    };

    // Социальные сети — из API. Скрываем пустые.
    const socialLinks = [
        instagramUrl && { icon: <Instagram className="w-4 h-4" />, url: instagramUrl, label: 'Instagram' },
        whatsappUrl && { icon: <MessageCircle className="w-4 h-4" />, url: whatsappUrl, label: 'WhatsApp' },
        telegramUrl && { icon: <Send className="w-4 h-4" />, url: telegramUrl, label: 'Telegram' },
    ].filter(Boolean) as Array<{ icon: React.ReactNode; url: string; label: string }>;

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
                                    <img
                                        className={`w-12 h-12 rounded-2xl shadow-lg group-hover:shadow-xl transition-all`}
                                        src={logoUrl}
                                        alt={brandTitle}
                                    />

                                    {/* Декоративная точка */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-300 rounded-full animate-ping" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full" />
                                </div>

                                <div>
                                    <h1 className={`font-display font-bold text-xl leading-tight transition-colors ${
                                        isScrolled ? 'text-gray-900' : 'text-white'
                                    }`}>
                                        {brandTitle}
                                    </h1>
                                    <p className={`text-xs tracking-wider transition-colors ${
                                        isScrolled ? 'text-gray-500' : 'text-white/80'
                                    }`}>
                                        {brandSubtitle}
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
                                    {link.dropdown && link.dropdown.length > 0 ? (
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

                                    {link.dropdown  && link.dropdown.length > 0 && activeDropdown === link.label && (
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
                            {/* Корзина */}
                            <Link to="/cart" aria-label="Корзина">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative p-2.5 rounded-full transition-all ${
                                        isScrolled
                                            ? 'text-gray-700 hover:text-accent-600 hover:bg-accent-50'
                                            : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                            {cartCount}
                                        </span>
                                    )}
                                </motion.button>
                            </Link>

                            {/* Телефон */}
                            <a
                                href={telHref(phone)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                    isScrolled
                                        ? 'bg-accent-500 text-black hover:bg-accent-600'
                                        : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
                                }`}
                            >
                                <Phone className="w-4 h-4" />
                                <span className="font-medium">{phone}</span>
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

                        {/* Мобильная часть: корзина + бургер */}
                        <div className="lg:hidden flex items-center gap-2">
                            <Link to="/cart" aria-label="Корзина">
                                <button
                                    className={`relative p-2 rounded-lg transition-colors ${
                                        isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </Link>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isScrolled
                                        ? 'text-gray-700 hover:bg-gray-100'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
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
                                        <img
                                            src={logoUrl}
                                            alt={brandTitle}
                                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                        />
                                        <div>
                                            <h2 className="font-display font-bold text-gray-900">{brandTitle}</h2>
                                            <p className="text-xs text-gray-500">{brandSubtitle}</p>
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
                                        href={telHref(phone)}
                                        className="flex items-center justify-center gap-2 w-full bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors mb-4"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Позвонить нам
                                    </a>

                                    {whatsappUrl && (
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors mb-4"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Написать в WhatsApp
                                        </a>
                                    )}

                                    {socialLinks.length > 0 && (
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
                                    )}
                                </div>

                                {/* Часы работы */}
                                {workingHours && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Часы работы:</p>
                                        <p className="text-xs text-gray-500">{workingHours}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};