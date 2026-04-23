import { useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type {
    CustomerProfile,
    CustomerSummary,
    DashboardSummary,
    PaginationMeta,
} from '../../shared/api/types.ts';

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

export interface CustomersListParams {
    page?: number;
    limit?: number;
    name?: string;
    phone?: string;
    activity?: 'all' | 'with_orders' | 'with_bookings' | 'without_activity';
    sortBy?: 'lastActivity' | 'firstSeen' | 'totalSpent' | 'orderCount' | 'bookingCount' | 'guestName';
    sortDir?: 'asc' | 'desc';
}

export function useCustomers(params: CustomersListParams) {
    return useQuery<{ items: CustomerSummary[]; meta: PaginationMeta }>({
        queryKey: ['admin-customers', params],
        queryFn: async () => {
            const res = await apiClient.get(Path.Customers.List, { params });
            return unwrap<{ items: CustomerSummary[]; meta: PaginationMeta }>(res.data);
        },
        staleTime: 30_000,
    });
}

export function useCustomerProfile(phone: string | null) {
    return useQuery<CustomerProfile>({
        queryKey: ['admin-customer', phone],
        queryFn: async () => {
            const res = await apiClient.get(Path.Customers.One(phone!));
            return unwrap<CustomerProfile>(res.data);
        },
        enabled: !!phone,
        staleTime: 30_000,
    });
}

export function useDashboardSummary() {
    return useQuery<DashboardSummary>({
        queryKey: ['admin-dashboard-summary'],
        queryFn: async () => {
            const res = await apiClient.get(Path.Customers.Summary);
            return unwrap<DashboardSummary>(res.data);
        },
        staleTime: 60_000,
    });
}
