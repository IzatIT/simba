import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    ShoppingCart,
    Clock,
    Flame,
    Utensils,
    Heart,
    X,
    Plus,
    SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type { Product as BackendProduct } from '../../shared/api/types.ts';
import { MenuCard } from '../../shared/ui/menu-card/menu-card.tsx';
import {
    selectCartCount,
    selectItemQuantity,
    useCartStore,
} from '../../entities/cart/store.ts';

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

function toNumber(v: number | string | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? Number(v) : v;
}

export const Menu: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<BackendProduct | null>(null);
    const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const addItem = useCartStore((s) => s.addItem);
    const cartCount = useCartStore(selectCartCount);
    const items = useCartStore((s) => s.items);
    const getQty = (productId: string) =>
        items.find((i) => i.productId === productId)?.quantity ?? 0;

    // Ensure a non-delivery/pickup order type doesn't leak from a previous
    // reservation-preorder flow. If the user lands on /menu we reset to DELIVERY.
    const setOrderType = useCartStore((s) => s.setOrderType);
    const setBookingId = useCartStore((s) => s.setBookingId);
    const orderType = useCartStore((s) => s.orderType);
    React.useEffect(() => {
        if (orderType === 'PREORDER_FOR_BOOKING') {
            setOrderType('DELIVERY');
            setBookingId(null);
        }
    }, [orderType, setOrderType, setBookingId]);

    const toggleTag = (slug: string) => {
        setSelectedTagSlugs((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        );
    };

    const { data: rawCategories = [] } = useQuery<Array<{ id: string; slug: string; title: string }>>({
        queryKey: ['public-menu-categories'],
        queryFn: async () => {
            const res = await apiClient.get(Path.PublicMenu.Categories);
            const body = unwrap<Array<{ id: string; slug: string; title: string }>>(res.data);
            return Array.isArray(body) ? body : [];
        },
        staleTime: 5 * 60_000,
    });

    const { data: rawTags = [] } = useQuery<
        Array<{ id: string; slug: string; title: string; color: string | null; isActive: boolean }>
    >({
        queryKey: ['public-menu-tags'],
        queryFn: async () => {
            const res = await apiClient.get(Path.PublicMenu.Tags);
            const body = unwrap<Array<{ id: string; slug: string; title: string; color: string | null; isActive: boolean }>>(
                res.data,
            );
            return Array.isArray(body) ? body : [];
        },
        staleTime: 5 * 60_000,
    });

    const { data: rawProducts = [], isLoading } = useQuery<BackendProduct[]>({
        queryKey: ['public-menu-products'],
        queryFn: async () => {
            const res = await apiClient.get(Path.PublicMenu.Products, {
                params: { limit: 100 },
            });
            const body = unwrap<{ items?: BackendProduct[] }>(res.data);
            return body?.items ?? [];
        },
        staleTime: 60_000,
    });

    const categories = useMemo(
        () => [
            { id: 'all', name: 'Все' },
            ...rawCategories.map((c) => ({
                id: c.slug,
                name: c.title,
            })),
        ],
        [rawCategories],
    );

    const filteredMenu = rawProducts.filter((item) => {
        const title = item.title.toLowerCase();
        const subtitle = (item.subtitle ?? '').toLowerCase();
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!title.includes(q) && !subtitle.includes(q)) return false;
        }
        if (selectedCategory !== 'all' && item.category?.slug !== selectedCategory) {
            return false;
        }
        if (selectedTagSlugs.length > 0) {
            const productTagSlugs = (item.tagRelations ?? []).map((r) => r.tag.slug);
            if (!selectedTagSlugs.every((slug) => productTagSlugs.includes(slug))) return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <section className="relative h-[350px] pt-20 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                </motion.div>

                <div className="relative h-full flex items-center text-white">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl"
                        >
                            <span className="text-accent-400 font-medium mb-2 block">Наше меню</span>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold mb-4">
                                Искусство вкуса
                            </h1>
                            <p className="text-xl text-gray-200">
                                Откройте для себя изысканные блюда от нашего шеф-повара
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Поиск блюд..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3 border rounded-xl transition-all ${
                                    showFilters
                                        ? 'border-accent-500 bg-accent-50 text-accent-600'
                                        : 'border-gray-200 hover:border-accent-300'
                                }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>

                            <Link to="/cart">
                                <button className="relative p-3 bg-gray-500 cursor-pointer text-white rounded-xl hover:bg-accent-600 transition-colors">
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </Link>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Фильтры</h3>
                                        {selectedTagSlugs.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTagSlugs([])}
                                                className="text-sm text-accent-600 hover:text-accent-700"
                                            >
                                                Сбросить ({selectedTagSlugs.length})
                                            </button>
                                        )}
                                    </div>
                                    {rawTags.length === 0 ? (
                                        <div className="text-sm text-gray-400 text-center py-4">
                                            Теги загружаются…
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {rawTags
                                                .filter((t) => t.isActive)
                                                .map((tag) => {
                                                    const active = selectedTagSlugs.includes(tag.slug);
                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => toggleTag(tag.slug)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                                active
                                                                    ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-accent-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {tag.color && (
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full"
                                                                    style={{ backgroundColor: tag.color }}
                                                                />
                                                            )}
                                                            <span>{tag.title}</span>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-10 w-full flex flex-wrap pb-2 gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all cursor-pointer ${
                                    selectedCategory === category.id
                                        ? 'bg-gray-500 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500" />
                        </div>
                    )}

                    {!isLoading && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMenu.map((item, index) => (
                                <MenuCard
                                    key={item.id}
                                    product={item}
                                    index={index}
                                    quantity={getQty(item.id)}
                                    onQuantityChange={(product, delta) => addItem(product, delta)}
                                    onClick={(product) => setSelectedItem(product)}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredMenu.length === 0 && (
                        <div className="text-center py-16">
                            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
                            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <img
                                    src={selectedItem.img?.url ?? '/food-placeholder.jpg'}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover aspect-[4/3]"
                                />
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-md sm:text-3xl font-display font-bold text-gray-900 mb-1">
                                            {selectedItem.title}
                                        </h2>
                                        {selectedItem.titleEn && (
                                            <p className=" text-sm sm:text-md text-gray-500">{selectedItem.titleEn}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-md sm:text-3xl font-bold text-accent-600">
                                            {toNumber(selectedItem.price)} сом
                                        </div>
                                        {selectedItem.oldPrice && (
                                            <div className="text-sm text-gray-400 line-through">
                                                {toNumber(selectedItem.oldPrice)} сом
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedItem.description && (
                                    <p className="text-gray-700 mb-6">{selectedItem.description}</p>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-200 rounded-xl p-3 text-center">
                                        <Clock className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                                        <div className="text-sm text-gray-500">Время</div>
                                        <div className="font-medium">{selectedItem.cookDuration} мин</div>
                                    </div>
                                    <div className="bg-gray-200 rounded-xl p-3 text-center">
                                        <Flame className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                                        <div className="text-sm text-gray-500">Калории</div>
                                        <div className="font-medium">{selectedItem.calories} ккал</div>
                                    </div>
                                </div>

                                {(selectedItem.ingredients ?? []).length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium text-gray-900 mb-3">Ингредиенты</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.ingredients.map((ingredient, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                >
                                                    {ingredient}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            addItem(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                        className="flex-1 bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Добавить в корзину
                                    </button>
                                    <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Re-export selector for advanced consumers that also want per-item qty lookups.
export { selectItemQuantity };
