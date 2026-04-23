import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
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
    CreditCard,
    MapPin,
    AlertCircle,
    Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import { usePublicConfig } from '../../entities/public-config/api.ts';
import type { Product as BackendProduct } from '../../shared/api/types.ts';
import { MenuCard } from '../../shared/ui/menu-card/menu-card.tsx';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SelectedItem {
    productId: string;
    title: string;
    price: number;
    subtitle: string;
    quantity: number;
}

interface BookingCreatedResponse {
    id: string;
    bookingNumber: string;
    status: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

function getErrMsg(err: unknown): string {
    const e = err as {
        response?: { data?: { message?: string | string[] }; status?: number };
        message?: string;
    };
    if (e?.response?.status === 429) {
        return 'Слишком много попыток. Подождите минуту и попробуйте снова.';
    }
    const msg = e?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return e?.message ?? 'Не удалось оформить бронь';
}

const TIME_SLOTS = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

const toNumber = (v: string | number | null | undefined): number => {
    if (v == null) return 0;
    return typeof v === 'string' ? Number(v) : v;
};

// Маска +996 XXX XXX-XXX. Принимает любой ввод, возвращает отформатированную строку.
// Идемпотентна: formatKgPhone(formatKgPhone(x)) === formatKgPhone(x).
function formatKgPhone(input: string): string {
    // Оставляем только цифры; отсекаем ведущий код страны 996, если введён.
    const digits = input.replace(/\D/g, '').replace(/^996/, '').slice(0, 9);
    if (digits.length === 0) return '';
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    let out = '+996';
    if (digits.length >= 1) out += ' ' + p1;
    if (digits.length >= 4) out += ' ' + p2;
    if (digits.length >= 7) out += '-' + p3;
    return out;
}

const isKgPhoneComplete = (phone: string): boolean =>
    phone.replace(/\D/g, '').replace(/^996/, '').length === 9;


export const Reservations: React.FC = () => {
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [bookingNumber, setBookingNumber] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        additionalRequests: '',
    });

    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

    const { data: config } = usePublicConfig();

    const { data: products = [] } = useQuery<BackendProduct[]>({
        queryKey: ['public-menu-products'],
        queryFn: async () => {
            const res = await apiClient.get(Path.PublicMenu.Products, {
                params: { limit: 100 },
            });
            const body = unwrap<{ items?: BackendProduct[] }>(res.data);
            return body?.items ?? [];
        },
        staleTime: 60_000,
    });

    const { data: categories = [] } = useQuery<Array<{ id: string; slug: string; title: string }>>({
        queryKey: ['public-menu-categories'],
        queryFn: async () => {
            const res = await apiClient.get(Path.PublicMenu.Categories);
            const body = unwrap<Array<{ id: string; slug: string; title: string }>>(res.data);
            return Array.isArray(body) ? body : [];
        },
        staleTime: 5 * 60_000,
    });

    const filteredMenu = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter((p) => p.category?.slug === selectedCategory);
    }, [products, selectedCategory]);

    // Данные для sidebar из публичного конфига.
    const phone = config?.phoneNumbers?.[0] ?? '';
    const address = config?.addresses?.[0] ?? '';
    // Баннер берём из первой публичной галереи. Fallback — Unsplash.
    const bannerImage =
        config?.galleryItems?.[0]?.media?.url ??
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
    const workingHours = useMemo(() => {
        if (config?.is24Hours) return 'Круглосуточно';
        const open = (config?.worktimeItems ?? []).filter(
            (i) => !i.isClosed && i.openTime && i.closeTime,
        );
        if (!open.length) return '';
        const allSame =
            open.length === 7 &&
            open.every((i) => i.openTime === open[0].openTime && i.closeTime === open[0].closeTime);
        return allSame
            ? `Ежедневно ${open[0].openTime} - ${open[0].closeTime}`
            : '';
    }, [config]);

    const createBookingMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                date: formData.date,
                time: formData.time,
                peopleCount: Number(formData.guests),
                guestName: formData.name.trim(),
                contactPhone: formData.phone.trim(),
                ...(formData.additionalRequests
                    ? { extraInfo: formData.additionalRequests.trim() }
                    : {}),
                ...(selectedItems.length
                    ? {
                          preorderItems: selectedItems.map((i) => ({
                              productId: i.productId,
                              quantity: i.quantity,
                          })),
                      }
                    : {}),
            };
            const res = await apiClient.post<BookingCreatedResponse>(
                Path.PublicBookings.Create,
                payload,
            );
            return unwrap<BookingCreatedResponse>(res.data);
        },
        onSuccess: (booking) => {
            setBookingNumber(booking.bookingNumber);
            setShowSuccess(true);
            setSubmitError(null);
        },
        onError: (err) => {
            setSubmitError(getErrMsg(err));
        },
    });

    // ─── Handlers ───────────────────────────────────────────────────────────

    const addToOrder = (product: BackendProduct) => {
        setSelectedItems((prev) => {
            const existing = prev.find((i) => i.productId === product.id);
            if (existing) {
                if (existing.quantity >= 20) return prev; // backend limit
                return prev.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                );
            }
            if (prev.length >= 20) return prev; // backend: ArrayMaxSize(20)
            return [
                ...prev,
                {
                    productId: product.id,
                    title: product.title,
                    price: toNumber(product.price),
                    subtitle: product.subtitle ?? '',
                    quantity: 1,
                },
            ];
        });
    };

    const removeFromOrder = (productId: string) => {
        setSelectedItems((prev) => {
            const existing = prev.find((i) => i.productId === productId);
            if (existing && existing.quantity > 1) {
                return prev.map((i) =>
                    i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i,
                );
            }
            return prev.filter((i) => i.productId !== productId);
        });
    };

    const totalPrice = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        createBookingMutation.mutate();
    };

    const resetAll = () => {
        setShowSuccess(false);
        setBookingNumber(null);
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
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <section className="relative h-[350px] overflow-hidden  pt-10">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src={bannerImage}
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
                                                            {TIME_SLOTS.map(time => (
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
                                                    <div className="flex items-center gap-4 flex-wrap">
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
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={50}
                                                            value={formData.guests}
                                                            onChange={(e) => setFormData({...formData, guests: e.target.value})}
                                                            className="w-20 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none"
                                                        />
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
                                                            maxLength={255}
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
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            maxLength={17} // «+996 XXX XXX-XXX» ровно 17 символов
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({...formData, phone: formatKgPhone(e.target.value)})}
                                                            onFocus={(e) => {
                                                                // Если поле пустое — подставляем префикс, чтобы пользователь сразу набирал номер.
                                                                if (!e.target.value) {
                                                                    setFormData({...formData, phone: '+996 '});
                                                                }
                                                            }}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                            placeholder="+996 XXX XXX-XXX"
                                                        />
                                                        {formData.phone && !isKgPhoneComplete(formData.phone) && (
                                                            <p className="mt-1 text-xs text-amber-600">
                                                                Номер должен содержать 9 цифр после +996
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                                        Дополнительно (не обязательно)
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        maxLength={1000}
                                                        value={formData.additionalRequests}
                                                        onChange={(e) => setFormData({...formData, additionalRequests: e.target.value})}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                                        placeholder="Аллергии, особые предпочтения и т.д."
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setStep(2)}
                                                    disabled={!formData.name || !isKgPhoneComplete(formData.phone) || !formData.date || !formData.time}
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
                                            <p className="text-md italic font-semibold mb-6">
                                                Если хотите выбрать в заведении, можно пропустить этот пункт
                                            </p>

                                            {/* Категории — динамические из API */}
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
                                                {categories.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setSelectedCategory(c.slug)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                            ${selectedCategory === c.slug
                                                            ? 'bg-gray-500 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    >
                                                        {c.title}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Карточки меню — те же, что на /menu */}
                                            <div className="max-h-[540px] overflow-y-auto pr-1 -mx-2 px-2">
                                                {filteredMenu.length === 0 ? (
                                                    <div className="text-center py-10 text-gray-400 text-sm">
                                                        Нет доступных блюд
                                                    </div>
                                                ) : (
                                                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                        {filteredMenu.map((item, index) => {
                                                            const selected = selectedItems.find(
                                                                (i) => i.productId === item.id,
                                                            );
                                                            const qty = selected?.quantity ?? 0;
                                                            const atLimit = selectedItems.length >= 20 && qty === 0;
                                                            return (
                                                                <MenuCard
                                                                    key={item.id}
                                                                    product={item}
                                                                    index={index}
                                                                    quantity={qty}
                                                                    compact
                                                                    maxQuantity={atLimit ? 0 : 20}
                                                                    addLabel="В предзаказ"
                                                                    onQuantityChange={(product, delta) => {
                                                                        if (delta > 0) addToOrder(product);
                                                                        else removeFromOrder(product.id);
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedItems.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Позиций: {selectedItems.length} / 20
                                                    </span>
                                                    <span className="font-semibold">
                                                        Итого: {totalPrice.toLocaleString('ru-RU')} сом
                                                    </span>
                                                </div>
                                            )}

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
                                                            {selectedItems.map((item) => (
                                                                <div
                                                                    key={item.productId}
                                                                    className="flex justify-between text-sm"
                                                                >
                                                                    <span className="text-gray-600">
                                                                        {item.title} × {item.quantity}
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {(item.price * item.quantity).toLocaleString('ru-RU')} сом
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                                                                <span>Итого:</span>
                                                                <span>{totalPrice.toLocaleString('ru-RU')} сом</span>
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

                                                {/* Оплата — payment-ready placeholder */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-accent-500" />
                                                        Оплата
                                                    </h3>
                                                    {selectedItems.length > 0 ? (
                                                        <>
                                                            <p className="text-sm text-gray-600">
                                                                Оплата при посещении ресторана — наличными или картой.
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                В ближайшее время будет доступна онлайн-оплата и предоплата предзаказа.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-600">
                                                            Для брони без предзаказа оплата не требуется.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Ошибка отправки */}
                                                {submitError && (
                                                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                        <p className="text-sm text-red-700">{submitError}</p>
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
                                                        disabled={createBookingMutation.isPending}
                                                        className="flex-1 px-3 sm:px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                        Назад
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={createBookingMutation.isPending}
                                                        className="flex-1 px-3 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                                    >
                                                        {createBookingMutation.isPending ? (
                                                            <>
                                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                                Отправка…
                                                            </>
                                                        ) : (
                                                            <>
                                                                Забронировать
                                                                <Send className="w-5 h-5" />
                                                            </>
                                                        )}
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
                                    {workingHours && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-accent-100 rounded-lg">
                                                <Clock className="w-5 h-5 text-accent-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Часы работы</p>
                                                <p className="text-sm text-gray-500">{workingHours}</p>
                                            </div>
                                        </div>
                                    )}

                                    {address && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-accent-100 rounded-lg">
                                                <MapPin className="w-5 h-5 text-accent-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Адрес</p>
                                                <p className="text-sm text-gray-500">{address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-accent-100 rounded-lg">
                                                <Phone className="w-5 h-5 text-accent-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Телефон</p>
                                                <p className="text-sm text-gray-500">{phone}</p>
                                            </div>
                                        </div>
                                    )}

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
                            {bookingNumber && (
                                <p className="text-sm text-gray-500 mb-2">
                                    Номер брони: <span className="font-mono font-semibold text-gray-800">{bookingNumber}</span>
                                </p>
                            )}
                            <p className="text-gray-600 mb-6">
                                С вами свяжется администратор
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={resetAll}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Новая бронь
                                </button>
                                <Link to="/" className="flex-1">
                                    <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors">
                                        На главную
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
