import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Users,
    User,
    Phone,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Minus,
    MapPin,
    AlertCircle,
    Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MenuItem {
    id: number;
    name: string;
    category: 'starters' | 'main' | 'desserts' | 'wine';
    price: number;
    description: string;
}

interface SelectedItem extends MenuItem {
    quantity: number;
}

export const Reservations: React.FC = () => {
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Состояние формы
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        additionalRequests: '',
    });

    // Состояние для выбранных блюд
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

    // Меню ресторана
    const menuItems: MenuItem[] = [
        // Закуски
        { id: 1, name: 'Устрицы с лимоном', category: 'starters', price: 890, description: 'Свежие устрицы, лимон, соус маринад' },
        { id: 2, name: 'Фуа-гра с бриошью', category: 'starters', price: 1200, description: 'Фуа-гра, бриошь, ягодный конфитюр' },
        { id: 3, name: 'Гравлакс из лосося', category: 'starters', price: 750, description: 'Слабосоленый лосось, укропный соус' },
        { id: 4, name: 'Тартар из говядины', category: 'starters', price: 980, description: 'Говядина, каперсы, лук шалот, перепелиное яйцо' },

        // Основные блюда
        { id: 5, name: 'Рибай стейк', category: 'main', price: 2450, description: 'Мраморная говядина, розмарин, чесночное масло' },
        { id: 6, name: 'Утиная грудка', category: 'main', price: 1650, description: 'Утиная грудка, апельсиновый соус, запеченные овощи' },
        { id: 7, name: 'Лосось на гриле', category: 'main', price: 1790, description: 'Филе лосося, спаржа, голландский соус' },
        { id: 8, name: 'Ризотто с трюфелем', category: 'main', price: 1450, description: 'Ризотто, трюфельное масло, пармезан' },
        { id: 9, name: 'Ягненок с розмарином', category: 'main', price: 2150, description: 'Запеченная нога ягненка, тимьян, гратен дофинуа' },

        // Десерты
        { id: 10, name: 'Крем-брюле', category: 'desserts', price: 590, description: 'Классический крем-брюле с ванилью' },
        { id: 11, name: 'Шоколадный фондан', category: 'desserts', price: 650, description: 'С жидкой сердцевиной, мороженое' },
        { id: 12, name: 'Тирамису', category: 'desserts', price: 550, description: 'Кофейный десерт с маскарпоне' },
        { id: 13, name: 'Сорбет из манго', category: 'desserts', price: 450, description: 'Освежающий сорбет, свежие ягоды' },

        // Вина
        { id: 14, name: 'Шато Марго 2015', category: 'wine', price: 8900, description: 'Красное вино, Бордо, Франция' },
        { id: 15, name: 'Дом Периньон 2012', category: 'wine', price: 15900, description: 'Шампанское, Франция' },
        { id: 16, name: 'Кьянти Классико', category: 'wine', price: 3200, description: 'Красное вино, Тоскана, Италия' },
        { id: 17, name: 'Нойер Бургундер', category: 'wine', price: 2800, description: 'Белое вино, Германия' },
    ];

    // Доступные временные слоты
    const timeSlots = [
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    // Фильтрация меню по категории
    const filteredMenu = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    // Добавление блюда в заказ
    const addToOrder = (item: MenuItem) => {
        setSelectedItems(prev => {
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

    // Удаление блюда из заказа
    const removeFromOrder = (itemId: number) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i =>
                    i.id === itemId
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                );
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    // Общая сумма заказа
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Обработка отправки формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Здесь будет логика отправки на бэкенд
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setStep(1);
            setSelectedItems([]);
            setFormData({
                name: '',
                phone: '',
                date: '',
                time: '',
                guests: '2',
                additionalRequests: '',
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative h-[350px] overflow-hidden  pt-10">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Reservations"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
                </motion.div>

                <div className="relative h-full flex items-center justify-center text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                            Забронировать столик
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl px-4">
                            Забронируйте столик заранее и выберите любимые блюда
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Основной контент */}
            <section className="py-16 px-2 xs:px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Прогресс шагов */}
                    <div className="mb-12">
                        <div className="flex justify-between items-start max-w-3xl mx-auto">
                            {['Детали брони', 'Выбор блюд', 'Подтверждение'].map((label, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                                                ${step > index + 1
                                                ? 'bg-black text-white'
                                                : step === index + 1
                                                    ? 'bg-accent-500 text-gray-400 ring-4 ring-accent-200'
                                                    : 'bg-gray-200 text-black'}`}
                                            animate={step === index + 1 ? { scale: [1, 1.1, 1] } : {}}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {step > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                                        </motion.div>
                                        <span className={`text-sm mt-2 ${step === index + 1 ? 'text-black font-medium' : 'text-gray-500'}`}>
                                            {label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 w-full overflow-hidden gap-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit}>
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-white rounded-2xl shadow-xl p-2 sm:p-8"
                                        >
                                            <h2 className="text-2xl font-display font-bold mb-6">Детали бронирования</h2>

                                            <div className="space-y-6">
                                                {/* Дата и время */}
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <Calendar className="w-4 h-4 inline mr-2" />
                                                            Дата
                                                        </label>
                                                        <input
                                                            type="date"
                                                            required
                                                            min={new Date().toISOString().split('T')[0]}
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <Clock className="w-4 h-4 inline mr-2" />
                                                            Время
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.time}
                                                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                        >
                                                            <option value="">Выберите время</option>
                                                            {timeSlots.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Количество гостей */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Users className="w-4 h-4 inline mr-2" />
                                                        Количество гостей
                                                    </label>
                                                    <div className="flex items-center gap-4">
                                                        {[2, 4, 6, 8, 10].map(num => (
                                                            <button
                                                                key={num}
                                                                type="button"
                                                                onClick={() => setFormData({...formData, guests: num.toString()})}
                                                                className={`px-4 py-2 rounded-lg border-2 transition-all
                                                                    ${formData.guests === num.toString()
                                                                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                                                                    : 'border-gray-200 hover:border-accent-300'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>


                                                {/* Контактные данные */}
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <User className="w-4 h-4 inline mr-2" />
                                                            Имя
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                            placeholder="Ваше имя"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <Phone className="w-4 h-4 inline mr-2" />
                                                            Телефон
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                            placeholder="+996 703 530 377"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                                        Дополнительно (не обязательно)
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={formData.additionalRequests}
                                                        onChange={(e) => setFormData({...formData, additionalRequests: e.target.value})}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                        placeholder="Аллергии, особые предпочтения и т.д."
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setStep(2)}
                                                    disabled={!formData.name || !formData.phone || !formData.date || !formData.time}
                                                    className="w-full bg-black text-white py-4 rounded-xl font-medium cursor-pointer hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    Далее
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-white rounded-2xl shadow-xl p-8"
                                        >
                                            <h2 className="text-2xl font-display font-bold">Выберите блюда</h2>
                                            <p className="text-md italic font-semibold mb-6">Если хотите выбрать в заведении, можно пропустить этот пункт</p>

                                            {/* Категории */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory('all')}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${selectedCategory === 'all'
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    Все
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory('starters')}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${selectedCategory === 'starters'
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    Закуски
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory('main')}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${selectedCategory === 'main'
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    Основные
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory('desserts')}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${selectedCategory === 'desserts'
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    Десерты
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory('wine')}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${selectedCategory === 'wine'
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    Вина
                                                </button>
                                            </div>

                                            {/* Список блюд */}
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {filteredMenu.map(item => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                            <p className="text-sm text-gray-500">{item.description}</p>
                                                            <span className="text-accent-600 font-medium">{item.price} ₽</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {selectedItems.find(i => i.id === item.id) && (
                                                                <div className="flex items-center gap-2 mr-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFromOrder(item.id)}
                                                                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </button>
                                                                    <span className="w-6 text-center">
                                                                        {selectedItems.find(i => i.id === item.id)?.quantity}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addToOrder(item)}
                                                                        className="w-6 h-6 rounded-full bg-gray-200  flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {!selectedItems.find(i => i.id === item.id) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addToOrder(item)}
                                                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-accent-600 transition-colors"
                                                                >
                                                                    Добавить
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                    Назад
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(3)}
                                                    className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                                                >
                                                    Далее
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-white rounded-2xl shadow-xl p-8"
                                        >
                                            <h2 className="text-2xl font-display font-bold mb-6">Подтверждение</h2>

                                            <div className="space-y-6">
                                                {/* Детали брони */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <h3 className="font-medium text-gray-900 mb-3">Детали бронирования</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Дата:</span>
                                                            <span className="font-medium">{formData.date}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Время:</span>
                                                            <span className="font-medium">{formData.time}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Гостей:</span>
                                                            <span className="font-medium">{formData.guests}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Заказанные блюда */}
                                                {selectedItems.length > 0 && (
                                                    <div className="bg-gray-50 rounded-xl p-4">
                                                        <h3 className="font-medium text-gray-900 mb-3">Выбранные блюда</h3>
                                                        <div className="space-y-2">
                                                            {selectedItems.map(item => (
                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">
                                                                        {item.name} x{item.quantity}
                                                                    </span>
                                                                    <span className="font-medium">{item.price * item.quantity} ₽</span>
                                                                </div>
                                                            ))}
                                                            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                                                                <span>Итого:</span>
                                                                <span>{totalPrice} ₽</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Контактные данные */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <h3 className="font-medium text-gray-900 mb-3">Контактные данные</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Имя:</span>
                                                            <span className="font-medium">{formData.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Телефон:</span>
                                                            <span className="font-medium">{formData.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Особые пожелания */}
                                                {formData.additionalRequests && (
                                                    <div className="bg-gray-50 rounded-xl p-4">
                                                        <h3 className="font-medium text-gray-900 mb-2">Особые пожелания</h3>
                                                        <p className="text-sm text-gray-600">{formData.additionalRequests}</p>
                                                    </div>
                                                )}

                                                {/* Чекбокс согласия */}
                                                <div className="flex items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="agree"
                                                        required
                                                        className="mt-1"
                                                    />
                                                    <label htmlFor="agree" className="text-sm text-gray-600">
                                                        Я согласен на обработку персональных данных и подтверждаю, что ознакомлен с политикой конфиденциальности
                                                    </label>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(2)}
                                                        className="flex-1 px-3 sm:px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                        Назад
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="flex-1 px-3 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        Забронировать
                                                        <Send className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                                <h3 className="text-lg font-display font-bold mb-4">Информация</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-accent-100 rounded-lg">
                                            <Clock className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Часы работы</p>
                                            <p className="text-sm text-gray-500">Ежедневно: 12:00 - 00:00</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-accent-100 rounded-lg">
                                            <MapPin className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Адрес</p>
                                            <p className="text-sm text-gray-500">ул. Ресторанная, 1</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-accent-100 rounded-lg">
                                            <Phone className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Телефон</p>
                                            <p className="text-sm text-gray-500">+996 703 530 377</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 my-4" />

                                    <div className="bg-amber-50 rounded-xl p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800 mb-1">Важная информация</p>
                                                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                                    <li>Бронь держится 15 минут</li>
                                                    <li>При опоздании сообщите по телефону</li>
                                                    <li>Дресс-код: smart casual</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-2">Спасибо за бронь!</h3>
                            <p className="text-gray-600 mb-6">
                                C вами свяжется администратор
                            </p>
                            <Link to="/">
                                <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors">
                                    На главную
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};