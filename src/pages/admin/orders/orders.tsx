import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    ArrowUpDownIcon,
    CalendarIcon,
    CalendarDaysIcon,
    ChefHatIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CreditCardIcon,
    EyeIcon,
    FilterIcon,
    HashIcon,
    HourglassIcon,
    PackageCheckIcon,
    PackageIcon,
    PhoneIcon,
    RefreshCwIcon,
    SearchIcon,
    ShoppingBagIcon,
    TruckIcon,
    UserIcon,
    XCircleIcon,
} from 'lucide-react';
import {
    ORDER_VALID_TRANSITIONS,
    useAdminOrders,
    useUpdateOrderStatus,
} from '../../../entities/orders/api.ts';
import type { AdminOrdersListParams } from '../../../entities/orders/api.ts';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '../../../shared/ui/admin/status-badge.tsx';
import { StatCard } from '../../../shared/ui/admin/stat-card.tsx';
import { useDashboardSummary } from '../../../entities/customers/api.ts';
import type { Order, OrderStatus, OrderType, PaymentStatus } from '../../../shared/api/types.ts';

const PAGE_LIMIT = 15;

function getDateLabel(iso: string): string {
    const d = new Date(iso);
    if (isToday(d)) return 'Сегодня';
    if (isTomorrow(d)) return 'Завтра';
    if (isThisWeek(d)) return format(d, 'EEEE', { locale: ru });
    return format(d, 'dd MMM yyyy', { locale: ru });
}

function headlinePaymentStatus(o: Order): PaymentStatus | null {
    if (!o.payments?.length) return null;
    return o.payments[0].status;
}

const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; Icon: React.ComponentType<{ className?: string }>; color: string }> = {
    DELIVERY:             { label: 'Доставка',        Icon: TruckIcon,   color: 'text-indigo-600' },
    PICKUP:               { label: 'Самовывоз',       Icon: PackageIcon, color: 'text-amber-600' },
    PREORDER_FOR_BOOKING: { label: 'К брони',         Icon: CalendarIcon, color: 'text-emerald-600' },
};

export const AdminOrders: React.FC = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<AdminOrdersListParams>({
        page: 1,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortDir: 'desc',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all' | 'none'>('all');

    const { data: summary } = useDashboardSummary();
    const { data: listData, isLoading, refetch, isFetching } = useAdminOrders(filters);
    const transitionMutation = useUpdateOrderStatus();

    const all = listData?.items ?? [];
    const items = paymentFilter === 'all'
        ? all
        : all.filter((o) => {
            const ps = headlinePaymentStatus(o);
            if (paymentFilter === 'none') return ps == null;
            return ps === paymentFilter;
        });
    const meta = listData?.meta;
    const total = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const page = filters.page ?? 1;

    const update = (patch: Partial<AdminOrdersListParams>) =>
        setFilters((prev) => ({ ...prev, page: 1, ...patch }));

    const quickTransition = async (order: Order, to: OrderStatus) => {
        await transitionMutation.mutateAsync({ id: order.id, dto: { status: to } });
        await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                            <ShoppingBagIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Заказы
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-1">
                        Онлайн-заказы: доставка, самовывоз, предзаказы к бронированиям
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                >
                    <RefreshCwIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Обновить</span>
                </button>
            </div>

            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        label="Сегодня"
                        value={summary.orders.today}
                        icon={<CalendarDaysIcon className="w-5 h-5" />}
                        gradient="from-amber-500 to-orange-500"
                    />
                    <StatCard
                        label="Ожидают"
                        value={summary.orders.pending}
                        icon={<HourglassIcon className="w-5 h-5" />}
                        gradient="from-amber-500 to-orange-500"
                        onClick={() => update({ status: 'PENDING_CONFIRMATION' })}
                    />
                    <StatCard
                        label="Ждут оплаты"
                        value={summary.orders.awaitingPayment}
                        icon={<CreditCardIcon className="w-5 h-5" />}
                        gradient="from-orange-500 to-red-500"
                        onClick={() => update({ status: 'AWAITING_PAYMENT' })}
                    />
                    <StatCard
                        label="Готовятся"
                        value={summary.orders.byStatus.PREPARING ?? 0}
                        icon={<ChefHatIcon className="w-5 h-5" />}
                        gradient="from-sky-500 to-blue-500"
                        onClick={() => update({ status: 'PREPARING' })}
                    />
                    <StatCard
                        label="Завершены"
                        value={summary.orders.byStatus.COMPLETED ?? 0}
                        icon={<PackageCheckIcon className="w-5 h-5" />}
                        gradient="from-emerald-500 to-teal-500"
                        onClick={() => update({ status: 'COMPLETED' })}
                    />
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                <button
                    type="button"
                    onClick={() => setShowFilters((s) => !s)}
                    className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <FilterIcon className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Фильтры</span>
                    </div>
                    <ChevronRightIcon
                        className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-90' : ''}`}
                    />
                </button>

                {showFilters && (
                    <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Имя клиента..."
                                    value={filters.name ?? ''}
                                    onChange={(e) => update({ name: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Телефон..."
                                    value={filters.phone ?? ''}
                                    onChange={(e) => update({ phone: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filters.status ?? 'all'}
                                onChange={(e) =>
                                    update({
                                        status: e.target.value === 'all' ? undefined : (e.target.value as OrderStatus),
                                    })
                                }
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                            >
                                <option value="all">Все статусы</option>
                                <option value="DRAFT">Черновик</option>
                                <option value="PENDING_CONFIRMATION">Ожидает подтверждения</option>
                                <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                                <option value="PAID">Оплачен</option>
                                <option value="CONFIRMED">Подтверждён</option>
                                <option value="PREPARING">Готовится</option>
                                <option value="READY">Готов</option>
                                <option value="DELIVERED">Доставлен</option>
                                <option value="COMPLETED">Завершён</option>
                                <option value="CANCELLED">Отменён</option>
                                <option value="EXPIRED">Просрочен</option>
                            </select>
                            <select
                                value={filters.type ?? 'all'}
                                onChange={(e) =>
                                    update({
                                        type: e.target.value === 'all' ? undefined : (e.target.value as OrderType),
                                    })
                                }
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                            >
                                <option value="all">Все типы</option>
                                <option value="DELIVERY">Доставка</option>
                                <option value="PICKUP">Самовывоз</option>
                                <option value="PREORDER_FOR_BOOKING">Предзаказ к брони</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.dateFrom ?? ''}
                                    onChange={(e) => update({ dateFrom: e.target.value || undefined })}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl"
                                    placeholder="С"
                                />
                                <input
                                    type="date"
                                    value={filters.dateTo ?? ''}
                                    onChange={(e) => update({ dateTo: e.target.value || undefined })}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl"
                                    placeholder="По"
                                />
                            </div>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                            >
                                <option value="all">Любая оплата</option>
                                <option value="none">Без оплаты</option>
                                <option value="PENDING">Ожидает</option>
                                <option value="REQUIRES_ACTION">Требует действия</option>
                                <option value="PAID">Оплачено</option>
                                <option value="FAILED">Ошибка</option>
                                <option value="CANCELLED">Отменено</option>
                                <option value="REFUNDED">Возврат</option>
                                <option value="EXPIRED">Истёк</option>
                            </select>
                            <select
                                value={filters.sortBy ?? 'createdAt'}
                                onChange={(e) => update({ sortBy: e.target.value as AdminOrdersListParams['sortBy'] })}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                            >
                                <option value="createdAt">По дате</option>
                                <option value="total">По сумме</option>
                                <option value="status">По статусу</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => update({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                <ArrowUpDownIcon className="w-4 h-4" />
                                {filters.sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <ShoppingBagIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Заказы не найдены</p>
                    <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры фильтрации</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <Th>№</Th>
                                    <Th>Клиент</Th>
                                    <Th>Тип</Th>
                                    <Th>Позиций</Th>
                                    <Th align="right">Сумма</Th>
                                    <Th>Статус</Th>
                                    <Th>Оплата</Th>
                                    <Th>Создан</Th>
                                    <Th align="right">Действия</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((o) => {
                                    const typeCfg = ORDER_TYPE_CONFIG[o.type];
                                    const nextStatuses = ORDER_VALID_TRANSITIONS[o.status] ?? [];
                                    const canConfirm = nextStatuses.includes('CONFIRMED');
                                    const canCancel = nextStatuses.includes('CANCELLED');
                                    return (
                                        <tr
                                            key={o.id}
                                            className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-transparent transition-all group"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
                                                    <HashIcon className="w-3 h-3" />
                                                    {o.orderNumber}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/admin/customers/${encodeURIComponent(o.contactPhone)}`}
                                                    className="flex items-center gap-2 hover:text-amber-600 transition-colors"
                                                >
                                                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{o.guestName}</span>
                                                </Link>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <PhoneIcon className="w-3 h-3" />
                                                    {o.contactPhone}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-sm ${typeCfg.color}`}>
                                                    <typeCfg.Icon className="w-3.5 h-3.5" />
                                                    {typeCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{o.items.length}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="font-semibold text-gray-900">
                                                    {o.total.toLocaleString('ru-RU')} {o.currency}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <OrderStatusBadge status={o.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <PaymentStatusBadge status={headlinePaymentStatus(o)} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{getDateLabel(o.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <ClockIcon className="w-3 h-3 text-gray-400" />
                                                    {format(new Date(o.createdAt), 'HH:mm', { locale: ru })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to={`/admin/orders/${o.id}`}
                                                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50"
                                                        title="Открыть"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Link>
                                                    {canConfirm && (
                                                        <button
                                                            type="button"
                                                            onClick={() => quickTransition(o, 'CONFIRMED')}
                                                            disabled={transitionMutation.isPending}
                                                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 disabled:opacity-30"
                                                            title="Подтвердить"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {canCancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() => quickTransition(o, 'CANCELLED')}
                                                            disabled={transitionMutation.isPending}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                                                            title="Отменить"
                                                        >
                                                            <XCircleIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <span className="text-sm text-gray-500">Всего: {total} заказов</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => update({ page: Math.max(1, page - 1) })}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                    <span className="text-sm">Назад</span>
                                </button>
                                <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => update({ page: Math.min(totalPages, page + 1) })}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                                >
                                    <span className="text-sm">Вперёд</span>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({
    children, align = 'left',
}) => (
    <th
        className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
            align === 'right' ? 'text-right' : 'text-left'
        }`}
    >
        {children}
    </th>
);
