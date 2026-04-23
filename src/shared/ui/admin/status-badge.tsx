import React from 'react';
import {
    AlertCircleIcon,
    BanIcon,
    CheckCircleIcon,
    ChefHatIcon,
    ClockIcon,
    CookieIcon,
    CreditCardIcon,
    HourglassIcon,
    PackageCheckIcon,
    PackageIcon,
    PartyPopperIcon,
    RefreshCwIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
    TimerIcon,
    TruckIcon,
    WalletIcon,
    XCircleIcon,
} from 'lucide-react';
import type {
    BookingStatus,
    OrderStatus,
    PaymentStatus,
} from '../../api/types.ts';

interface BadgeConfig {
    label: string;
    badge: string; // tailwind classes for bg + text + border
    Icon: React.ComponentType<{ className?: string }>;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, BadgeConfig> = {
    NEW: {
        label: 'Новое',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        Icon: AlertCircleIcon,
    },
    PENDING_CONFIRMATION: {
        label: 'Ожидает подтверждения',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        Icon: HourglassIcon,
    },
    AWAITING_PAYMENT: {
        label: 'Ожидает оплаты',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        Icon: CreditCardIcon,
    },
    PAID: {
        label: 'Оплачено',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        Icon: CreditCardIcon,
    },
    BOOKED: {
        label: 'Подтверждено',
        badge: 'bg-green-50 text-green-700 border-green-200',
        Icon: CheckCircleIcon,
    },
    COMPLETED: {
        label: 'Завершено',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Icon: PartyPopperIcon,
    },
    CANCELLED: {
        label: 'Отменено',
        badge: 'bg-red-50 text-red-700 border-red-200',
        Icon: XCircleIcon,
    },
    EXPIRED: {
        label: 'Просрочено',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        Icon: TimerIcon,
    },
    NO_SHOW: {
        label: 'Не пришли',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        Icon: BanIcon,
    },
};

// ─── Order ────────────────────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG: Record<OrderStatus, BadgeConfig> = {
    DRAFT: {
        label: 'Черновик',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        Icon: PackageIcon,
    },
    PENDING_CONFIRMATION: {
        label: 'Ожидает подтверждения',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        Icon: HourglassIcon,
    },
    AWAITING_PAYMENT: {
        label: 'Ожидает оплаты',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        Icon: CreditCardIcon,
    },
    PAID: {
        label: 'Оплачено',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        Icon: CreditCardIcon,
    },
    CONFIRMED: {
        label: 'Подтверждено',
        badge: 'bg-green-50 text-green-700 border-green-200',
        Icon: CheckCircleIcon,
    },
    PREPARING: {
        label: 'Готовится',
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        Icon: ChefHatIcon,
    },
    READY: {
        label: 'Готов',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        Icon: CookieIcon,
    },
    DELIVERED: {
        label: 'Доставлен',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        Icon: TruckIcon,
    },
    COMPLETED: {
        label: 'Завершён',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Icon: PackageCheckIcon,
    },
    CANCELLED: {
        label: 'Отменён',
        badge: 'bg-red-50 text-red-700 border-red-200',
        Icon: XCircleIcon,
    },
    EXPIRED: {
        label: 'Просрочен',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        Icon: TimerIcon,
    },
};

// ─── Payment ──────────────────────────────────────────────────────────────────

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus | 'NOT_REQUIRED', BadgeConfig> = {
    NOT_REQUIRED: {
        label: 'Не требуется',
        badge: 'bg-gray-50 text-gray-500 border-gray-200',
        Icon: ShieldCheckIcon,
    },
    PENDING: {
        label: 'Ожидает',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        Icon: ClockIcon,
    },
    REQUIRES_ACTION: {
        label: 'Требует действия',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        Icon: RefreshCwIcon,
    },
    PAID: {
        label: 'Оплачено',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Icon: CheckCircleIcon,
    },
    FAILED: {
        label: 'Ошибка',
        badge: 'bg-red-50 text-red-700 border-red-200',
        Icon: ShieldAlertIcon,
    },
    CANCELLED: {
        label: 'Отменено',
        badge: 'bg-red-50 text-red-700 border-red-200',
        Icon: XCircleIcon,
    },
    REFUNDED: {
        label: 'Возврат',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        Icon: WalletIcon,
    },
    EXPIRED: {
        label: 'Истёк',
        badge: 'bg-gray-50 text-gray-700 border-gray-200',
        Icon: TimerIcon,
    },
};

// ─── Presentational component ────────────────────────────────────────────────

interface StatusBadgeProps {
    config: BadgeConfig;
    size?: 'sm' | 'md';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ config, size = 'sm', className }) => {
    const { label, badge, Icon } = config;
    const sizeCls =
        size === 'md'
            ? 'px-3 py-1.5 text-sm'
            : 'px-2.5 py-1 text-xs';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${badge} ${sizeCls} ${className ?? ''}`}
        >
            <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
            {label}
        </span>
    );
};

// ─── Convenience helpers ─────────────────────────────────────────────────────

export const BookingStatusBadge: React.FC<{ status: BookingStatus; size?: 'sm' | 'md' }> = ({
    status, size,
}) => <StatusBadge config={BOOKING_STATUS_CONFIG[status]} size={size} />;

export const OrderStatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({
    status, size,
}) => <StatusBadge config={ORDER_STATUS_CONFIG[status]} size={size} />;

export const PaymentStatusBadge: React.FC<{
    status: PaymentStatus | null | undefined;
    size?: 'sm' | 'md';
}> = ({ status, size }) => (
    <StatusBadge config={PAYMENT_STATUS_CONFIG[status ?? 'NOT_REQUIRED']} size={size} />
);
