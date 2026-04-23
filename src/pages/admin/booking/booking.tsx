import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PhoneIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertCircleIcon,
    Edit2Icon,
    EyeIcon,
    SearchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HashIcon,
    RefreshCwIcon,
    TimerIcon,
    CreditCardIcon,
    BanIcon,
    PartyPopperIcon,
    HourglassIcon,
    FilterIcon,
    ArrowUpDownIcon,
    CalendarDaysIcon,
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import apiClient from '../../../shared/api/api.ts';
import { Path } from '../../../shared/api/path.ts';
import {DetailsModal, EditDetailsModal, StatusChangeModal} from "./modals.tsx";

type BookingStatus =
    | 'NEW'
    | 'PENDING_CONFIRMATION'
    | 'AWAITING_PAYMENT'
    | 'PAID'
    | 'BOOKED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'NO_SHOW';

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    NEW: ['PENDING_CONFIRMATION', 'CANCELLED', 'EXPIRED'],
    PENDING_CONFIRMATION: ['AWAITING_PAYMENT', 'BOOKED', 'CANCELLED', 'EXPIRED'],
    AWAITING_PAYMENT: ['PAID', 'CANCELLED', 'EXPIRED'],
    PAID: ['BOOKED', 'CANCELLED'],
    BOOKED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
    NO_SHOW: [],
};

const TERMINAL_STATUSES: BookingStatus[] = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'NO_SHOW'];

const statusConfig: Record<
    BookingStatus,
    { label: string; badge: string; dot: string; Icon: typeof ClockIcon; gradient: string }
> = {
    NEW: {
        label: 'Новое',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        Icon: AlertCircleIcon,
        gradient: 'from-blue-500 to-blue-600',
    },
    PENDING_CONFIRMATION: {
        label: 'Ожидает подтверждения',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        Icon: HourglassIcon,
        gradient: 'from-amber-500 to-orange-500',
    },
    AWAITING_PAYMENT: {
        label: 'Ожидает оплаты',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        Icon: CreditCardIcon,
        gradient: 'from-orange-500 to-red-500',
    },
    PAID: {
        label: 'Оплачено',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        Icon: CreditCardIcon,
        gradient: 'from-indigo-500 to-purple-500',
    },
    BOOKED: {
        label: 'Подтверждено',
        badge: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
        Icon: CheckCircleIcon,
        gradient: 'from-green-500 to-emerald-500',
    },
    COMPLETED: {
        label: 'Завершено',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        Icon: PartyPopperIcon,
        gradient: 'from-emerald-500 to-teal-500',
    },
    CANCELLED: {
        label: 'Отменено',
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        Icon: XCircleIcon,
        gradient: 'from-red-500 to-rose-500',
    },
    EXPIRED: {
        label: 'Просрочено',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
        Icon: TimerIcon,
        gradient: 'from-gray-500 to-gray-600',
    },
    NO_SHOW: {
        label: 'Не пришли',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        Icon: BanIcon,
        gradient: 'from-rose-500 to-pink-500',
    },
};

interface HandledBy {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
}

interface PreorderItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string | number;
    product?: { id: string; title: string; slug: string };
}

interface StatusHistoryRow {
    id: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    comment?: string | null;
    changedAt: string;
    changedBy?: HandledBy | null;
}

export interface BookingState {
    id: string;
    bookingNumber: string;
    date: string;
    time: string;
    peopleCount: number;
    guestName: string;
    contactPhone: string;
    extraInfo?: string | null;
    status: BookingStatus;
    managerComment?: string | null;
    hasPreorder: boolean;
    handledBy?: HandledBy | null;
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string | null;
    cancelledAt?: string | null;
    completedAt?: string | null;
    preorderItems?: PreorderItem[];
    statusHistory?: StatusHistoryRow[];
}

interface BookingStats {
    byStatus: Partial<Record<BookingStatus, number>>;
    today: number;
    thisWeek?: number;
    thisMonth?: number;
}

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? r.data : r) as T);
}

const getDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Сегодня';
    if (isTomorrow(d)) return 'Завтра';
    if (isThisWeek(d)) return format(d, 'EEEE', { locale: ru });
    return format(d, 'dd MMM yyyy', { locale: ru });
};


const totalPreorder = (items?: PreorderItem[]) =>
    (items ?? []).reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);

interface DetailsEditFormData {
    guestName: string;
    contactPhone: string;
    extraInfo: string;
    managerComment: string;
}

const PAGE_LIMIT = 10;

export const AdminBookings = () => {
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<BookingStatus | 'all'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'createdAt' | 'status'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const [selectedBooking, setSelectedBooking] = useState<BookingState | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [statusChangeFor, setStatusChangeFor] = useState<BookingState | null>(null);

    const { data: stats } = useQuery<BookingStats>({
        queryKey: ['bookings-stats'],
        queryFn: async () => {
            const response = await apiClient.get(Path.Bookings.Stats);
            return unwrap<BookingStats>(response.data);
        },
    });

    const {
        data: listData,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['bookings', { status, dateFrom, dateTo, phone, name, sortBy, sortDir, page }],
        queryFn: async () => {
            const response = await apiClient.get(Path.Bookings.List, {
                params: {
                    ...(status !== 'all' ? { status } : {}),
                    ...(dateFrom ? { dateFrom } : {}),
                    ...(dateTo ? { dateTo } : {}),
                    ...(phone ? { phone } : {}),
                    ...(name ? { name } : {}),
                    sortBy,
                    sortDir,
                    page,
                    limit: PAGE_LIMIT,
                },
            });
            return unwrap<{ items: BookingState[]; meta: { total: number; page: number; totalPages: number } }>(response.data);
        },
    });

    const bookings = listData?.items ?? [];
    const totalPages = listData?.meta?.totalPages ?? 1;
    const total = listData?.meta?.total ?? 0;

    const statusMutation = useMutation({
        mutationFn: async ({ id, status, comment }: { id: string; status: BookingStatus; comment?: string }) => {
            const response = await apiClient.patch(Path.Bookings.Status(id), { status, ...(comment ? { comment } : {}) });
            return unwrap<BookingState>(response.data);
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['bookings-stats'] });
            setStatusChangeFor(null);
            if (selectedBooking?.id === updated.id) setSelectedBooking(updated);
        },
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<DetailsEditFormData> }) => {
            const response = await apiClient.patch(Path.Bookings.One(id), data);
            return unwrap<BookingState>(response.data);
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            setIsEditOpen(false);
            if (selectedBooking?.id === updated.id) setSelectedBooking(updated);
        },
    });

    const resetFilters = () => {
        setStatus('all');
        setDateFrom('');
        setDateTo('');
        setPhone('');
        setName('');
        setSortBy('createdAt');
        setSortDir('desc');
        setPage(1);
    };

    const openDetails = async (booking: BookingState) => {
        try {
            const response = await apiClient.get(Path.Bookings.One(booking.id));
            setSelectedBooking(unwrap<BookingState>(response.data));
        } catch {
            setSelectedBooking(booking);
        }
        setIsDetailsOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Бронирования
                            </h1>
                        </div>
                        <p className="text-gray-500 ml-1">Управление бронированиями, статусами и предзаказами</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCwIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Обновить</span>
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <StatCard
                            label="Сегодня"
                            value={stats.today ?? 0}
                            icon={<CalendarDaysIcon className="w-5 h-5" />}
                            gradient="from-amber-500 to-orange-500"
                            onClick={() => {
                                setDateFrom(format(new Date(), 'yyyy-MM-dd'));
                                setDateTo(format(new Date(), 'yyyy-MM-dd'));
                                setPage(1);
                            }}
                        />
                        <StatCard
                            label="Новые"
                            value={stats.byStatus?.NEW ?? 0}
                            icon={<AlertCircleIcon className="w-5 h-5" />}
                            gradient="from-blue-500 to-blue-600"
                            onClick={() => { setStatus('NEW'); setPage(1); }}
                        />
                        <StatCard
                            label="Ожидают"
                            value={(stats.byStatus?.PENDING_CONFIRMATION ?? 0) + (stats.byStatus?.AWAITING_PAYMENT ?? 0)}
                            icon={<HourglassIcon className="w-5 h-5" />}
                            gradient="from-amber-500 to-orange-500"
                            onClick={() => { setStatus('PENDING_CONFIRMATION'); setPage(1); }}
                        />
                        <StatCard
                            label="Подтверждены"
                            value={stats.byStatus?.BOOKED ?? 0}
                            icon={<CheckCircleIcon className="w-5 h-5" />}
                            gradient="from-green-500 to-emerald-500"
                            onClick={() => { setStatus('BOOKED'); setPage(1); }}
                        />
                        <StatCard
                            label="Завершены"
                            value={stats.byStatus?.COMPLETED ?? 0}
                            icon={<PartyPopperIcon className="w-5 h-5" />}
                            gradient="from-emerald-500 to-teal-500"
                            onClick={() => { setStatus('COMPLETED'); setPage(1); }}
                        />
                    </div>
                )}

                {/* Filters Toggle */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FilterIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Фильтры и сортировка</span>
                        </div>
                        <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                    </button>

                    {showFilters && (
                        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Имя гостя..."
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setPage(1); }}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Телефон..."
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setPage(1); }}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value as BookingStatus | 'all'); setPage(1); }}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="all">Все статусы</option>
                                    {(Object.keys(statusConfig) as BookingStatus[]).map((s) => (
                                        <option key={s} value={s}>{statusConfig[s].label}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                                        placeholder="С"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                                        placeholder="По"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">Сортировка:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                                    >
                                        <option value="createdAt">По дате создания</option>
                                        <option value="date">По дате брони</option>
                                        <option value="status">По статусу</option>
                                    </select>
                                    <button
                                        onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <ArrowUpDownIcon className="w-3.5 h-3.5" />
                                        {sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'}
                                    </button>
                                </div>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-gray-400 hover:text-amber-600 transition-colors"
                                >
                                    Сбросить все
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bookings Table */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <CalendarIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Бронирования не найдены</p>
                        <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры фильтрации</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <Th>№</Th>
                                    <Th>Гость</Th>
                                    <Th>Дата / время</Th>
                                    <Th>Гостей</Th>
                                    <Th>Контакт</Th>
                                    <Th>Предзаказ</Th>
                                    <Th>Статус</Th>
                                    <Th>Менеджер</Th>
                                    <Th align="right">Действия</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {bookings.map((b) => {
                                    const s = statusConfig[b.status];
                                    const sum = totalPreorder(b.preorderItems);
                                    return (
                                        <tr key={b.id} className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
                                                    <HashIcon className="w-3 h-3" />
                                                    {b.bookingNumber}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{b.guestName}</div>
                                                {b.extraInfo && (
                                                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{b.extraInfo}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{getDateLabel(b.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                                    <ClockIcon className="w-3 h-3 text-gray-400" />
                                                    <span>{b.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{b.peopleCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={`tel:${b.contactPhone}`} className="flex items-center gap-1 text-sm text-amber-600 hover:underline">
                                                    <PhoneIcon className="w-3.5 h-3.5" />
                                                    {b.contactPhone}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                {b.hasPreorder || (b.preorderItems?.length ?? 0) > 0 ? (
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <ShoppingBagIcon className="w-3.5 h-3.5" />
                                                            <span>{b.preorderItems?.length ?? 0} поз.</span>
                                                        </div>
                                                        {sum > 0 && <div className="text-xs text-gray-500">{sum.toLocaleString()} сом</div>}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.badge}`}>
                                                        <s.Icon className="w-3 h-3" />
                                                        {s.label}
                                                    </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {b.handledBy ? `${b.handledBy.firstName} ${b.handledBy.lastName}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ActionButton onClick={() => openDetails(b)} icon={<EyeIcon className="w-4 h-4" />} color="blue" title="Детали" />
                                                    <ActionButton
                                                        onClick={() => { setSelectedBooking(b); setIsEditOpen(true); }}
                                                        disabled={TERMINAL_STATUSES.includes(b.status)}
                                                        icon={<Edit2Icon className="w-4 h-4" />}
                                                        color="amber"
                                                        title={TERMINAL_STATUSES.includes(b.status) ? 'Бронь в терминальном статусе' : 'Редактировать'}
                                                    />
                                                    <ActionButton
                                                        onClick={() => setStatusChangeFor(b)}
                                                        disabled={BOOKING_TRANSITIONS[b.status].length === 0}
                                                        icon={<RefreshCwIcon className="w-4 h-4" />}
                                                        color="green"
                                                        title={BOOKING_TRANSITIONS[b.status].length === 0 ? 'Нет доступных переходов' : 'Изменить статус'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <span className="text-sm text-gray-500">Всего: {total} бронирований</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
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
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

                {/* Modals */}
                {isDetailsOpen && selectedBooking && (
                    <DetailsModal booking={selectedBooking} onClose={() => setIsDetailsOpen(false)} onEdit={() => { setIsDetailsOpen(false); setIsEditOpen(true); }} onChangeStatus={() => { setIsDetailsOpen(false); setStatusChangeFor(selectedBooking); }} />
                )}
                {isEditOpen && selectedBooking && (
                    <EditDetailsModal booking={selectedBooking} isPending={editMutation.isPending} error={editMutation.error ? getErrMsg(editMutation.error) : null} onClose={() => setIsEditOpen(false)} onSubmit={(data) => editMutation.mutate({ id: selectedBooking.id, data })} />
                )}
                {statusChangeFor && (
                    <StatusChangeModal booking={statusChangeFor} isPending={statusMutation.isPending} error={statusMutation.error ? getErrMsg(statusMutation.error) : null} onClose={() => setStatusChangeFor(null)} onSubmit={(data) => statusMutation.mutate({ id: statusChangeFor.id, status: data.status, comment: data.comment })} />
                )}
            </div>
        </div>
    );
};

// Sub-components
const Th = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
    <th className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {children}
    </th>
);

const StatCard = ({ label, value, icon, gradient, onClick }: { label: string; value: number; icon: React.ReactNode; gradient: string; onClick?: () => void }) => (
    <button onClick={onClick} disabled={!onClick} className={`group p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <div className="w-4 h-4 text-white">{icon}</div>
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-800 mt-2">{value}</div>
    </button>
);

const ActionButton = ({ onClick, disabled, icon, color, title }: any) => (
    <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded-lg transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : `text-${color}-500 hover:bg-${color}-50 hover:scale-110`}`} title={title}>
        {icon}
    </button>
);

function getErrMsg(err: unknown): string {
    const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = e?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return e?.message ?? 'Ошибка запроса';
}

