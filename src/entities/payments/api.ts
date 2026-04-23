import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type {
    Payment,
    PaymentMethod,
    PaymentTargetType,
} from '../../shared/api/types.ts';

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

// ─── DTOs matching src/modules/payments/dto/initiate-payment.dto.ts ────────────

export interface InitiatePaymentDto {
    targetType: PaymentTargetType;
    targetId: string;
    method: PaymentMethod;
    /** true = charge only the deposit on a booking with `prepaymentType = DEPOSIT`. */
    isDeposit?: boolean;
    /** Where the gateway should send the user after payment completes. */
    returnUrl?: string;
    /** Client-generated idempotency key — stable across retries of the same intent. */
    idempotencyKey?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function initiatePayment(dto: InitiatePaymentDto): Promise<Payment> {
    const res = await apiClient.post(Path.PublicPayments.Initiate, dto);
    return unwrap<Payment>(res.data);
}

export async function fetchPaymentStatus(id: string): Promise<Payment> {
    const res = await apiClient.get(Path.PublicPayments.One(id));
    return unwrap<Payment>(res.data);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Initiate a payment intent. For online methods the returned Payment has
 * `redirectUrl` set and `status === 'REQUIRES_ACTION'` — the UI should
 * navigate the user there and then poll `usePaymentStatus` on return.
 *
 * For `CASH` (pay-on-arrival) the payment is created in `PENDING` and the
 * admin flips it to `PAID` later. The UI can treat the order as placed.
 */
export function useInitiatePayment() {
    return useMutation({
        mutationFn: initiatePayment,
    });
}

export function usePaymentStatus(id: string | null, pollMs?: number) {
    return useQuery({
        queryKey: ['public-payment', id],
        queryFn: () => fetchPaymentStatus(id!),
        enabled: !!id,
        refetchInterval: pollMs ?? false,
    });
}
