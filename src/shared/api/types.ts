/**
 * Axios-интерцептор снимает конверт { success, data } со всех ответов.
 * Здесь описаны типы УЖЕ без конверта — то, что реально попадает в response.data.
 *
 * Backend envelope (снимается автоматически, не писать в типах):
 *   { success: true, data: T }          — простые ответы
 *   { success: false, ... }             — ошибки (обрабатываются через catch)
 *
 * Пагинированные ответы (data внутри конверта):
 *   { items: T[], meta: PaginationMeta }
 */

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
    success: boolean;
    data: {
        items: T[];
        meta: PaginationMeta;
    }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResult {
    data: {
        accessToken: string;
        user: AdminUser;
    }
}

export interface RefreshResult {
    accessToken: string;
}

// ─── Site Configuration ────────────────────────────────────────────────────────

export interface SocialLinks {
    instagram: string | null;
    whatsapp: string | null;
    telegram: string | null;
}

export interface FooterConfig {
    title: string;
    subtitle: string;
}

export interface WorktimeItem {
    id: string;
    dayKey: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    label: string;
    isClosed: boolean;
    openTime: string | null;
    closeTime: string | null;
    order: number;
}

export interface StatisticItem {
    id: string;
    title: string;
    subtitle: string | null;
    value: string;
    order: number;
}

export interface PhilosophyItem {
    id: string;
    title: string;
    subtitle: string | null;
    order: number;
}

export interface PhilosophyBlock {
    id: string;
    title: string;
    subtitle: string | null;
    items: PhilosophyItem[];
    img?: MediaRef | null;
}

export interface PersonBlock {
    id: string;
    title: string;
    subtitle: string | null;
    awards: string[];
    img?: MediaRef | null;
}

export interface GalleryItem {
    id: string;
    mediaId: string;
    media?: MediaRef | null;
    title: string | null;
    subtitle: string | null;
    order: number;
    isPublished: boolean;
}

export interface EventItem {
    id: string;
    mediaId: string | null;
    media?: MediaRef | null;
    title: string;
    subtitle: string | null;
    order: number;
    isPublished: boolean;
    startsAt: string | null;
    endsAt: string | null;
}

export type SiteConfigMediaSlot = 'LOGO' | 'WELCOME_IMAGE';

export interface SiteConfigMediaEntry {
    id: string;
    slot: SiteConfigMediaSlot;
    order: number;
    media: MediaRef;
}

export interface SiteConfig {
    id: string;
    siteTitle: string;
    siteSubtitle: string | null;
    email: string | null;
    /** Географические координаты: [latitude, longitude] */
    addressCoords: [number, number] | null;
    phoneNumbers: string[];
    addresses: string[];
    is24Hours: boolean;
    socialLinks: SocialLinks;
    footer: FooterConfig;
    updatedAt: string;
    worktimeItems: WorktimeItem[];
    statisticItems: StatisticItem[];
    philosophyBlock: PhilosophyBlock | null;
    personBlock: PersonBlock | null;
    // Только на публичном эндпоинте возвращаются отфильтрованные по isPublished.
    eventItems?: EventItem[];
    galleryItems?: GalleryItem[];
    siteConfigMedia?: SiteConfigMediaEntry[];
}

// ─── Menu ──────────────────────────────────────────────────────────────────────

export interface MediaRef {
    id: string;
    url: string;
    alt: string | null;
}

export interface ProductTag {
    id: string;
    title: string;
    slug: string;
    color: string | null;
    order: number;
    isActive: boolean;
}

export interface MenuCategory {
    id: string;
    title: string;
    titleEn: string | null;
    subtitle: string | null;
    slug: string;
    order: number;
    isPublished: boolean;
    img: MediaRef | null;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    title: string;
    titleEn: string | null;
    slug: string;
    subtitle: string | null;
    description: string | null;
    // Decimal сериализуется в number сервисом (products.service → serializeProduct).
    price: number;
    oldPrice: number | null;
    categoryId: string;
    category: Pick<MenuCategory, 'id' | 'title' | 'slug'>;
    cookDuration: number;
    calories: number;
    weight: string | null;
    ingredients: string[];
    order: number;
    isPublished: boolean;
    isAvailable: boolean;
    isHit: boolean;
    isNew: boolean;
    isSpicy: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    ratingAvg: number;
    ratingCount: number;
    img: MediaRef | null;
    tagRelations: { tag: Pick<ProductTag, 'id' | 'title' | 'slug' | 'color'> }[];
    createdAt: string;
    updatedAt: string;
}

// ─── Bookings ──────────────────────────────────────────────────────────────────

export type BookingStatus =
    | 'NEW' | 'PENDING_CONFIRMATION' | 'AWAITING_PAYMENT'
    | 'PAID' | 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';

export interface BookingPreorderItem {
    id: string;
    productId: string;
    product: Pick<Product, 'id' | 'title' | 'slug'>;
    quantity: number;
    unitPrice: string;
}

export interface BookingStatusHistory {
    id: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    comment: string | null;
    changedAt: string;
    changedBy: Pick<AdminUser, 'id' | 'firstName' | 'lastName'> | null;
}

export interface Booking {
    id: string;
    bookingNumber: string;
    date: string;
    time: string;
    peopleCount: number;
    guestName: string;
    contactPhone: string;
    extraInfo: string | null;
    status: BookingStatus;
    managerComment: string | null;
    hasPreorder: boolean;
    handledBy: Pick<AdminUser, 'id' | 'firstName' | 'lastName'> | null;
    preorderItems: BookingPreorderItem[];
    statusHistory: BookingStatusHistory[];
    createdAt: string;
    updatedAt: string;
    /** Pricing fields added by the commerce refactor. Optional for
     * compatibility with bookings created before the migration. */
    subtotal?: number;
    depositAmount?: number;
    prepaymentType?: PrepaymentType;
    currency?: string;
    /** Populated by admin endpoints that include payments. */
    payments?: Payment[];
}

// ─── Commerce: Orders ──────────────────────────────────────────────────────────

export type OrderType = 'DELIVERY' | 'PICKUP' | 'PREORDER_FOR_BOOKING';

export type OrderStatus =
    | 'DRAFT'
    | 'PENDING_CONFIRMATION'
    | 'AWAITING_PAYMENT'
    | 'PAID'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'EXPIRED';

export type PrepaymentType = 'NONE' | 'DEPOSIT' | 'FULL';

export interface OrderItem {
    id: string;
    productId: string;
    product?: Pick<Product, 'id' | 'title' | 'slug'> & { img?: { url: string } | null };
    quantity: number;
    unitPrice: number;
    titleSnapshot: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;

    guestName: string;
    contactPhone: string;
    contactEmail: string | null;
    comment: string | null;

    deliveryAddress: string | null;
    scheduledFor: string | null;

    bookingId: string | null;
    booking?: Pick<Booking, 'id' | 'bookingNumber' | 'date' | 'time'> | null;

    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    total: number;
    currency: string;
    prepaymentType: PrepaymentType;

    createdAt: string;
    updatedAt: string;
    confirmedAt: string | null;
    paidAt: string | null;
    cancelledAt: string | null;
    completedAt: string | null;

    items: OrderItem[];
    payments: Payment[];
}

// ─── Commerce: Payments ────────────────────────────────────────────────────────

export type PaymentStatus =
    | 'PENDING'
    | 'REQUIRES_ACTION'
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED'
    | 'EXPIRED';

export type PaymentMethod = 'CARD' | 'CASH' | 'QR' | 'BANK_TRANSFER' | 'ONLINE';

export type PaymentProvider = 'NONE' | 'MANUAL' | 'MBANK' | 'OBANK' | 'STRIPE';

export type PaymentTargetType = 'ORDER' | 'BOOKING';

export interface Payment {
    id: string;
    targetType?: PaymentTargetType;
    orderId?: string | null;
    bookingId?: string | null;

    amount: number;
    currency: string;
    isDeposit: boolean;

    method: PaymentMethod;
    provider: PaymentProvider;
    status: PaymentStatus;

    providerPaymentId?: string | null;
    redirectUrl?: string | null;
    returnUrl?: string | null;
    expiresAt?: string | null;

    createdAt: string;
    paidAt: string | null;
    failedAt?: string | null;
    refundedAt?: string | null;
}

// ─── Customers (admin aggregation) ─────────────────────────────────────────────

export type CustomerType = 'GUEST' | 'REGISTERED';

export interface CustomerSummary {
    phone: string;
    guestName: string;
    type: CustomerType;
    orderCount: number;
    bookingCount: number;
    totalSpent: number;
    currency: string;
    firstSeen: string;
    lastActivity: string;
    contactEmail: string | null;
}

export interface CustomerProfile {
    summary: CustomerSummary & { averageCheck: number };
    orders: Order[];
    bookings: Booking[];
}

export interface DashboardSummary {
    customers: { total: number };
    orders: {
        today: number;
        awaitingPayment: number;
        pending: number;
        byStatus: Partial<Record<OrderStatus, number>>;
    };
    bookings: {
        today: number;
        awaitingPayment: number;
        pending: number;
        byStatus: Partial<Record<BookingStatus, number>>;
    };
    revenue: { todayTotal: number; currency: string };
}

// ─── Media ─────────────────────────────────────────────────────────────────────

export interface Media {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    alt: string | null;
    title: string | null;
    createdAt: string;
}
