import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    CreditCardIcon,
    ReceiptIcon,
    ShoppingBagIcon,
    UsersIcon,
} from 'lucide-react';
import { useCustomerProfile } from '../../../entities/customers/api.ts';
import { ContactInfoBlock } from '../../../shared/ui/admin/contact-info.tsx';
import { StatCard } from '../../../shared/ui/admin/stat-card.tsx';
import {
    BookingStatusBadge,
    OrderStatusBadge,
    PaymentStatusBadge,
} from '../../../shared/ui/admin/status-badge.tsx';
import type { Booking, Order, PaymentStatus } from '../../../shared/api/types.ts';

function orderPaymentStatus(o: Order): PaymentStatus | null {
    // The "headline" payment status for an order: last non-refunded payment,
    // else null (meaning no payment attempt yet — rendered as Not required).
    if (!o.payments?.length) return null;
    return o.payments[0].status;
}

function bookingPaymentStatus(b: Booking): PaymentStatus | null {
    if (!b.payments?.length) return null;
    return b.payments[0].status;
}

export const AdminCustomerDetail: React.FC = () => {
    const { phone: rawPhone } = useParams<{ phone: string }>();
    const phone = rawPhone ? decodeURIComponent(rawPhone) : null;
    const { data, isLoading, error } = useCustomerProfile(phone);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4">
                <Link
                    to="/admin/customers"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 mb-4"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> К списку клиентов
                </Link>
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <h2 className="text-lg font-semibold text-gray-700">Клиент не найден</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Нет истории заказов или бронирований для этого телефона.
                    </p>
                </div>
            </div>
        );
    }

    const { summary, orders, bookings } = data;
    const currency = summary.currency || 'KGS';

    return (
        <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
            <Link
                to="/admin/customers"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 mb-4"
            >
                <ArrowLeftIcon className="w-4 h-4" /> К списку клиентов
            </Link>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <ContactInfoBlock
                        name={summary.guestName}
                        phone={summary.phone}
                        email={summary.contactEmail}
                        customerType={summary.type}
                    />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">История</h3>
                    <div className="space-y-2 text-sm">
                        <Row
                            label="Первое обращение"
                            value={format(new Date(summary.firstSeen), 'dd MMM yyyy', { locale: ru })}
                        />
                        <Row
                            label="Последняя активность"
                            value={format(new Date(summary.lastActivity), 'dd MMM yyyy HH:mm', { locale: ru })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Всего заказов"
                    value={summary.orderCount}
                    icon={<ShoppingBagIcon className="w-5 h-5" />}
                    gradient="from-indigo-500 to-purple-500"
                />
                <StatCard
                    label="Всего броней"
                    value={summary.bookingCount}
                    icon={<CalendarIcon className="w-5 h-5" />}
                    gradient="from-green-500 to-emerald-500"
                />
                <StatCard
                    label="Общая сумма"
                    value={`${summary.totalSpent.toLocaleString('ru-RU')} ${currency}`}
                    icon={<ReceiptIcon className="w-5 h-5" />}
                    gradient="from-amber-500 to-orange-500"
                />
                <StatCard
                    label="Средний чек"
                    value={
                        summary.averageCheck > 0
                            ? `${Math.round(summary.averageCheck).toLocaleString('ru-RU')} ${currency}`
                            : '—'
                    }
                    icon={<CreditCardIcon className="w-5 h-5" />}
                    gradient="from-rose-500 to-pink-500"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <OrdersHistory orders={orders} />
                <BookingsHistory bookings={bookings} />
            </div>
        </div>
    );
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const OrdersHistory: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">История заказов</h3>
            <span className="ml-auto text-xs text-gray-400">{orders.length}</span>
        </header>
        {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">Нет заказов</div>
        ) : (
            <ul className="divide-y divide-gray-100">
                {orders.map((o) => (
                    <li key={o.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                        <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs text-gray-500">{o.orderNumber}</span>
                                    <OrderStatusBadge status={o.status} />
                                    <PaymentStatusBadge status={orderPaymentStatus(o)} />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <OrderTypeLabel type={o.type} />
                                    <span>•</span>
                                    <ClockIcon className="w-3 h-3" />
                                    {format(new Date(o.createdAt), 'dd MMM HH:mm', { locale: ru })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                    {o.total.toLocaleString('ru-RU')} {o.currency}
                                </div>
                                <div className="text-xs text-gray-400">{o.items.length} поз.</div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </section>
);

const BookingsHistory: React.FC<{ bookings: Booking[] }> = ({ bookings }) => (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-800">История бронирований</h3>
            <span className="ml-auto text-xs text-gray-400">{bookings.length}</span>
        </header>
        {bookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">Нет бронирований</div>
        ) : (
            <ul className="divide-y divide-gray-100">
                {bookings.map((b) => {
                    const preorderSum = (b.preorderItems ?? []).reduce(
                        (sum, i) => sum + Number(i.unitPrice) * i.quantity,
                        0,
                    );
                    return (
                        <li key={b.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs text-gray-500">{b.bookingNumber}</span>
                                        <BookingStatusBadge status={b.status} />
                                        <PaymentStatusBadge status={bookingPaymentStatus(b)} />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {format(new Date(b.date), 'dd MMM yyyy', { locale: ru })}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" /> {b.time}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <UsersIcon className="w-3 h-3" /> {b.peopleCount}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {b.hasPreorder && preorderSum > 0 ? (
                                        <>
                                            <div className="font-semibold text-gray-900">
                                                {preorderSum.toLocaleString('ru-RU')} сом
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {b.preorderItems?.length ?? 0} поз.
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400">Без предзаказа</span>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
    </section>
);

const OrderTypeLabel: React.FC<{ type: Order['type'] }> = ({ type }) => {
    const label =
        type === 'DELIVERY' ? 'Доставка' :
        type === 'PICKUP' ? 'Самовывоз' :
        'Предзаказ к брони';
    return <span className="inline-flex items-center gap-1">{label}</span>;
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);
