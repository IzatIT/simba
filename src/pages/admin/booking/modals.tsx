import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    XIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PhoneIcon,
    MessageSquareIcon,
    UserIcon,
    ShoppingBagIcon,
    HistoryIcon,
    Edit2Icon,
    RefreshCwIcon,
    SaveIcon,
    AlertCircleIcon,
} from 'lucide-react';
import type {BookingState} from "./booking.tsx";

// ─── Types ──────────────────────────────────────────────────────────────────

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

interface StatusHistoryRow {
    id: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    comment?: string | null;
    changedAt: string;
    changedBy?: { id: string; firstName: string; lastName: string; role?: string } | null;
}

interface PreorderItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string | number;
    product?: { id: string; title: string; slug: string };
}

interface DetailsEditFormData {
    guestName: string;
    contactPhone: string;
    extraInfo: string;
    managerComment: string;
}

interface StatusChangeFormData {
    status: BookingStatus;
    comment: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TERMINAL_STATUSES: BookingStatus[] = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'NO_SHOW'];

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
        Icon: ClockIcon,
        gradient: 'from-amber-500 to-orange-500',
    },
    AWAITING_PAYMENT: {
        label: 'Ожидает оплаты',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        Icon: ClockIcon,
        gradient: 'from-orange-500 to-red-500',
    },
    PAID: {
        label: 'Оплачено',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        Icon: ClockIcon,
        gradient: 'from-indigo-500 to-purple-500',
    },
    BOOKED: {
        label: 'Подтверждено',
        badge: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
        Icon: ClockIcon,
        gradient: 'from-green-500 to-emerald-500',
    },
    COMPLETED: {
        label: 'Завершено',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        Icon: ClockIcon,
        gradient: 'from-emerald-500 to-teal-500',
    },
    CANCELLED: {
        label: 'Отменено',
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        Icon: ClockIcon,
        gradient: 'from-red-500 to-rose-500',
    },
    EXPIRED: {
        label: 'Просрочено',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
        Icon: ClockIcon,
        gradient: 'from-gray-500 to-gray-600',
    },
    NO_SHOW: {
        label: 'Не пришли',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        Icon: ClockIcon,
        gradient: 'from-rose-500 to-pink-500',
    },
};

// ─── Helper Functions ───────────────────────────────────────────────────────

const fmtDateTime = (iso?: string | null): string => {
    if (!iso) return '—';
    return format(new Date(iso), 'dd MMM yyyy, HH:mm', { locale: ru });
};

const totalPreorder = (items?: PreorderItem[]): number => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
};

// ─── Info Card Component ────────────────────────────────────────────────────

export function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <div className="text-gray-400">{icon}</div>
                <span className="text-xs text-gray-500">{label}</span>
            </div>
            <div className="text-sm font-medium text-gray-800">{value}</div>
        </div>
    );
}

// ─── Details Modal ──────────────────────────────────────────────────────────

export function DetailsModal({
                                 booking,
                                 onClose,
                                 onEdit,
                                 onChangeStatus,
                             }: {
    booking: BookingState;
    onClose: () => void;
    onEdit: () => void;
    onChangeStatus: () => void;
}) {
    const s = statusConfig[booking.status as BookingStatus];
    const sum = totalPreorder(booking.preorderItems);
    const canEdit = !TERMINAL_STATUSES.includes(booking.status as BookingStatus);
    const canChange = BOOKING_TRANSITIONS[booking.status as BookingStatus]?.length > 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
                    <div className="flex justify-between items-center px-6 py-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="px-2 py-1 bg-gray-100 rounded-lg">
                                    <span className="text-xs font-mono text-gray-600">{booking.bookingNumber}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.badge}`}>
                                    <s.Icon className="w-3 h-3" />
                                    {s.label}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{booking.guestName}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Информация о бронировании */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoCard
                            icon={<CalendarIcon className="w-4 h-4" />}
                            label="Дата"
                            value={format(new Date(booking.date), 'dd MMMM yyyy', { locale: ru })}
                        />
                        <InfoCard icon={<ClockIcon className="w-4 h-4" />} label="Время" value={booking.time} />
                        <InfoCard icon={<UsersIcon className="w-4 h-4" />} label="Гостей" value={`${booking.peopleCount} чел.`} />
                        <InfoCard
                            icon={<PhoneIcon className="w-4 h-4" />}
                            label="Телефон"
                            value={<a href={`tel:${booking.contactPhone}`} className="text-amber-600 hover:underline">{booking.contactPhone}</a>}
                        />
                    </div>

                    {/* Дополнительная информация */}
                    {(booking.extraInfo || booking.managerComment) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.extraInfo && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquareIcon className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Пожелания гостя</span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.extraInfo}</p>
                                </div>
                            )}
                            {booking.managerComment && (
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserIcon className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Комментарий менеджера</span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.managerComment}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Предзаказ */}
                    {(booking.preorderItems?.length ?? 0) > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ShoppingBagIcon className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Предзаказ</span>
                                <span className="text-xs text-gray-400">({booking.preorderItems!.length} позиций)</span>
                            </div>
                            <div className="space-y-2">
                                {booking.preorderItems!.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">{item.product?.title ?? `Блюдо #${item.productId}`}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} × {Number(item.unitPrice).toLocaleString()} сом</p>
                                        </div>
                                        <p className="font-medium text-gray-800">{(Number(item.unitPrice) * item.quantity).toLocaleString()} сом</p>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 px-3">
                                    <span className="font-semibold text-gray-700">Итого</span>
                                    <span className="text-lg font-bold text-amber-600">{sum.toLocaleString()} сом</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* История статусов */}
                    {(booking.statusHistory?.length ?? 0) > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <HistoryIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">История статусов</span>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                                <div className="space-y-4">
                                    {booking.statusHistory!.map((h: StatusHistoryRow) => {
                                        const from = h.fromStatus ? statusConfig[h.fromStatus] : null;
                                        const to = statusConfig[h.toStatus];
                                        return (
                                            <div key={h.id} className="relative flex gap-3">
                                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 ${to.dot.replace('bg', 'border')}`}>
                                                    <to.Icon className="w-3.5 h-3.5" style={{ color: to.dot.replace('bg-', '') }} />
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {from ? (
                                                            <>
                                                                <span className="text-sm text-gray-500">{from.label}</span>
                                                                <span className="text-gray-400">→</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Создано</span>
                                                        )}
                                                        <span className="text-sm font-semibold text-gray-800">{to.label}</span>
                                                    </div>
                                                    {h.comment && (
                                                        <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg p-2">{h.comment}</p>
                                                    )}
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {fmtDateTime(h.changedAt)}
                                                        {h.changedBy && <> · {h.changedBy.firstName} {h.changedBy.lastName}</>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Временные метки */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-gray-400">
                        <div>Создано: {fmtDateTime(booking.createdAt)}</div>
                        <div>Обновлено: {fmtDateTime(booking.updatedAt)}</div>
                        {booking.confirmedAt && <div>Подтверждено: {fmtDateTime(booking.confirmedAt)}</div>}
                        {booking.completedAt && <div>Завершено: {fmtDateTime(booking.completedAt)}</div>}
                        {booking.cancelledAt && <div>Отменено: {fmtDateTime(booking.cancelledAt)}</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Закрыть
                        </button>
                        {canEdit && (
                            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                                <Edit2Icon className="w-4 h-4" />
                                Редактировать
                            </button>
                        )}
                        {canChange && (
                            <button onClick={onChangeStatus} className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md">
                                <RefreshCwIcon className="w-4 h-4" />
                                Изменить статус
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Details Modal ─────────────────────────────────────────────────────

export function EditDetailsModal({
                                     booking,
                                     isPending,
                                     error,
                                     onClose,
                                     onSubmit,
                                 }: {
    booking: BookingState;
    isPending: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (data: Partial<DetailsEditFormData>) => void;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<DetailsEditFormData>({
        defaultValues: {
            guestName: booking.guestName,
            contactPhone: booking.contactPhone,
            extraInfo: booking.extraInfo ?? '',
            managerComment: booking.managerComment ?? '',
        },
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-500 font-mono mb-1">{booking.bookingNumber}</div>
                            <h2 className="text-xl font-bold text-gray-900">Редактирование бронирования</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit((values) => {
                    const diff: Partial<DetailsEditFormData> = {};
                    if (values.guestName !== booking.guestName) diff.guestName = values.guestName;
                    if (values.contactPhone !== booking.contactPhone) diff.contactPhone = values.contactPhone;
                    if (values.extraInfo !== (booking.extraInfo ?? '')) diff.extraInfo = values.extraInfo;
                    if (values.managerComment !== (booking.managerComment ?? '')) diff.managerComment = values.managerComment;
                    onSubmit(diff);
                })} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Имя гостя <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('guestName', { required: 'Имя обязательно', minLength: { value: 1, message: 'Минимум 1 символ' }, maxLength: { value: 255, message: 'Максимум 255 символов' } })}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${errors.guestName ? 'border-red-400' : 'border-gray-200'}`}
                            placeholder="Введите имя гостя"
                        />
                        {errors.guestName && <p className="mt-1 text-sm text-red-500">{errors.guestName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Контактный телефон <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                {...register('contactPhone', { required: 'Телефон обязателен', minLength: { value: 1, message: 'Минимум 1 символ' }, maxLength: { value: 30, message: 'Максимум 30 символов' } })}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${errors.contactPhone ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder="+7 (700) 000-00-00"
                            />
                        </div>
                        {errors.contactPhone && <p className="mt-1 text-sm text-red-500">{errors.contactPhone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Пожелания гостя</label>
                        <textarea
                            {...register('extraInfo', { maxLength: { value: 1000, message: 'Максимум 1000 символов' } })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                            placeholder="Особые пожелания, аллергии, предпочтения..."
                        />
                        {errors.extraInfo && <p className="mt-1 text-sm text-red-500">{errors.extraInfo.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Комментарий менеджера</label>
                        <textarea
                            {...register('managerComment', { maxLength: { value: 2000, message: 'Максимум 2000 символов' } })}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none bg-amber-50/30"
                            placeholder="Внутренняя заметка (не видна гостю)"
                        />
                        {errors.managerComment && <p className="mt-1 text-sm text-red-500">{errors.managerComment.message}</p>}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircleIcon className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Отмена
                        </button>
                        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-medium shadow-md disabled:opacity-50">
                            {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <SaveIcon className="w-4 h-4" />}
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Status Change Modal ────────────────────────────────────────────────────

export function StatusChangeModal({
                                      booking,
                                      isPending,
                                      error,
                                      onClose,
                                      onSubmit,
                                  }: {
    booking: BookingState;
    isPending: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (data: StatusChangeFormData) => void;
}) {
    const available = useMemo(() => BOOKING_TRANSITIONS[booking.status as BookingStatus] || [], [booking.status]);
    const { register, handleSubmit, watch } = useForm<StatusChangeFormData>({
        defaultValues: { status: available[0], comment: '' },
    });
    const chosen = watch('status');
    const from = statusConfig[booking.status as BookingStatus];
    const to = statusConfig[chosen as BookingStatus];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="border-b border-gray-100 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-500 font-mono mb-1">{booking.bookingNumber}</div>
                            <h2 className="text-xl font-bold text-gray-900">Смена статуса</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Текущий → Новый статус */}
                    <div className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${from.dot}`} />
                            <span className="text-sm font-medium text-gray-700">{from.label}</span>
                        </div>
                        <span className="text-gray-400 text-xl">→</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${to.dot}`} />
                            <span className="text-sm font-semibold" style={{ color: to.dot.replace('bg-', '').replace('-500', '-600') }}>{to.label}</span>
                        </div>
                    </div>

                    {/* Выбор нового статуса */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Новый статус</label>
                        <div className="space-y-2">
                            {available.map((s) => {
                                const c = statusConfig[s];
                                const isSelected = chosen === s;
                                return (
                                    <label key={s} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-amber-400 bg-amber-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                                        <input type="radio" value={s} {...register('status', { required: true })} className="w-4 h-4 text-amber-500 focus:ring-amber-500" />
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${c.badge}`}>
                                            <c.Icon className="w-3 h-3" />
                                            {c.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Комментарий */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Комментарий (опционально)</label>
                        <textarea
                            {...register('comment', { maxLength: 2000 })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                            placeholder="Причина смены статуса — попадёт в историю..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircleIcon className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Отмена
                        </button>
                        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-medium shadow-md disabled:opacity-50">
                            {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <RefreshCwIcon className="w-4 h-4" />}
                            Применить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}