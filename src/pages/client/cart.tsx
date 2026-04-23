import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Truck,
    CreditCard,
    Wallet,
    Shield,
    Clock,
    MapPin,
    Check,
    X,
    User,
    Phone,
    Mail,
    MessageSquare,
    AlertCircle,
    CalendarClock,
} from 'lucide-react';
import {
    selectCartCount,
    selectCartSubtotal,
    useCartStore,
} from '../../entities/cart/store.ts';
import type { CartItem } from '../../entities/cart/types.ts';
import { useCreateOrder } from '../../entities/orders/api.ts';
import type { CreateOrderDto } from '../../entities/orders/api.ts';
import type { Order, OrderType } from '../../shared/api/types.ts';

const PLACEHOLDER_IMAGE = '/food-placeholder.jpg';

// Client-side preview only. The backend recomputes all totals authoritatively
// on POST /public/orders — what we display here is just a UX preview.
const DELIVERY_FEE_PREVIEW = 150;

function formatKgPhone(input: string): string {
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

function getErrMsg(err: unknown): string {
    const e = err as {
        response?: { data?: { message?: string | string[] }; status?: number };
        message?: string;
    };
    if (e?.response?.status === 429) return 'Слишком много попыток. Подождите минуту.';
    const msg = e?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return e?.message ?? 'Не удалось оформить заказ';
}

// The UI payment choice maps 1:1 onto PaymentMethod on the backend. For
// now we do NOT call POST /public/payments/initiate from the cart page —
// orders are placed with "pay later" (status PENDING_CONFIRMATION) and the
// admin confirms the payment when the order is fulfilled. The `payLater`
// flag toggles whether a payment intent will be created after the order is
// placed, and this is where the future online-payment flow will hook in.
type PaymentChoice = 'pay_later_cash' | 'pay_later_card' | 'pay_online';

export const Cart: React.FC = () => {
    const items = useCartStore((s) => s.items);
    const setQuantity = useCartStore((s) => s.setQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const clear = useCartStore((s) => s.clear);
    const orderType = useCartStore((s) => s.orderType);
    const setOrderType = useCartStore((s) => s.setOrderType);
    const bookingId = useCartStore((s) => s.bookingId);

    const cartCount = useCartStore(selectCartCount);
    const subtotal = useCartStore(selectCartSubtotal);

    const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('pay_later_cash');
    const [contact, setContact] = useState({ name: '', phone: '', email: '' });
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [comment, setComment] = useState('');

    const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const createOrder = useCreateOrder();

    const deliveryFeePreview =
        orderType === 'DELIVERY' ? DELIVERY_FEE_PREVIEW : 0;
    const totalPreview = subtotal + deliveryFeePreview;

    const isPreorderForBooking = orderType === 'PREORDER_FOR_BOOKING';

    const canSubmit = useMemo(() => {
        if (items.length === 0) return false;
        if (!contact.name.trim()) return false;
        if (!isKgPhoneComplete(contact.phone)) return false;
        if (orderType === 'DELIVERY' && !deliveryAddress.trim()) return false;
        if (isPreorderForBooking && !bookingId) return false;
        return true;
    }, [items.length, contact, orderType, deliveryAddress, isPreorderForBooking, bookingId]);

    const handleSubmit = async () => {
        setSubmitError(null);

        const dto: CreateOrderDto = {
            type: orderType,
            guestName: contact.name.trim(),
            contactPhone: contact.phone.trim(),
            ...(contact.email.trim() ? { contactEmail: contact.email.trim() } : {}),
            ...(comment.trim() ? { comment: comment.trim() } : {}),
            ...(orderType === 'DELIVERY' ? { deliveryAddress: deliveryAddress.trim() } : {}),
            ...(isPreorderForBooking && bookingId ? { bookingId } : {}),
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        };

        try {
            const order = await createOrder.mutateAsync(dto);
            setPlacedOrder(order);
            clear();

            // Payment-ready hook: when the user picks "pay online", the next
            // step is to call `useInitiatePayment({ targetType: 'ORDER', targetId: order.id, method: 'CARD' })`
            // and redirect to `payment.redirectUrl`. Intentionally left as a
            // placeholder while no real gateway is wired up — the backend
            // returns REQUIRES_ACTION + a stub URL via the Noop provider,
            // which would break the guest flow if we followed it today.
            if (paymentChoice === 'pay_online') {
                // TODO: initiate payment + redirect once a real adapter is live.
                // See back/docs/PAYMENT_INTEGRATION.md.
            }
        } catch (err) {
            setSubmitError(getErrMsg(err));
        }
    };

    // ─── Success state ─────────────────────────────────────────────────────

    if (placedOrder) {
        return <OrderPlacedSuccess order={placedOrder} />;
    }

    // ─── Empty state ───────────────────────────────────────────────────────

    if (items.length === 0) {
        return <EmptyCart />;
    }

    // ─── Main ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Hero />

            <section className="py-12">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: items + order type */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-2xl font-display font-bold text-gray-900">
                                    Товары в корзине ({cartCount})
                                </h2>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Очистить корзину?')) clear();
                                    }}
                                    className="text-red-500 hover:text-red-600 flex items-center gap-2 text-xs sm:text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Очистить
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <CartRow
                                        key={item.productId}
                                        item={item}
                                        index={index}
                                        onInc={() => setQuantity(item.productId, item.quantity + 1)}
                                        onDec={() => setQuantity(item.productId, item.quantity - 1)}
                                        onRemove={() => removeItem(item.productId)}
                                    />
                                ))}
                            </div>

                            {/* Order type picker */}
                            <div className="bg-white rounded-2xl shadow-lg p-5">
                                <h3 className="font-medium text-gray-700 mb-3">Тип заказа</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <OrderTypeButton
                                        active={orderType === 'DELIVERY'}
                                        onClick={() => setOrderType('DELIVERY')}
                                        icon={<Truck className="w-5 h-5" />}
                                        label="Доставка"
                                        hint="К вам домой"
                                    />
                                    <OrderTypeButton
                                        active={orderType === 'PICKUP'}
                                        onClick={() => setOrderType('PICKUP')}
                                        icon={<MapPin className="w-5 h-5" />}
                                        label="Самовывоз"
                                        hint="Заберёте сами"
                                    />
                                    <OrderTypeButton
                                        active={orderType === 'PREORDER_FOR_BOOKING'}
                                        onClick={() => setOrderType('PREORDER_FOR_BOOKING')}
                                        icon={<CalendarClock className="w-5 h-5" />}
                                        label="К брони"
                                        hint="Предзаказ к столику"
                                        disabled={!bookingId}
                                    />
                                </div>

                                {isPreorderForBooking && !bookingId && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Сначала создайте бронь на странице{' '}
                                            <Link to="/reservations" className="underline font-medium">
                                                Бронирование
                                            </Link>
                                            .
                                        </span>
                                    </div>
                                )}
                                {isPreorderForBooking && bookingId && (
                                    <p className="mt-3 text-xs text-gray-500">
                                        Заказ будет привязан к вашей брони.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: checkout summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 space-y-6">
                                <h2 className="text-xl font-display font-bold text-gray-900">
                                    Оформление заказа
                                </h2>

                                {/* Customer */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-700 text-sm">
                                        Контактные данные
                                    </h3>
                                    <FieldWithIcon icon={<User className="w-4 h-4 text-gray-400" />}>
                                        <input
                                            type="text"
                                            placeholder="Ваше имя"
                                            value={contact.name}
                                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                        />
                                    </FieldWithIcon>
                                    <FieldWithIcon icon={<Phone className="w-4 h-4 text-gray-400" />}>
                                        <input
                                            type="tel"
                                            inputMode="tel"
                                            placeholder="+996 XXX XXX-XXX"
                                            value={contact.phone}
                                            maxLength={17}
                                            onChange={(e) =>
                                                setContact({ ...contact, phone: formatKgPhone(e.target.value) })
                                            }
                                            onFocus={(e) => {
                                                if (!e.target.value) setContact({ ...contact, phone: '+996 ' });
                                            }}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                        />
                                    </FieldWithIcon>
                                    {contact.phone && !isKgPhoneComplete(contact.phone) && (
                                        <p className="text-xs text-amber-600">
                                            Номер должен содержать 9 цифр после +996
                                        </p>
                                    )}
                                    <FieldWithIcon icon={<Mail className="w-4 h-4 text-gray-400" />}>
                                        <input
                                            type="email"
                                            placeholder="Email (необязательно)"
                                            value={contact.email}
                                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                        />
                                    </FieldWithIcon>
                                </div>

                                {orderType === 'DELIVERY' && (
                                    <FieldWithIcon icon={<MapPin className="w-4 h-4 text-gray-400" />}>
                                        <input
                                            type="text"
                                            placeholder="Адрес доставки"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                        />
                                    </FieldWithIcon>
                                )}

                                <FieldWithIcon icon={<MessageSquare className="w-4 h-4 text-gray-400" />}>
                                    <textarea
                                        rows={2}
                                        placeholder="Комментарий к заказу (аллергии, пожелания)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                                    />
                                </FieldWithIcon>

                                {/* Payment */}
                                <div>
                                    <h3 className="font-medium text-gray-700 text-sm mb-3">
                                        Способ оплаты
                                    </h3>
                                    <div className="space-y-2">
                                        <PaymentChoiceButton
                                            active={paymentChoice === 'pay_later_cash'}
                                            onClick={() => setPaymentChoice('pay_later_cash')}
                                            icon={<Wallet className="w-4 h-4" />}
                                            title="Наличными"
                                            hint="Оплата при получении"
                                        />
                                        <PaymentChoiceButton
                                            active={paymentChoice === 'pay_later_card'}
                                            onClick={() => setPaymentChoice('pay_later_card')}
                                            icon={<CreditCard className="w-4 h-4" />}
                                            title="Картой курьеру"
                                            hint="Оплата при получении"
                                        />
                                        <PaymentChoiceButton
                                            active={paymentChoice === 'pay_online'}
                                            onClick={() => setPaymentChoice('pay_online')}
                                            icon={<Shield className="w-4 h-4" />}
                                            title="Онлайн-оплата"
                                            hint="Скоро: MBank, O!Bank, QR"
                                            badge="Скоро"
                                        />
                                    </div>
                                </div>

                                {/* Totals preview (server is authoritative) */}
                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <Row label="Сумма позиций" value={`${subtotal.toLocaleString('ru-RU')} сом`} />
                                    <Row
                                        label="Доставка"
                                        value={
                                            orderType === 'DELIVERY'
                                                ? `${deliveryFeePreview} сом`
                                                : 'Не требуется'
                                        }
                                    />
                                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-lg">
                                        <span>Итого</span>
                                        <span className="text-accent-600">
                                            {totalPreview.toLocaleString('ru-RU')} сом
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 pt-1">
                                        Итоговая сумма рассчитывается на сервере.
                                    </p>
                                </div>

                                {submitError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">{submitError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || createOrder.isPending}
                                    className="w-full bg-accent-500 text-white py-4 rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {createOrder.isPending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Оформление…
                                        </>
                                    ) : (
                                        <>
                                            Оформить заказ
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield className="w-4 h-4" />
                                    <span>Безопасное оформление</span>
                                    <span>•</span>
                                    <Clock className="w-4 h-4" />
                                    <span>Быстрое подтверждение</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const Hero: React.FC = () => (
    <section className="relative h-[260px] sm:h-[300px] pt-10 overflow-hidden">
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
                    <h1 className="text-3xl sm:text-5xl font-display font-bold mb-2">Корзина</h1>
                    <p className="text-base sm:text-xl text-gray-200">
                        Проверьте ваш заказ перед оформлением
                    </p>
                </motion.div>
            </div>
        </div>
    </section>
);

const EmptyCart: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 relative">
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
            className="relative text-center max-w-md"
        >
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-3">Корзина пуста</h2>
            <p className="text-white mb-8">
                Добавьте блюда из нашего меню, чтобы оформить заказ
            </p>
            <Link to="/menu">
                <button className="px-8 py-4 bg-accent-500 text-white cursor-pointer rounded-xl font-medium hover:bg-accent-600 transition-colors inline-flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Перейти в меню
                </button>
            </Link>
        </motion.div>
    </div>
);

interface OrderPlacedProps {
    order: Order;
}
const OrderPlacedSuccess: React.FC<OrderPlacedProps> = ({ order }) => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                Заказ оформлен!
            </h2>
            <p className="text-gray-600 mb-6">
                Администратор свяжется с вами для подтверждения.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-2 text-left">
                <p className="text-sm font-medium text-gray-700 mb-1">Номер заказа:</p>
                <p className="text-2xl font-bold text-accent-600">{order.orderNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-1">Итого:</p>
                <p className="text-xl font-bold text-gray-900">
                    {order.total.toLocaleString('ru-RU')} {order.currency}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/" className="flex-1">
                    <button className="w-full px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        На главную
                    </button>
                </Link>
                <Link to="/menu" className="flex-1">
                    <button className="w-full px-6 py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors">
                        В меню
                    </button>
                </Link>
            </div>
        </motion.div>
    </div>
);

interface CartRowProps {
    item: CartItem;
    index: number;
    onInc: () => void;
    onDec: () => void;
    onRemove: () => void;
}
const CartRow: React.FC<CartRowProps> = ({ item, index, onInc, onDec, onRemove }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow"
    >
        <div className="flex gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                    src={item.image ?? PLACEHOLDER_IMAGE}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                        {item.titleEn && (
                            <p className="text-sm text-gray-500 truncate">{item.titleEn}</p>
                        )}
                        {item.subtitle && (
                            <p className="text-xs text-gray-400 line-clamp-1">{item.subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onRemove}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Удалить"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                            onClick={onDec}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-lg"
                            aria-label="Уменьшить"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                            onClick={onInc}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-lg"
                            aria-label="Увеличить"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-gray-900">
                            {(item.price * item.quantity).toLocaleString('ru-RU')} сом
                        </div>
                        {item.quantity > 1 && (
                            <div className="text-xs text-gray-400">
                                {item.price.toLocaleString('ru-RU')} × {item.quantity}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

interface OrderTypeButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    hint: string;
    disabled?: boolean;
}
const OrderTypeButton: React.FC<OrderTypeButtonProps> = ({
    active, onClick, icon, label, hint, disabled,
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`p-3 rounded-xl border-2 text-left transition-all ${
            active
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-accent-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`mb-1 ${active ? 'text-accent-600' : 'text-gray-500'}`}>{icon}</div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{hint}</div>
    </button>
);

interface PaymentChoiceButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    hint: string;
    badge?: string;
}
const PaymentChoiceButton: React.FC<PaymentChoiceButtonProps> = ({
    active, onClick, icon, title, hint, badge,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
            active
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-accent-300'
        }`}
    >
        <div className={active ? 'text-accent-600' : 'text-gray-500'}>{icon}</div>
        <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {title}
                {badge && (
                    <span className="px-2 py-0.5 text-[10px] bg-gray-900 text-white rounded-full">
                        {badge}
                    </span>
                )}
            </div>
            <div className="text-xs text-gray-500">{hint}</div>
        </div>
    </button>
);

const FieldWithIcon: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
    icon, children,
}) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>
        {children}
    </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

// Helper to accept OrderType explicitly in stories or tests.
export type { OrderType };
