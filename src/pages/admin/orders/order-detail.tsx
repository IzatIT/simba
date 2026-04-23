import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    ArrowLeftIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    HashIcon,
    HistoryIcon,
    InfoIcon,
    MapPinIcon,
    PackageIcon,
    RefreshCwIcon,
    ShieldIcon,
    TruckIcon,
    XCircleIcon,
} from 'lucide-react';
import {
    ORDER_VALID_TRANSITIONS,
    useAdminOrder,
    useUpdateOrderStatus,
} from '../../../entities/orders/api.ts';
import {
    OrderStatusBadge,
    ORDER_STATUS_CONFIG,
    PaymentStatusBadge,
    PAYMENT_STATUS_CONFIG,
} from '../../../shared/ui/admin/status-badge.tsx';
import { MoneySummaryBlock } from '../../../shared/ui/admin/money-summary.tsx';
import { ContactInfoBlock } from '../../../shared/ui/admin/contact-info.tsx';
import type { Order, OrderStatus, OrderType, Payment } from '../../../shared/api/types.ts';

const TYPE_LABEL: Record<OrderType, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    DELIVERY:             { label: 'Доставка', Icon: TruckIcon },
    PICKUP:               { label: 'Самовывоз', Icon: PackageIcon },
    PREORDER_FOR_BOOKING: { label: 'Предзаказ к брони', Icon: CalendarIcon },
};

function headlinePayment(o: Order): Payment | null {
    return o.payments?.[0] ?? null;
}

export const AdminOrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading, error } = useAdminOrder(id ?? null);
    const queryClient = useQueryClient();
    const transition = useUpdateOrderStatus();

    const [comment, setComment] = useState('');
    const [pendingTarget, setPendingTarget] = useState<OrderStatus | null>(null);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4">
                <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> К заказам
                </Link>
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <PackageIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <h2 className="text-lg font-semibold text-gray-700">Заказ не найден</h2>
                </div>
            </div>
        );
    }

    const typeCfg = TYPE_LABEL[order.type];
    const payment = headlinePayment(order);
    const nextStatuses = ORDER_VALID_TRANSITIONS[order.status] ?? [];

    const handleTransition = async (to: OrderStatus) => {
        setPendingTarget(to);
        try {
            await transition.mutateAsync({
                id: order.id,
                dto: { status: to, ...(comment.trim() ? { comment: comment.trim() } : {}) },
            });
            await queryClient.invalidateQueries({ queryKey: ['admin-order', order.id] });
            await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setComment('');
        } finally {
            setPendingTarget(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
            <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4"
            >
                <ArrowLeftIcon className="w-4 h-4" /> К заказам
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <HashIcon className="w-4 h-4" />
                            <span className="font-mono">{order.orderNumber}</span>
                            <span>•</span>
                            <typeCfg.Icon className="w-4 h-4" />
                            <span>{typeCfg.label}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Заказ на {order.total.toLocaleString('ru-RU')} {order.currency}
                        </h1>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <OrderStatusBadge status={order.status} size="md" />
                            <PaymentStatusBadge status={payment?.status ?? null} size="md" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                            <ClockIcon className="w-3 h-3" />
                            Создан {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                        </div>
                    </div>
                    {nextStatuses.length > 0 && (
                        <div className="w-full sm:w-auto">
                            <label className="block text-xs text-gray-500 mb-1">
                                Изменить статус
                            </label>
                            <input
                                type="text"
                                placeholder="Комментарий (необязательно)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 mb-2"
                            />
                            <div className="flex flex-wrap gap-2">
                                {nextStatuses.map((to) => {
                                    const cfg = ORDER_STATUS_CONFIG[to];
                                    const busy = pendingTarget === to;
                                    return (
                                        <button
                                            key={to}
                                            type="button"
                                            onClick={() => handleTransition(to)}
                                            disabled={transition.isPending}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${cfg.badge} hover:shadow-sm disabled:opacity-50`}
                                        >
                                            {busy ? (
                                                <RefreshCwIcon className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <cfg.Icon className="w-3 h-3" />
                                            )}
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ContactInfoBlock
                        name={order.guestName}
                        phone={order.contactPhone}
                        email={order.contactEmail}
                    />
                    <Link
                        to={`/admin/customers/${encodeURIComponent(order.contactPhone)}`}
                        className="inline-flex items-center gap-2 text-sm text-amber-600 hover:underline"
                    >
                        → Перейти к клиенту
                    </Link>

                    {order.type === 'DELIVERY' && order.deliveryAddress && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-indigo-500" />
                                Адрес доставки
                            </h3>
                            <p className="text-gray-800">{order.deliveryAddress}</p>
                            {order.scheduledFor && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Доставка к:{' '}
                                    {format(new Date(order.scheduledFor), 'dd MMM yyyy HH:mm', { locale: ru })}
                                </p>
                            )}
                        </div>
                    )}

                    {order.type === 'PREORDER_FOR_BOOKING' && order.booking && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                Связано с бронью
                            </h3>
                            <div className="text-sm">
                                <div className="font-mono text-gray-500">{order.booking.bookingNumber}</div>
                                <div className="text-gray-800">
                                    {format(new Date(order.booking.date), 'dd MMM yyyy', { locale: ru })} в{' '}
                                    {order.booking.time}
                                </div>
                            </div>
                        </div>
                    )}

                    {order.comment && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                            <div className="flex items-center gap-2 font-medium mb-1">
                                <InfoIcon className="w-4 h-4" /> Комментарий клиента
                            </div>
                            <p className="whitespace-pre-wrap">{order.comment}</p>
                        </div>
                    )}

                    <ItemsBlock order={order} />
                </div>

                <div className="space-y-6">
                    <MoneySummaryBlock
                        title="Финансовая сводка"
                        currency={order.currency}
                        rows={[
                            { label: 'Сумма позиций', value: order.subtotal },
                            ...(order.deliveryFee > 0 ? [{ label: 'Доставка', value: order.deliveryFee }] : []),
                            ...(order.serviceFee > 0 ? [{ label: 'Сервисный сбор', value: order.serviceFee }] : []),
                            ...(order.discountAmount > 0
                                ? [{ label: 'Скидка', value: order.discountAmount, negative: true }]
                                : []),
                            { label: 'Итого', value: order.total, emphasized: true },
                        ]}
                    />

                    <PaymentBlock payment={payment} currency={order.currency} />

                    <StatusHistoryPlaceholder order={order} />
                </div>
            </div>
        </div>
    );
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const ItemsBlock: React.FC<{ order: Order }> = ({ order }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <PackageIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Состав заказа</h3>
            <span className="ml-auto text-xs text-gray-400">{order.items.length} позиций</span>
        </header>
        <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
                <li key={item.id} className="px-5 py-3 flex items-center gap-4">
                    {item.product?.img?.url ? (
                        <img
                            src={item.product.img.url}
                            alt={item.titleSnapshot}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <PackageIcon className="w-5 h-5 text-gray-300" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.titleSnapshot}</div>
                        <div className="text-xs text-gray-500">
                            {item.unitPrice.toLocaleString('ru-RU')} × {item.quantity}
                        </div>
                    </div>
                    <div className="font-semibold text-gray-900 whitespace-nowrap">
                        {(item.unitPrice * item.quantity).toLocaleString('ru-RU')} {order.currency}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const PaymentBlock: React.FC<{ payment: Payment | null; currency: string }> = ({ payment, currency }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-indigo-500" /> Оплата
        </h3>
        {!payment ? (
            <>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Статус</span>
                    <PaymentStatusBadge status={null} />
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Оплата ещё не инициирована. Когда клиент выберет онлайн-оплату или администратор пометит
                    оплату как полученную, тут появятся детали транзакции.
                </p>
            </>
        ) : (
            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Статус</span>
                    <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Метод</span>
                    <span className="font-medium">{payment.method}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Провайдер</span>
                    <span className="font-medium">{payment.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Сумма</span>
                    <span className="font-medium">
                        {payment.amount.toLocaleString('ru-RU')} {payment.currency || currency}
                    </span>
                </div>
                {payment.isDeposit && (
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">
                        Депозит
                    </div>
                )}
                {payment.providerPaymentId && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">ID транзакции</span>
                        <span className="font-mono text-gray-600 truncate max-w-[12rem]">
                            {payment.providerPaymentId}
                        </span>
                    </div>
                )}
                {payment.redirectUrl && (
                    <a
                        href={payment.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline mt-1"
                    >
                        <CreditCardIcon className="w-3 h-3" /> Страница оплаты
                    </a>
                )}
                <div className="text-[11px] text-gray-400 pt-3 border-t border-gray-100 mt-3 flex items-center gap-1">
                    <InfoIcon className="w-3 h-3" />
                    Онлайн-провайдер: {PAYMENT_STATUS_CONFIG[payment.status].label}.
                    Реальная интеграция подключается через adapter layer.
                </div>
            </div>
        )}
    </div>
);

const StatusHistoryPlaceholder: React.FC<{ order: Order }> = ({ order }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-indigo-500" /> История статусов
        </h3>
        <ul className="space-y-3 text-sm">
            <HistoryRow
                icon={<CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />}
                text={`Заказ создан → ${ORDER_STATUS_CONFIG.PENDING_CONFIRMATION.label}`}
                date={order.createdAt}
            />
            {order.confirmedAt && (
                <HistoryRow
                    icon={<CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />}
                    text="Подтверждён рестораном"
                    date={order.confirmedAt}
                />
            )}
            {order.paidAt && (
                <HistoryRow
                    icon={<CreditCardIcon className="w-3.5 h-3.5 text-indigo-500" />}
                    text="Оплачен"
                    date={order.paidAt}
                />
            )}
            {order.cancelledAt && (
                <HistoryRow
                    icon={<XCircleIcon className="w-3.5 h-3.5 text-red-500" />}
                    text="Отменён"
                    date={order.cancelledAt}
                />
            )}
            {order.completedAt && (
                <HistoryRow
                    icon={<CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />}
                    text="Завершён"
                    date={order.completedAt}
                />
            )}
        </ul>
    </div>
);

const HistoryRow: React.FC<{ icon: React.ReactNode; text: string; date: string }> = ({
    icon, text, date,
}) => (
    <li className="flex items-start gap-2">
        <span className="mt-0.5">{icon}</span>
        <div className="flex-1">
            <div className="text-gray-700">{text}</div>
            <div className="text-xs text-gray-400">
                {format(new Date(date), 'dd MMM yyyy HH:mm', { locale: ru })}
            </div>
        </div>
    </li>
);
