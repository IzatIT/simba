import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product as BackendProduct } from '../../shared/api/types.ts';
import type { CartItem, CartState } from './types';

const MAX_QTY_PER_ITEM = 50;

function toNumber(v: number | string | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? Number(v) : v;
}

function snapshotFromProduct(product: BackendProduct): Omit<CartItem, 'quantity'> {
    return {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        titleEn: product.titleEn ?? null,
        subtitle: product.subtitle ?? null,
        price: toNumber(product.price),
        image: product.img?.url ?? null,
    };
}

/**
 * Cart store — persisted in localStorage so the cart survives reloads.
 * Intentionally does NOT compute totals: the UI derives subtotals from
 * `items`, and the authoritative total comes from the backend on order
 * creation (`POST /public/orders` returns `subtotal`, `deliveryFee`,
 * `total`, etc.). Frontend totals are for UX preview only.
 */
export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            orderType: 'DELIVERY',
            bookingId: null,

            addItem: (product, delta = 1) =>
                set((state) => {
                    const existing = state.items.find((i) => i.productId === product.id);
                    if (existing) {
                        const next = Math.max(0, Math.min(MAX_QTY_PER_ITEM, existing.quantity + delta));
                        if (next === 0) {
                            return { items: state.items.filter((i) => i.productId !== product.id) };
                        }
                        return {
                            items: state.items.map((i) =>
                                i.productId === product.id ? { ...i, quantity: next } : i,
                            ),
                        };
                    }
                    if (delta <= 0) return state;
                    return {
                        items: [
                            ...state.items,
                            { ...snapshotFromProduct(product), quantity: Math.min(delta, MAX_QTY_PER_ITEM) },
                        ],
                    };
                }),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                })),

            setQuantity: (productId, quantity) =>
                set((state) => {
                    const clamped = Math.max(0, Math.min(MAX_QTY_PER_ITEM, quantity));
                    if (clamped === 0) {
                        return { items: state.items.filter((i) => i.productId !== productId) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.productId === productId ? { ...i, quantity: clamped } : i,
                        ),
                    };
                }),

            clear: () => set({ items: [], bookingId: null }),

            setOrderType: (type) => set({ orderType: type }),
            setBookingId: (id) => set({ bookingId: id }),
        }),
        {
            name: 'restaurant-cart/v1',
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({
                items: s.items,
                orderType: s.orderType,
                bookingId: s.bookingId,
            }),
        },
    ),
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartCount = (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartSubtotal = (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectItemQuantity = (productId: string) => (s: CartState) =>
    s.items.find((i) => i.productId === productId)?.quantity ?? 0;
