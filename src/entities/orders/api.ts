import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type {
    Order,
    OrderStatus,
    OrderType,
    PaginationMeta,
} from '../../shared/api/types.ts';

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

// ─── DTOs matching src/modules/orders/dto/*.dto.ts ─────────────────────────────

export interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}

export interface CreateOrderDto {
    type: OrderType;
    guestName: string;
    contactPhone: string;
    contactEmail?: string;
    comment?: string;
    /** Required when `type === 'DELIVERY'`. */
    deliveryAddress?: string;
    /** ISO datetime; omit / null = ASAP. */
    scheduledFor?: string;
    /** Required when `type === 'PREORDER_FOR_BOOKING'`. */
    bookingId?: string;
    items: CreateOrderItemDto[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
    const res = await apiClient.post(Path.PublicOrders.Create, dto);
    return unwrap<Order>(res.data);
}

export async function fetchOrder(id: string): Promise<Order> {
    const res = await apiClient.get(Path.PublicOrders.One(id));
    return unwrap<Order>(res.data);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCreateOrder() {
    return useMutation({
        mutationFn: createOrder,
    });
}

export function useOrder(id: string | null) {
    return useQuery({
        queryKey: ['public-order', id],
        queryFn: () => fetchOrder(id!),
        enabled: !!id,
        staleTime: 30_000,
    });
}

// ─── Admin: list / detail / status transitions ────────────────────────────────

export interface AdminOrdersListParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    type?: OrderType;
    dateFrom?: string;
    dateTo?: string;
    phone?: string;
    name?: string;
    sortBy?: 'createdAt' | 'status' | 'total';
    sortDir?: 'asc' | 'desc';
}

export function useAdminOrders(params: AdminOrdersListParams) {
    return useQuery<{ items: Order[]; meta: PaginationMeta }>({
        queryKey: ['admin-orders', params],
        queryFn: async () => {
            const res = await apiClient.get(Path.Orders.List, { params });
            return unwrap<{ items: Order[]; meta: PaginationMeta }>(res.data);
        },
        staleTime: 15_000,
    });
}

export function useAdminOrder(id: string | null) {
    return useQuery<Order>({
        queryKey: ['admin-order', id],
        queryFn: async () => {
            const res = await apiClient.get(Path.Orders.One(id!));
            return unwrap<Order>(res.data);
        },
        enabled: !!id,
        staleTime: 15_000,
    });
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
    comment?: string;
}

export function useUpdateOrderStatus() {
    return useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: UpdateOrderStatusDto }) => {
            const res = await apiClient.patch(Path.Orders.Status(id), dto);
            return unwrap<Order>(res.data);
        },
    });
}

// Order state machine mirror — matches back/src/common/constants/order-transitions.constant.ts
export const ORDER_VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['PENDING_CONFIRMATION', 'CANCELLED', 'EXPIRED'],
    PENDING_CONFIRMATION: ['AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
    AWAITING_PAYMENT: ['PAID', 'CANCELLED', 'EXPIRED'],
    PAID: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'COMPLETED', 'CANCELLED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
};
