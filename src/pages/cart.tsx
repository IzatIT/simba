import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Percent,
    Truck,
    CreditCard,
    Wallet,
    Shield,
    Clock,
    MapPin,
    Check,
    X,
    Star
} from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    nameEn: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    extras?: { name: string; price: number }[];
    specialInstructions?: string;
}

interface PromoCode {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
}

export const Cart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: 'Рибай стейк',
            nameEn: 'Ribeye steak',
            price: 3450,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            category: 'main',
            extras: [
                { name: 'Соус перечный', price: 150 },
                { name: 'Овощи гриль', price: 250 }
            ]
        },
        {
            id: 2,
            name: 'Крем-брюле',
            nameEn: 'Crème brûlée',
            price: 650,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            category: 'desserts',
            specialInstructions: 'Без сахара'
        },
        {
            id: 3,
            name: 'Мохито',
            nameEn: 'Mojito',
            price: 690,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            category: 'cocktails'
        }
    ]);

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [promoError, setPromoError] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<string>('card');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('asap');
    const [contactInfo, setContactInfo] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [orderNote, setOrderNote] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [suggestedItems] = useState([
        {
            id: 4,
            name: 'Устрицы с лимоном',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1583425429970-7bb4f49e0d0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rating: 4.8
        },
        {
            id: 5,
            name: 'Шоколадный фондан',
            price: 590,
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rating: 4.9
        },
        {
            id: 6,
            name: 'Дом Периньон 2012',
            price: 25900,
            image: 'https://images.unsplash.com/photo-1594712941268-3e43e6308f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rating: 5.0
        }
    ]);

    // Промокоды
    const validPromoCodes: PromoCode[] = [
        { code: 'WELCOME10', discount: 10, type: 'percentage' },
        { code: 'SUMMER500', discount: 500, type: 'fixed' },
        { code: 'FIRSTORDER', discount: 15, type: 'percentage' }
    ];

    // Расчет стоимости
    const subtotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const extrasTotal = item.extras?.reduce((extrasSum, extra) => extrasSum + extra.price, 0) || 0;
        return sum + itemTotal + extrasTotal;
    }, 0);

    const deliveryFee = deliveryMethod === 'delivery' ? 300 : 0;
    const serviceFee = Math.round(subtotal * 0.05); // 5% сервисный сбор

    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = Math.round(subtotal * (appliedPromo.discount / 100));
        } else {
            discount = appliedPromo.discount;
        }
    }

    const total = subtotal + deliveryFee + serviceFee - discount;

    // Функции корзины
    const updateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (itemId: number) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        if (window.confirm('Очистить корзину?')) {
            setCartItems([]);
        }
    };

    // Применение промокода
    const applyPromoCode = () => {
        const found = validPromoCodes.find(
            p => p.code.toLowerCase() === promoCode.toLowerCase()
        );

        if (found) {
            setAppliedPromo(found);
            setPromoError('');
            setPromoCode('');
        } else {
            setPromoError('Неверный промокод');
        }
    };

    const removePromoCode = () => {
        setAppliedPromo(null);
    };

    // Оформление заказа
    const handleCheckout = () => {
        setIsCheckingOut(true);
        // Имитация отправки заказа
        setTimeout(() => {
            setIsCheckingOut(false);
            setOrderComplete(true);
            setCartItems([]);
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                        Заказ оформлен!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Спасибо за ваш заказ. Мы отправили подтверждение на ваш email и скоро свяжемся с вами для уточнения деталей.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-medium text-gray-700 mb-2">Номер заказа:</p>
                        <p className="text-2xl font-bold text-accent-600">#24-0358</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/" className="flex-1">
                            <button className="w-full px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                На главную
                            </button>
                        </Link>
                        <Link to="/menu" className="flex-1">
                            <button className="w-full px-6 py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors">
                                Продолжить покупки
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative top-0 text-center max-w-md"
                >
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-3">
                        Корзина пуста
                    </h2>
                    <p className="text-white mb-8">
                        Добавьте блюда из нашего меню, чтобы оформить заказ
                    </p>
                    <Link to="/menu">
                        <button className="px-8 py-4 bg-gray-500 text-white cursor-pointer rounded-xl font-medium hover:bg-gray-600 transition-colors inline-flex items-center gap-2">
                            <ArrowRight className="w-5 h-5" />
                            Перейти в меню
                        </button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <section className="relative h-[300px] pt-10 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                </motion.div>

                <div className="relative h-full flex items-center text-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
                                Корзина
                            </h1>
                            <p className="text-xl text-gray-200">
                                Проверьте ваш заказ перед оформлением
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Основной контент */}
            <section className="py-12">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Левая колонка - товары */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Заголовок и действия */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm sm:text-2xl font-display font-bold text-gray-900">
                                    Товары в корзине ({cartItems.length})
                                </h2>
                                <button
                                    onClick={clearCart}
                                    className="text-red-500 hover:text-red-600 flex items-center gap-2 text-xs sm:text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Очистить корзину
                                </button>
                            </div>

                            {/* Список товаров */}
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="flex gap-4">
                                            {/* Изображение */}
                                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Информация */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                        <p className="text-sm text-gray-500">{item.nameEn}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>

                                                {/* Дополнения */}
                                                {item.extras && (
                                                    <div className="mb-2">
                                                        {item.extras.map((extra, i) => (
                                                            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-1">
                                                                + {extra.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Особые пожелания */}
                                                {item.specialInstructions && (
                                                    <p className="text-xs text-gray-500 italic mb-2">
                                                        Примечание: {item.specialInstructions}
                                                    </p>
                                                )}

                                                {/* Количество и цена */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-lg"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-10 text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-lg"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">
                                                            {item.price * item.quantity} ₽
                                                        </div>
                                                        {item.extras && (
                                                            <div className="text-xs text-gray-500">
                                                                +{item.extras.reduce((sum, e) => sum + e.price, 0)} ₽
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Рекомендации */}
                            <div className="mt-8">
                                <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                                    Рекомендуем добавить
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestedItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ y: -2 }}
                                            className="bg-white rounded-xl shadow-md p-3 flex gap-3 cursor-pointer hover:shadow-lg transition-all"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                <div className="flex items-center gap-1 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${
                                                                i < Math.floor(item.rating)
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-accent-600">
                                                        {item.price} ₽
                                                    </span>
                                                    <button className="p-1 bg-accent-500 text-white rounded-lg hover:bg-accent-600">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка - оформление */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                                <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                                    Оформление заказа
                                </h2>

                                {/* Способ получения */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-700 mb-3">Способ получения</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setDeliveryMethod('delivery')}
                                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                                                deliveryMethod === 'delivery'
                                                    ? 'border-accent-500 bg-accent-50'
                                                    : 'border-gray-200 hover:border-accent-300'
                                            }`}
                                        >
                                            <Truck className={`w-5 h-5 mx-auto mb-1 ${
                                                deliveryMethod === 'delivery' ? 'text-accent-500' : 'text-gray-400'
                                            }`} />
                                            <span className="text-sm font-medium">
                                                Доставка
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMethod('pickup')}
                                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                                                deliveryMethod === 'pickup'
                                                    ? 'border-accent-500 bg-accent-50'
                                                    : 'border-gray-200 hover:border-accent-300'
                                            }`}
                                        >
                                            <MapPin className={`w-5 h-5 mx-auto mb-1 ${
                                                deliveryMethod === 'pickup' ? 'text-accent-500' : 'text-gray-400'
                                            }`} />
                                            <span className="text-sm font-medium">
                                                Самовывоз
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Адрес доставки */}
                                {deliveryMethod === 'delivery' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Адрес доставки
                                        </label>
                                        <input
                                            type="text"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="ул. Ресторанная, 1, кв. 5"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                )}

                                {/* Время доставки */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Время
                                    </label>
                                    <select
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                    >
                                        <option value="asap">Как можно скорее</option>
                                        <option value="18:00">Сегодня 18:00</option>
                                        <option value="19:00">Сегодня 19:00</option>
                                        <option value="20:00">Сегодня 20:00</option>
                                    </select>
                                </div>

                                {/* Промокод */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Промокод
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Введите промокод"
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                            disabled={!!appliedPromo}
                                        />
                                        {appliedPromo ? (
                                            <button
                                                onClick={removePromoCode}
                                                className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={applyPromoCode}
                                                className="px-4 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors"
                                            >
                                                <Percent className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    {promoError && (
                                        <p className="text-red-500 text-sm mt-2">{promoError}</p>
                                    )}
                                    {appliedPromo && (
                                        <p className="text-green-500 text-sm mt-2">
                                            Промокод применен! Скидка {appliedPromo.discount}
                                            {appliedPromo.type === 'percentage' ? '%' : ' ₽'}
                                        </p>
                                    )}
                                </div>

                                {/* Контактные данные */}
                                <div className="mb-6 space-y-3">
                                    <h3 className="font-medium text-gray-700">Контактные данные</h3>
                                    <input
                                        type="text"
                                        placeholder="Ваше имя"
                                        value={contactInfo.name}
                                        onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Телефон"
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Примечание к заказу */}
                                <div className="mb-6">
                                    <textarea
                                        placeholder="Примечание к заказу (аллергии, предпочтения)"
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Детали оплаты */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-medium text-gray-700 mb-3">Способ оплаты</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'card'
                                                    ? 'border-accent-500 bg-white'
                                                    : 'border-gray-200 hover:border-accent-300'
                                            }`}
                                        >
                                            <CreditCard className={`w-5 h-5 mx-auto mb-1 ${
                                                paymentMethod === 'card' ? 'text-accent-500' : 'text-gray-400'
                                            }`} />
                                            <span className="text-xs">Картой</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'cash'
                                                    ? 'border-accent-500 bg-white'
                                                    : 'border-gray-200 hover:border-accent-300'
                                            }`}
                                        >
                                            <Wallet className={`w-5 h-5 mx-auto mb-1 ${
                                                paymentMethod === 'cash' ? 'text-accent-500' : 'text-gray-400'
                                            }`} />
                                            <span className="text-xs">Наличными</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Итого */}
                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Сумма заказа</span>
                                        <span className="font-medium">{subtotal} ₽</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Сервисный сбор (5%)</span>
                                        <span className="font-medium">{serviceFee} ₽</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Доставка</span>
                                        <span className="font-medium">
                                            {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Скидка</span>
                                            <span>-{discount} ₽</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Итого</span>
                                            <span className="text-accent-600">{total} ₽</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Кнопка оформления */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || !contactInfo.name || !contactInfo.phone || !contactInfo.email || (deliveryMethod === 'delivery' && !deliveryAddress)}
                                    className="w-full bg-accent-500 text-white py-4 rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Оформление...
                                        </>
                                    ) : (
                                        <>
                                            Оформить заказ
                                            <Shield className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {/* Безопасность */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield className="w-4 h-4" />
                                    <span>Безопасная оплата</span>
                                    <span>•</span>
                                    <Clock className="w-4 h-4" />
                                    <span>Быстрая доставка</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};