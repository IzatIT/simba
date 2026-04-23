import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    ArrowUpDownIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CreditCardIcon,
    FilterIcon,
    HourglassIcon,
    PhoneIcon,
    SearchIcon,
    ShoppingBagIcon,
    UsersIcon,
    Wallet2Icon,
} from 'lucide-react';
import { useCustomers, useDashboardSummary } from '../../../entities/customers/api.ts';
import type { CustomersListParams } from '../../../entities/customers/api.ts';
import { StatCard } from '../../../shared/ui/admin/stat-card.tsx';

const PAGE_LIMIT = 20;

export const AdminCustomers: React.FC = () => {
    const [filters, setFilters] = useState<CustomersListParams>({
        page: 1,
        limit: PAGE_LIMIT,
        activity: 'all',
        sortBy: 'lastActivity',
        sortDir: 'desc',
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: summary } = useDashboardSummary();
    const { data: listData, isLoading } = useCustomers(filters);

    const items = listData?.items ?? [];
    const meta = listData?.meta;
    const total = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const page = filters.page ?? 1;

    const update = (patch: Partial<CustomersListParams>) =>
        setFilters((prev) => ({ ...prev, page: 1, ...patch }));

    return (
        <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Клиенты
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-1">
                        Объединённая история заказов и бронирований по номеру телефона
                    </p>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        label="Всего клиентов"
                        value={summary.customers.total}
                        icon={<UsersIcon className="w-5 h-5" />}
                        gradient="from-amber-500 to-orange-500"
                    />
                    <StatCard
                        label="Заказов сегодня"
                        value={summary.orders.today}
                        icon={<ShoppingBagIcon className="w-5 h-5" />}
                        gradient="from-indigo-500 to-purple-500"
                    />
                    <StatCard
                        label="Броней сегодня"
                        value={summary.bookings.today}
                        icon={<CalendarIcon className="w-5 h-5" />}
                        gradient="from-green-500 to-emerald-500"
                    />
                    <StatCard
                        label="Ждут оплаты"
                        value={summary.orders.awaitingPayment + summary.bookings.awaitingPayment}
                        icon={<CreditCardIcon className="w-5 h-5" />}
                        gradient="from-orange-500 to-red-500"
                    />
                    <StatCard
                        label="Выручка сегодня"
                        value={`${summary.revenue.todayTotal.toLocaleString('ru-RU')} ${summary.revenue.currency}`}
                        icon={<Wallet2Icon className="w-5 h-5" />}
                        gradient="from-emerald-500 to-teal-500"
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
                        <span className="font-medium text-gray-700">Поиск и фильтры</span>
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
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Телефон..."
                                    value={filters.phone ?? ''}
                                    onChange={(e) => update({ phone: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filters.activity ?? 'all'}
                                onChange={(e) => update({ activity: e.target.value as CustomersListParams['activity'] })}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                            >
                                <option value="all">Все клиенты</option>
                                <option value="with_orders">С заказами</option>
                                <option value="with_bookings">С бронированиями</option>
                                <option value="without_activity">Без активности</option>
                            </select>
                            <div className="flex gap-2">
                                <select
                                    value={filters.sortBy ?? 'lastActivity'}
                                    onChange={(e) => update({ sortBy: e.target.value as CustomersListParams['sortBy'] })}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                                >
                                    <option value="lastActivity">Последняя активность</option>
                                    <option value="firstSeen">Первое обращение</option>
                                    <option value="totalSpent">Сумма</option>
                                    <option value="orderCount">Заказы</option>
                                    <option value="bookingCount">Брони</option>
                                    <option value="guestName">Имя</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => update({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    title={filters.sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'}
                                >
                                    <ArrowUpDownIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <HourglassIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Клиенты не найдены</p>
                    <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры фильтрации</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <Th>Клиент</Th>
                                    <Th>Тип</Th>
                                    <Th align="right">Заказы</Th>
                                    <Th align="right">Брони</Th>
                                    <Th align="right">Сумма</Th>
                                    <Th>Первое обращение</Th>
                                    <Th>Последняя активность</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((c) => (
                                    <tr
                                        key={c.phone}
                                        className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/admin/customers/${encodeURIComponent(c.phone)}`}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold flex items-center justify-center">
                                                    {c.guestName.slice(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 hover:text-amber-600 transition-colors">
                                                        {c.guestName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <PhoneIcon className="w-3 h-3" />
                                                        {c.phone}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                                    c.type === 'REGISTERED'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {c.type === 'REGISTERED' ? 'Клиент' : 'Гость'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={
                                                    c.orderCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-400'
                                                }
                                            >
                                                {c.orderCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={
                                                    c.bookingCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-400'
                                                }
                                            >
                                                {c.bookingCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {c.totalSpent > 0
                                                ? `${c.totalSpent.toLocaleString('ru-RU')} ${c.currency}`
                                                : <span className="text-gray-400 font-normal">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {format(new Date(c.firstSeen), 'dd MMM yyyy', { locale: ru })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {format(new Date(c.lastActivity), 'dd MMM yyyy HH:mm', { locale: ru })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <span className="text-sm text-gray-500">Всего: {total} клиентов</span>
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
