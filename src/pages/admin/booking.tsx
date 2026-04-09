import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PhoneIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    XCircleIcon,
    Clock,
    AlertCircleIcon,
    Edit2Icon,
    EyeIcon,
    SearchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SendIcon,
    PlusIcon,
    TrashIcon,
    SaveIcon,
    XIcon,
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import apiClient from "../../shared/api/api.ts";

type BookingStatus = 'NEW' | 'TIMEOUT' | 'CHANGED_BY_ADMIN' | 'BOOKED' | 'CANCELLED';

interface Booking {
    id: string;
    date: string;
    time: string;
    peopleCount: number;
    name: string;
    contactNumber: string;
    extraInfo: string;
    preOrderProducts: Array<{
        productid: number;
        count: number;
        product?: {
            id: number;
            title: string;
            price: number;
            img: string;
        };
    }> | null;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

interface BookingFormData {
    date: string;
    time: string;
    peopleCount: number;
    name: string;
    contactNumber: string;
    extraInfo: string;
    preOrderProducts: Array<{
        productid: number;
        count: number;
    }>;
    status: BookingStatus;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: any }> = {
    NEW: { label: 'Новое', color: 'bg-blue-100 text-blue-800', icon: Clock },
    TIMEOUT: { label: 'Просрочено', color: 'bg-gray-100 text-gray-800', icon: AlertCircleIcon },
    CHANGED_BY_ADMIN: { label: 'Изменено админом', color: 'bg-purple-100 text-purple-800', icon: Edit2Icon },
    BOOKED: { label: 'Подтверждено', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    CANCELLED: { label: 'Отменено', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
};

export const AdminBookings = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const queryClient = useQueryClient();
    const itemsPerPage = 10;

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookingFormData>({
        defaultValues: {
            date: '',
            time: '',
            peopleCount: 2,
            name: '',
            contactNumber: '',
            extraInfo: '',
            preOrderProducts: [],
            status: 'NEW'
        }
    });

    const { fields: preOrderFields, append: appendProduct, remove: removeProduct } = useFieldArray({
        control,
        name: 'preOrderProducts'
    });

    // Загрузка бронирований
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['bookings', selectedStatus, dateFilter],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (dateFilter !== 'all') params.append('dateFilter', dateFilter);
        const response = await apiClient.get(`/admin/bookings?${params.toString()}`);
        return Array.isArray(response.data) ? response.data : [];
    },
    });

    // Загрузка продуктов для предзаказа
    const { data: products } = useQuery({
        queryKey: ['menuItems'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/products');
            return Array.isArray(response.data) ? response.data : [];
        },
    });

    // Создание бронирования
    const createMutation = useMutation({
        mutationFn: async (data: BookingFormData) => {
            const response = await apiClient.post('/admin/bookings', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            closeModal();
        }
    });

    // Обновление бронирования
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<BookingFormData> }) => {
            const response = await apiClient.put(`/admin/bookings/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            closeModal();
            setIsDetailsOpen(false);
        }
    });

    // Обновление статуса
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
            const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
        }
    });

    // Отправка уведомления
    const sendNotificationMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'sms' | 'email' }) => {
            const response = await apiClient.post(`/admin/bookings/${id}/notify`, { type });
            return response.data;
        }
    });

    const openModal = (booking?: Booking) => {
        if (booking) {
            setEditingBooking(booking);
            setValue('date', booking.date);
            setValue('time', booking.time);
            setValue('peopleCount', booking.peopleCount);
            setValue('name', booking.name);
            setValue('contactNumber', booking.contactNumber);
            setValue('extraInfo', booking.extraInfo || '');
            setValue('preOrderProducts', booking.preOrderProducts || []);
            setValue('status', booking.status);
        } else {
            setEditingBooking(null);
            reset({
                date: format(new Date(), 'yyyy-MM-dd'),
                time: '19:00',
                peopleCount: 2,
                name: '',
                contactNumber: '',
                extraInfo: '',
                preOrderProducts: [],
                status: 'NEW'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
        reset();
    };

    const onSubmit = (data: BookingFormData) => {
        if (editingBooking) {
            updateMutation.mutate({ id: editingBooking.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
        if (confirm(`Изменить статус бронирования на "${statusConfig[newStatus].label}"?`)) {
            updateStatusMutation.mutate({ id: bookingId, status: newStatus });
        }
    };

    // Фильтрация и поиск
    const filteredBookings = Array.isArray(bookings)
        ? bookings.filter((booking: Booking) => {
            const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.contactNumber.includes(searchTerm);
            const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
            return matchesSearch && matchesStatus;
        })
        : [];

    // Пагинация
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getDateLabel = (date: string) => {
        const dateObj = new Date(date);
        if (isToday(dateObj)) return 'Сегодня';
        if (isTomorrow(dateObj)) return 'Завтра';
        if (isThisWeek(dateObj)) return format(dateObj, 'EEEE', { locale: ru });
        return format(dateObj, 'dd MMM yyyy', { locale: ru });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Бронирования столиков</h1>
                    <p className="text-gray-500 mt-1">Управление бронированиями и предзаказами</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Новое бронирование</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по имени или телефону..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as BookingStatus | 'all')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">Все статусы</option>
                        <option value="NEW">Новые</option>
                        <option value="BOOKED">Подтвержденные</option>
                        <option value="CHANGED_BY_ADMIN">Измененные</option>
                        <option value="CANCELLED">Отмененные</option>
                        <option value="TIMEOUT">Просроченные</option>
                    </select>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">Все даты</option>
                        <option value="today">Сегодня</option>
                        <option value="tomorrow">Завтра</option>
                        <option value="week">Эта неделя</option>
                    </select>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Список
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                viewMode === 'calendar'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Календарь
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {paginatedBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Бронирования не найдены</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Гость</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дата и время</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Гостей</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Контакты</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Предзаказ</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedBookings.map((booking: Booking) => {
                                const StatusIcon = statusConfig[booking.status].icon;
                                return (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{booking.name}</div>
                                                {booking.extraInfo && (
                                                    <div className="text-xs text-gray-500 mt-1">{booking.extraInfo.substring(0, 30)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{getDateLabel(booking.date)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{booking.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <UsersIcon className="w-4 h-4 text-gray-400" />
                                                <span>{booking.peopleCount} чел.</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{booking.contactNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.preOrderProducts && booking.preOrderProducts.length > 0 ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <ShoppingBagIcon className="w-4 h-4" />
                                                    <span className="text-sm">{booking.preOrderProducts.length} позиций</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Нет</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`p-1 rounded-full `}>
                                                    <StatusIcon className={`w-4 h-4 ${statusConfig[booking.status].color}`} />
                                                </div>
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                                    className={`px-2 py-1 text-xs rounded-lg border-0 focus:ring-2 focus:ring-amber-500 font-medium  ${statusConfig[booking.status].color}`}
                                                >
                                                    {Object.entries(statusConfig).map(([key, config]) => (
                                                        <option key={key} value={key} className="text-gray-900">
                                                            {config.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setIsDetailsOpen(true);
                                                }}
                                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Детали"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openModal(booking)}
                                                className="p-1 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Редактировать"
                                            >
                                                <Edit2Icon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => sendNotificationMutation.mutate({ id: booking.id, type: 'sms' })}
                                                className="p-1 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Отправить SMS"
                                            >
                                                <SendIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center space-x-1 px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                <span>Назад</span>
                            </button>
                            <span className="text-sm text-gray-600">
                Страница {currentPage} из {totalPages}
              </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center space-x-1 px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                <span>Вперед</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Form - остается без изменений */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold">
                                {editingBooking ? 'Редактировать бронирование' : 'Новое бронирование'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дата *
                                    </label>
                                    <input
                                        type="date"
                                        {...register('date', { required: 'Дата обязательна' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Время *
                                    </label>
                                    <input
                                        type="time"
                                        {...register('time', { required: 'Время обязательно' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* People Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Количество гостей *
                                    </label>
                                    <input
                                        type="number"
                                        {...register('peopleCount', { required: 'Количество обязательно', min: 1 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Статус
                                    </label>
                                    <select
                                        {...register('status')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    >
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Имя гостя *
                                    </label>
                                    <input
                                        {...register('name', { required: 'Имя обязательно' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Контактный телефон *
                                    </label>
                                    <input
                                        {...register('contactNumber', { required: 'Телефон обязателен' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        placeholder="+7 (999) 123-45-67"
                                    />
                                </div>

                                {/* Extra Info */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дополнительная информация
                                    </label>
                                    <textarea
                                        {...register('extraInfo')}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        placeholder="Особые пожелания, аллергии, особые случаи..."
                                    />
                                </div>

                                {/* Pre-order Products */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Предзаказ блюд
                                    </label>
                                    {preOrderFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center space-x-3 mb-3">
                                            <select
                                                {...register(`preOrderProducts.${index}.productid`)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            >
                                                <option value="">Выберите блюдо</option>
                                                {products?.map((product: any) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.title} - {product.price} ₽
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                {...register(`preOrderProducts.${index}.count`)}
                                                placeholder="Кол-во"
                                                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendProduct({ productid: 0, count: 1 })}
                                        className="flex items-center space-x-1 text-sm text-amber-600 hover:text-amber-700"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Добавить блюдо</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <SaveIcon className="w-4 h-4" />
                                    )}
                                    <span>{editingBooking ? 'Сохранить' : 'Создать'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {isDetailsOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold">Детали бронирования</h2>
                            <button onClick={() => setIsDetailsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Гость</label>
                                    <p className="font-medium">{selectedBooking.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Телефон</label>
                                    <p className="font-medium">{selectedBooking.contactNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Дата</label>
                                    <p className="font-medium">{format(new Date(selectedBooking.date), 'dd MMMM yyyy', { locale: ru })}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Время</label>
                                    <p className="font-medium">{selectedBooking.time}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Гостей</label>
                                    <p className="font-medium">{selectedBooking.peopleCount} чел.</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Статус</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className={`p-1 rounded-full`}>
                                            {statusConfig[selectedBooking.status].icon}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium  ${statusConfig[selectedBooking.status].color}`}>
                      {statusConfig[selectedBooking.status].label}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.extraInfo && (
                                <div>
                                    <label className="text-sm text-gray-500">Дополнительная информация</label>
                                    <p className="mt-1 text-gray-700">{selectedBooking.extraInfo}</p>
                                </div>
                            )}

                            {selectedBooking.preOrderProducts && selectedBooking.preOrderProducts.length > 0 && (
                                <div>
                                    <label className="text-sm text-gray-500">Предзаказ</label>
                                    <div className="mt-2 space-y-2">
                                        {selectedBooking.preOrderProducts.map((item, idx) => {
                                            const product = products?.find((p: any) => p.id === item.productid);
                                            return (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{product?.title || `Блюдо #${item.productid}`}</p>
                                                        <p className="text-sm text-gray-500">Количество: {item.count}</p>
                                                    </div>
                                                    <p className="font-medium">{product?.price ? product.price * item.count : 0} ₽</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    onClick={() => sendNotificationMutation.mutate({ id: selectedBooking.id, type: 'sms' })}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <SendIcon className="w-4 h-4" />
                                    <span>Отправить SMS</span>
                                </button>
                                <button
                                    onClick={() => {
                                        openModal(selectedBooking);
                                        setIsDetailsOpen(false);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                                >
                                    <Edit2Icon className="w-4 h-4" />
                                    <span>Редактировать</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

