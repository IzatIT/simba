import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    UtensilsIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XIcon,
    SaveIcon,
    UploadIcon,
    SearchIcon,
    ClockIcon,
    FlameIcon,
    WeightIcon,
    DollarSignIcon,
    StarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CheckIcon,
    TagIcon,
    FilterIcon,
    GridIcon,
    ListIcon,
    EyeIcon,
    PackageIcon,
    LeafIcon,
    ZapIcon,
    ShieldIcon,
} from 'lucide-react';
import apiClient from '../../../shared/api/api.ts';
import { Path } from '../../../shared/api/path.ts';

// ─── Backend-aligned types ──────────────────────────────────────────────────

interface Media {
    id: string;
    url: string;
    alt?: string | null;
}

interface CategoryRef {
    id: string;
    title: string;
    slug: string;
}

interface Tag {
    id: string;
    title: string;
    slug: string;
    color?: string | null;
    order?: number;
    isActive?: boolean;
}

interface TagRelation {
    tag: Tag;
}

interface Category {
    id: string;
    title: string;
    titleEn?: string | null;
    subtitle?: string | null;
    slug: string;
    order: number;
    isPublished: boolean;
    img?: Media | null;
}

interface Product {
    id: string;
    title: string;
    titleEn?: string | null;
    slug: string;
    subtitle?: string | null;
    description?: string | null;
    price: number | string;
    oldPrice?: number | string | null;
    categoryId: string;
    category?: CategoryRef;
    cookDuration: number;
    calories: number;
    weight?: string | null;
    ingredients: string[];
    order: number;
    isPublished: boolean;
    isAvailable: boolean;
    isHit: boolean;
    isNew: boolean;
    isSpicy: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    ratingAvg?: number | string;
    ratingCount?: number;
    imgId?: string | null;
    img?: Media | null;
    tagRelations?: TagRelation[];
}

interface Paginated<T> {
    data: {
        items: T[];
        meta: { total: number; page: number; limit: number; totalPages: number };
    }
}

interface MenuFormData {
    title: string;
    titleEn: string;
    subtitle: string;
    price: number;
    oldPrice: number;
    categoryId: string;
    cookDuration: number;
    calories: number;
    weight: string;
    ingredients: { value: string }[];
    tagIds: string[];
    order: number;
    isHit: boolean;
    isNew: boolean;
    isSpicy: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isPublished: boolean;
    isAvailable: boolean;
    img: File | null;
}

const defaultFormValues: MenuFormData = {
    title: '',
    titleEn: '',
    subtitle: '',
    price: 0,
    oldPrice: 0,
    categoryId: '',
    cookDuration: 10,
    calories: 0,
    weight: '',
    ingredients: [],
    tagIds: [],
    order: 100,
    isHit: false,
    isNew: false,
    isSpicy: false,
    isVegetarian: false,
    isGlutenFree: false,
    isPublished: false,
    isAvailable: true,
    img: null,
};

type ModernTagSelectorProps = {
    tags?: Tag[];
    selectedTagIds: string[];
    onChange: (tagIds: string[]) => void;
    availableTags?: Tag[];
}

// Компонент современного выбора тегов
const ModernTagSelector = ({ selectedTagIds, onChange, availableTags }: ModernTagSelectorProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const filteredTags = availableTags?.filter(tag =>
        tag.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const toggleTag = (tagId: string) => {
        const newSelection = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter(id => id !== tagId)
            : [...selectedTagIds, tagId];
        onChange(newSelection);
    };

    const removeTag = (tagId: string) => {
        onChange(selectedTagIds.filter(id => id !== tagId));
    };

    const getTagColor = (tag: Tag) => {
        return tag.color || '#6366f1';
    };

    const selectedTags = availableTags?.filter(tag => selectedTagIds.includes(tag.id)) || [];

    return (
        <div className="space-y-3">
            {/* Выбранные теги */}
            {selectedTags.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Выбранные теги ({selectedTags.length})
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl min-h-[60px]">
                        {selectedTags.map(tag => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                                style={{
                                    backgroundColor: `${getTagColor(tag)}20`,
                                    color: getTagColor(tag),
                                    border: `1px solid ${getTagColor(tag)}30`
                                }}
                            >
                                <TagIcon className="w-3 h-3" />
                                {tag.title}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag.id)}
                                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Доступные теги */}
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Доступные теги
                    </label>
                    <ChevronUpIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
                </button>

                {isExpanded && (
                    <div className="space-y-3">
                        {/* Поиск тегов */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск тегов..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        {/* Сетка тегов */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                            {filteredTags.length > 0 ? (
                                filteredTags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`
                                                group relative px-3 py-2 rounded-lg text-sm font-medium
                                                transition-all duration-200 text-left
                                                ${isSelected
                                                ? 'shadow-md ring-2 ring-offset-2 ring-amber-500'
                                                : 'hover:shadow-sm border border-gray-200'
                                            }
                                            `}
                                            style={{
                                                backgroundColor: isSelected ? `${getTagColor(tag)}15` : '#f9fafb',
                                                color: isSelected ? getTagColor(tag) : '#4b5563',
                                                borderColor: isSelected ? getTagColor(tag) : '#e5e7eb'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate flex-1">{tag.title}</span>
                                                {isSelected && (
                                                    <CheckIcon className="w-3 h-3 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-6 text-gray-400 text-sm">
                                    <TagIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>Теги не найдены</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Компонент современной карточки блюда
export const AdminMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Product | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const queryClient = useQueryClient();

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MenuFormData>({ defaultValues: defaultFormValues });

    const selectedTagIds = watch('tagIds') || [];

    const {
        fields: ingredientFields,
        append: appendIngredient,
        remove: removeIngredient,
    } = useFieldArray({ control, name: 'ingredients' });

    // Categories: paginated → {items, meta}.
    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await apiClient.get<Paginated<Category>>(Path.Menu.Categories, {
                params: { limit: 100 },
            });
            return response.data?.data?.items ?? [];
        },
    });

    // Tags: backend возвращает plain array.
    const { data: tags } = useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await apiClient.get<{data: Tag[]}>(Path.Menu.Tags);
            return Array.isArray(response.data.data) ? response.data.data : [];
        },
    });

    // Products: paginated → {items, meta}.
    const { data: menuItems, isLoading } = useQuery<Product[]>({
        queryKey: ['menuItems'],
        queryFn: async () => {
            const response = await apiClient.get<Paginated<Product>>(Path.Menu.Products, {
                params: { limit: 100 },
            });
            return response.data?.data?.items ?? [];
        },
    });

    // Двухшаговая загрузка: файл → Media { id } → imgId в JSON-payload продукта.
    const uploadImage = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        const response = await apiClient.post<{ data?: Media } | Media>(
            Path.Media.Upload,
            fd,
            { headers: { 'Content-Type': undefined } as unknown as Record<string, string> },
        );
        const body = response.data as { data?: Media } & Partial<Media>;
        const media = (body?.data ?? body) as Media;
        return media.id;
    };

    const toProductPayload = (data: MenuFormData, imgId?: string) => {
        const payload: Record<string, unknown> = {
            title: data.title,
            subtitle: data.subtitle || undefined,
            price: Number(data.price),
            categoryId: data.categoryId,
            cookDuration: Number(data.cookDuration),
            calories: Number(data.calories),
            weight: data.weight || undefined,
            ingredients: data.ingredients.map((i) => i.value).filter(Boolean),
            tagIds: data.tagIds,
            order: Number(data.order) || 0,
            isHit: data.isHit,
            isNew: data.isNew,
            isSpicy: data.isSpicy,
            isVegetarian: data.isVegetarian,
            isGlutenFree: data.isGlutenFree,
            isPublished: data.isPublished,
            isAvailable: data.isAvailable,
        };
        if (data.titleEn) payload.titleEn = data.titleEn;
        if (data.oldPrice && Number(data.oldPrice) > 0) payload.oldPrice = Number(data.oldPrice);
        if (imgId) payload.imgId = imgId;
        return payload;
    };

    const createMutation = useMutation({
        mutationFn: async (data: MenuFormData) => {
            const imgId = data.img ? await uploadImage(data.img) : undefined;
            const response = await apiClient.post<Product>(
                Path.Menu.Products,
                toProductPayload(data, imgId),
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: MenuFormData }) => {
            const imgId = data.img ? await uploadImage(data.img) : undefined;
            const response = await apiClient.patch<Product>(
                Path.Menu.Product(id),
                toProductPayload(data, imgId),
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(Path.Menu.Product(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
    });

    const updateOrderMutation = useMutation({
        mutationFn: async (items: Array<{ id: string; order: number }>) => {
            await apiClient.patch(Path.Menu.ProductsReorder, { items });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
    });

    const openModal = (item?: Product) => {
        if (item) {
            setEditingItem(item);
            reset({
                title: item.title,
                titleEn: item.titleEn ?? '',
                subtitle: item.subtitle ?? '',
                price: Number(item.price) || 0,
                oldPrice: item.oldPrice ? Number(item.oldPrice) : 0,
                categoryId: item.categoryId,
                cookDuration: item.cookDuration,
                calories: item.calories,
                weight: item.weight ?? '',
                ingredients: (item.ingredients ?? []).map((v) => ({ value: v })),
                tagIds: (item.tagRelations ?? []).map((r) => r.tag.id),
                order: item.order,
                isHit: item.isHit,
                isNew: item.isNew,
                isSpicy: item.isSpicy,
                isVegetarian: item.isVegetarian,
                isGlutenFree: item.isGlutenFree,
                isPublished: item.isPublished,
                isAvailable: item.isAvailable,
                img: null,
            });
            setPreviewImage(item.img?.url ?? null);
        } else {
            setEditingItem(null);
            const currentOrder = Array.isArray(menuItems) ? menuItems.length : 0;
            reset({ ...defaultFormValues, order: currentOrder });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setPreviewImage(null);
        reset(defaultFormValues);
    };

    const onSubmit = (data: MenuFormData) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('img', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!Array.isArray(menuItems)) return;
        const newItems = [...menuItems];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newItems.length) return;
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        const payload = newItems.map((it, idx) => ({ id: it.id, order: idx }));
        updateOrderMutation.mutate(payload);
    };

    const handleDelete = (item: Product) => {
        if (confirm(`Удалить блюдо "${item.title}"?`)) {
            deleteMutation.mutate(item.id);
        }
    };

    const filteredItems = (menuItems ?? []).filter((item) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            item.title.toLowerCase().includes(q) ||
            (item.subtitle?.toLowerCase().includes(q) ?? false);
        const matchesCategory =
            selectedCategory === 'all' || item.categoryId === selectedCategory;
        const matchesTag =
            selectedTag === 'all' ||
            (item.tagRelations ?? []).some((r) => r.tag.id === selectedTag);
        return matchesSearch && matchesCategory && matchesTag;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Управление меню
                    </h1>
                    <p className="text-gray-500 mt-1">Управляйте блюдами, категориями и тегами</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Добавить блюдо</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск блюд..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="relative">
                        <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
                        >
                            <option value="all">Все категории</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
                        >
                            <option value="all">Все теги</option>
                            {tags?.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 p-2 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <GridIcon className="w-5 h-5 mx-auto" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 p-2 rounded-lg transition-all ${
                                viewMode === 'list'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <ListIcon className="w-5 h-5 mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Items Grid/List */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <UtensilsIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {searchTerm || selectedCategory !== 'all' || selectedTag !== 'all'
                            ? 'Блюда не найдены'
                            : 'Меню пусто'}
                    </p>
                    {!searchTerm && selectedCategory === 'all' && selectedTag === 'all' && (
                        <button
                            onClick={() => openModal()}
                            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                        >
                            + Добавить первое блюдо
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            index={index}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            onMoveUp={(idx: number) => moveItem(idx, 'up')}
                            onMoveDown={(idx: number) => moveItem(idx, 'down')}
                            isFirst={index === 0}
                            isLast={index === filteredItems.length - 1}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                            {/* List view implementation - simplified for brevity */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                        {item.img?.url ? (
                                            <img src={item.img.url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <PackageIcon className="w-8 h-8 m-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.subtitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-amber-600">{item.price} сом</p>
                                        <button
                                            onClick={() => openModal(item)}
                                            className="text-blue-500 hover:text-blue-600 mt-1"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form - with modern tag selector */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    {editingItem ? 'Редактировать блюдо' : 'Новое блюдо'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Заполните информацию о блюде
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image Upload */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Изображение блюда
                                    </label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-500 transition-all hover:bg-amber-50/10">
                                        {previewImage ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="max-h-64 rounded-xl shadow-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewImage(null);
                                                        setValue('img', null);
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block">
                                                <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                                <span className="text-sm text-gray-500">
                                                    Нажмите или перетащите изображение
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Название *
                                    </label>
                                    <input
                                        {...register('title', { required: 'Название обязательно' })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="Введите название блюда"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        {...register('subtitle')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Краткое описание блюда"
                                    />
                                </div>

                                {/* Category and Order */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Категория *
                                    </label>
                                    <select
                                        {...register('categoryId', {
                                            required: 'Категория обязательна',
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories?.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.categoryId.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Порядок сортировки
                                    </label>
                                    <input
                                        type="number"
                                        {...register('order', { valueAsNumber: true })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Цена *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price', {
                                            required: 'Цена обязательна',
                                            min: 0,
                                            valueAsNumber: true,
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Старая цена ( до скидки )  - необязательно
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('oldPrice', { valueAsNumber: true })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Details */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Время приготовления (мин) *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        {...register('cookDuration', {
                                            required: 'Обязательно',
                                            min: 1,
                                            valueAsNumber: true,
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="15"
                                    />
                                    {errors.cookDuration && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.cookDuration.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Калорийность (ккал) *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        {...register('calories', {
                                            required: 'Обязательно',
                                            min: 0,
                                            valueAsNumber: true,
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Вес порции
                                    </label>
                                    <input
                                        {...register('weight')}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="250г"
                                    />
                                </div>

                                {/* Modern Tags Selector */}
                                <div className="lg:col-span-2">
                                    <ModernTagSelector
                                        tags={tags}
                                        selectedTagIds={selectedTagIds}
                                        availableTags={tags}
                                        onChange={(newTagIds: string[]) => setValue('tagIds', newTagIds)}
                                    />
                                </div>

                                {/* Ingredients */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ингредиенты
                                    </label>
                                    <div className="space-y-2">
                                        {ingredientFields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <input
                                                    {...register(`ingredients.${index}.value` as const)}
                                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                    placeholder="Ингредиент"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredient(index)}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => appendIngredient({ value: '' })}
                                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Добавить ингредиент
                                        </button>
                                    </div>
                                </div>

                                {/* Publish / Availability */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Статус
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                                            <input
                                                type="checkbox"
                                                {...register('isPublished')}
                                                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                                            />
                                            <EyeIcon className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium">Опубликовано</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                                            <input
                                                type="checkbox"
                                                {...register('isAvailable')}
                                                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                                            />
                                            <PackageIcon className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">В наличии</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        createMutation.isPending || updateMutation.isPending
                                    }
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 font-medium"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <SaveIcon className="w-4 h-4" />
                                    )}
                                    <span>{editingItem ? 'Сохранить изменения' : 'Создать блюдо'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

type ProductCardProps = {
    item: Product;
    index: number;
    onEdit: (item: Product) => void;
    onDelete: (product: Product) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

const ProductCard = ({ item, index, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: ProductCardProps) => {

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {item.img?.url ? (
                    <img
                        src={item.img.url}
                        alt={item.img.alt ?? item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <PackageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                )}

                {/* Order controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onMoveUp(index)}
                        disabled={isFirst}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMoveDown(index)}
                        disabled={isLast}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {item.isNew && (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-sm">
                            Новинка
                        </span>
                    )}
                    {item.isHit && (
                        <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-sm">
                            Хит
                        </span>
                    )}
                </div>

                {/* Status badges */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {!item.isAvailable && (
                        <span className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs rounded-full">
                            Нет в наличии
                        </span>
                    )}
                    {item.isVegetarian && (
                        <span className="px-2 py-1 bg-green-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                            <LeafIcon className="w-3 h-3" />
                            Вегетарианское
                        </span>
                    )}
                    {item.isSpicy && (
                        <span className="px-2 py-1 bg-orange-500/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                            <ZapIcon className="w-3 h-3" />
                            Острое
                        </span>
                    )}
                    {item.isGlutenFree && (
                        <span className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                            <ShieldIcon className="w-3 h-3" />
                            Без глютена
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                            {item.title}
                        </h3>
                        {item.titleEn && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.titleEn}</p>
                        )}
                        {item.category && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                {item.category.title}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {item.subtitle && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {item.subtitle}
                    </p>
                )}

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center text-gray-700 font-semibold">
                                <DollarSignIcon className="w-4 h-4 mr-0.5 text-amber-500" />
                                {Number(item.price)} сом
                            </span>
                            {item.oldPrice && Number(item.oldPrice) > 0 && (
                                <span className="text-gray-400 line-through text-sm">
                                    {Number(item.oldPrice)} сом
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {item.calories > 0 && (
                                <span className="flex items-center gap-1">
                                    <FlameIcon className="w-3 h-3" />
                                    {item.calories} ккал
                                </span>
                            )}
                            {item.weight && (
                                <span className="flex items-center gap-1">
                                    <WeightIcon className="w-3 h-3" />
                                    {item.weight}
                                </span>
                            )}
                        </div>
                    </div>

                    {item.cookDuration > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1.5" />
                            {item.cookDuration} мин
                        </div>
                    )}

                    {/* Tags */}
                    {(item.tagRelations?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.tagRelations!.slice(0, 3).map((rel: any) => (
                                <span
                                    key={rel.tag.id}
                                    className="px-2 py-0.5 text-xs rounded-full font-medium"
                                    style={{
                                        backgroundColor: rel.tag.color
                                            ? `${rel.tag.color}20`
                                            : '#f3f4f6',
                                        color: rel.tag.color ?? '#4b5563',
                                    }}
                                >
                                    {rel.tag.title}
                                </span>
                            ))}
                            {(item.tagRelations!.length > 3) && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                    +{item.tagRelations!.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        Порядок: {item.order}
                    </span>
                    {item.ratingCount && item.ratingCount > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                            <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-gray-700">
                                {Number(item.ratingAvg).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({item.ratingCount})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
