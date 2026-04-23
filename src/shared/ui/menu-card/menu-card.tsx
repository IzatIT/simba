import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Flame, Minus, Plus, Star } from 'lucide-react';
import type { Product as BackendProduct } from '../../api/types.ts';

const PLACEHOLDER_IMAGE = '/food-placeholder.jpg';

function toNumber(v: number | string | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? Number(v) : v;
}

export interface MenuCardProps {
    product: BackendProduct;
    /** 0 = not added. >0 = in cart/preorder with this quantity. */
    quantity?: number;
    /** Called when the add/+ button is pressed. `delta` is +1 or -1. */
    onQuantityChange: (product: BackendProduct, delta: number) => void;
    /** Called when the card body (non-button area) is clicked. Usually opens a detail modal. */
    onClick?: (product: BackendProduct) => void;
    /** Animation index (staggered appear). Defaults to 0 (no delay). */
    index?: number;
    /** Copy on the primary CTA when quantity = 0. */
    addLabel?: string;
    /** Hide rating / cook time / calories for compact contexts. */
    compact?: boolean;
    /** Upper bound on quantity (e.g. backend preorder cap = 20). */
    maxQuantity?: number;
    /** Optional className passthrough. */
    className?: string;
}

/**
 * Card used on /menu and /reservations (preorder step). Keeping the markup
 * in one place means UX tweaks (badges, pricing, layout) land on every
 * surface at once.
 */
export const MenuCard: React.FC<MenuCardProps> = ({
    product,
    quantity = 0,
    onQuantityChange,
    onClick,
    index = 0,
    addLabel = 'В корзину',
    compact = false,
    maxQuantity,
    className,
}) => {
    const price = toNumber(product.price);
    const oldPrice = product.oldPrice != null ? toNumber(product.oldPrice) : undefined;
    const rating = toNumber(product.ratingAvg) > 0 ? toNumber(product.ratingAvg) : 5;
    const image = product.img?.url ?? PLACEHOLDER_IMAGE;
    const ingredientsText = (product.ingredients ?? []).join(', ');
    const canIncrement = maxQuantity == null || quantity < maxQuantity;

    const handleCardClick = () => onClick?.(product);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col ${
                onClick ? 'cursor-pointer' : ''
            } ${className ?? ''}`}
            onClick={handleCardClick}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-3 left-3 flex gap-1">
                    {product.isNew && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                            NEW
                        </span>
                    )}
                    {product.isHit && (
                        <span className="px-2 py-1 bg-accent-500 text-orange-500 text-sm font-extrabold rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            ХИТ
                        </span>
                    )}
                </div>

                {quantity > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/95 text-gray-900 text-xs font-semibold rounded-full shadow">
                        × {quantity}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                        {product.titleEn && (
                            <p className="text-sm text-gray-500 truncate">{product.titleEn}</p>
                        )}
                    </div>
                </div>

                {!compact && (
                    <>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < Math.floor(rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.ratingCount})</span>
                        </div>

                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {product.cookDuration} мин
                            </span>
                            <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {product.calories} ккал
                            </span>
                        </div>
                    </>
                )}

                {ingredientsText && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ingredientsText}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">
                            {price} сом
                        </span>
                        {oldPrice && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                                {oldPrice} сом
                            </span>
                        )}
                    </div>

                    {quantity > 0 ? (
                        <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuantityChange(product, -1);
                                }}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-l-lg"
                                aria-label="Уменьшить"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button
                                type="button"
                                disabled={!canIncrement}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuantityChange(product, 1);
                                }}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Увеличить"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuantityChange(product, 1);
                            }}
                            disabled={!canIncrement}
                            className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {addLabel}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
