import type { OrderType, Product as BackendProduct } from '../../shared/api/types.ts';

/**
 * A cart item is a Product snapshot plus a quantity. Pricing is snapshotted
 * at add-time so the cart stays stable if a product's price changes while
 * the user is still shopping. The backend still recomputes totals on order
 * creation — this snapshot is purely for UX.
 */
export interface CartItem {
    productId: string;
    slug: string;
    title: string;
    titleEn: string | null;
    subtitle: string | null;
    price: number;
    image: string | null;
    quantity: number;
}

export interface CartState {
    items: CartItem[];

    /** DELIVERY | PICKUP | PREORDER_FOR_BOOKING. Controls the final order type. */
    orderType: OrderType;

    /** When `orderType === PREORDER_FOR_BOOKING` this links to a Booking UUID. */
    bookingId: string | null;

    // ─── Actions ─────────────────────────────────────────────────────────
    addItem: (product: BackendProduct, delta?: number) => void;
    removeItem: (productId: string) => void;
    setQuantity: (productId: string, quantity: number) => void;
    clear: () => void;
    setOrderType: (type: OrderType) => void;
    setBookingId: (id: string | null) => void;
}
