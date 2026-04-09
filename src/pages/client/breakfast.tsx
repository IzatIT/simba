import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    Star,
    Clock,
    Flame,
    Wheat,
    Leaf,

    Utensils,
    Heart,
    X,
    Plus,
    SlidersHorizontal,
    Award,

} from 'lucide-react';
import { Link } from 'react-router-dom';
import {type MenuItem} from "./menu-data.tsx";
import {breakfastData} from "./breakfast-data.tsx";


interface CartItem extends MenuItem {
    quantity: number;
}

export const Breakfast: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [filters, setFilters] = useState({
        vegetarian: false,
        spicy: false,
        glutenFree: false,
        popular: false,
        priceRange: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('popular');

    // Фильтрация и сортировка меню
    const filteredMenu = breakfastData
        .filter(item => {
            // Поиск
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Фильтры
            if (filters.vegetarian && !item.isVegetarian) return false;
            if (filters.glutenFree && !item.isGlutenFree) return false;
            if (filters.popular && !item.isPopular) return false;

            return true;
        })
        .sort((a, b) => {
            switch(sortBy) {
                case 'popular':
                    return b.rating - a.rating;
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

    // Функции корзины
    const addToCart = (item: MenuItem) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-screen overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[350px] pt-20 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                </motion.div>

                <div className="relative h-full flex items-center text-white">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl"
                        >
                            <span className="text-accent-400 font-medium mb-2 block">Наше меню</span>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold mb-4">
                                Завтраки
                            </h1>
                            <div className="relative inline-block px-0 py-3 group">
                                {/* Верхняя изогнутая линия */}
                                <svg className="absolute -top-2 left-0 w-full h-5" preserveAspectRatio="none">
                                    <path
                                        d="M0,10 Q30,0 60,10 Q90,20 120,10 Q150,0 180,10 Q210,20 240,10 Q270,0 300,10"
                                        stroke="#fecaca"
                                        strokeWidth="1"
                                        fill="none"
                                        className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </svg>

                                {/* Нижняя изогнутая линия */}
                                <svg className="absolute -bottom-2 left-0 w-full h-5" preserveAspectRatio="none">
                                    <path
                                        d="M0,10 Q30,20 60,10 Q90,0 120,10 Q150,20 180,10 Q210,0 240,10 Q270,20 300,10"
                                        stroke="#fecaca"
                                        strokeWidth="1"
                                        fill="none"
                                        className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </svg>


                                {/* Текст с тонкими линиями по бокам */}
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-px bg-gradient-to-r from-transparent to-red-200/50"></div>
                                    <p className="text-xl text-red-200 font-serif italic tracking-wide">
                                        Конокбекова Сымбат
                                    </p>
                                    <div className="w-8 h-px bg-gradient-to-l from-transparent to-red-200/50"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Основное меню */}
            <section className="py-12">
                <div className="container mx-auto max-w-7xl">
                    {/* Поиск и фильтры */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Поиск блюд..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="flex items-center flex-wrap gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white"
                            >
                                <option value="popular">Популярные</option>
                                <option value="rating">По рейтингу</option>
                                <option value="price-asc">Сначала дешевле</option>
                                <option value="price-desc">Сначала дороже</option>
                            </select>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3 border rounded-xl transition-all ${
                                    showFilters
                                        ? 'border-accent-500 bg-accent-50 text-accent-600'
                                        : 'border-gray-200 hover:border-accent-300'
                                }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>

                            <Link to="/cart">
                                <button className="relative p-3 bg-gray-500 cursor-pointer text-white rounded-xl hover:bg-accent-600 transition-colors">
                                    <ShoppingCart className="w-5 h-5" />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Расширенные фильтры */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                    <h3 className="font-medium text-gray-900 mb-4">Фильтры</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.vegetarian}
                                                onChange={(e) => setFilters({...filters, vegetarian: e.target.checked})}
                                                className="w-4 h-4 text-accent-500 rounded focus:ring-accent-500"
                                            />
                                            <Leaf className="w-4 h-4 text-green-500" />
                                            <span>Вегетарианское</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.glutenFree}
                                                onChange={(e) => setFilters({...filters, glutenFree: e.target.checked})}
                                                className="w-4 h-4 text-accent-500 rounded focus:ring-accent-500"
                                            />
                                            <Wheat className="w-4 h-4 text-amber-500" />
                                            <span>Без глютена</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.popular}
                                                onChange={(e) => setFilters({...filters, popular: e.target.checked})}
                                                className="w-4 h-4 text-accent-500 rounded focus:ring-accent-500"
                                            />
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span>Популярные</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Сетка меню */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMenu.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                {/* Изображение */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Теги */}
                                    <div className="absolute top-3 left-3 flex gap-1">
                                        {item.isPopular && (
                                            <span className="px-2 py-1 bg-accent-500 text-orange-500 text-sm font-extrabold rounded-full flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                ХИТ
                                            </span>
                                        )}
                                    </div>

                                    {/* Кнопка добавления */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                        }}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-500 hover:text-white"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Информация */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.nameEn}</p>
                                        </div>
                                    </div>

                                    {/* Рейтинг */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(item.rating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({item.ratingCount})
                                        </span>
                                    </div>

                                    {/* Характеристики */}
                                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {item.cookingTime} мин
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Flame className="w-3 h-3" />
                                            {item.calories} ккал
                                        </span>
                                    </div>

                                    {/* Ингредиенты */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {item.ingredients.join(', ')}
                                    </p>

                                    {/* Цена и добавление */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {item.price} Сом
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}
                                            className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
                                        >
                                            В корзину
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Пустое состояние */}
                    {filteredMenu.length === 0 && (
                        <div className="text-center py-16">
                            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
                            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-64">
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-md sm:text-3xl font-display font-bold text-gray-900 mb-1">
                                            {selectedItem.name}
                                        </h2>
                                        <p className=" text-sm sm:text-md text-gray-500">{selectedItem.nameEn}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-md sm:text-3xl font-bold text-accent-600">
                                            {selectedItem.price} Сом
                                        </div>
                                        {selectedItem.oldPrice && (
                                            <div className="text-sm text-gray-400 line-through">
                                                {selectedItem.oldPrice} Сом
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-6">{selectedItem.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-200 rounded-xl p-3 text-center">
                                        <Clock className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                                        <div className="text-sm text-gray-500">Время</div>
                                        <div className="font-medium">{selectedItem.cookingTime} мин</div>
                                    </div>
                                    <div className="bg-gray-200 rounded-xl p-3 text-center">
                                        <Flame className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                                        <div className="text-sm text-gray-500">Калории</div>
                                        <div className="font-medium">{selectedItem.calories} ккал</div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-3">Ингредиенты</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.ingredients.map((ingredient, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                            >
                                                {ingredient}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => addToCart(selectedItem)}
                                        className="flex-1 bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Добавить в корзину
                                    </button>
                                    <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};