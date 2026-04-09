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
    ZapIcon,
    LeafIcon,
    WheatIcon,
    TrendingUpIcon,
    SparklesIcon
} from 'lucide-react';
import apiClient from "../../shared/api/api.ts";

interface MenuItem {
    id: number;
    order: number;
    tags: string[];
    img: string;
    title: string;
    subtitle: string;
    price: number;
    category: string;
    cookDuration: string;
    calorie: number;
    weight: string;
    ingredients: {value: string}[];
    // Дополнительные поля
    nameEn?: string;
    oldPrice?: number;
    rating?: number;
    ratingCount?: number;
    isSpicy?: boolean;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isPopular?: boolean;
    isNew?: boolean;
}

interface MenuFormData {
    order: number;
    tags: string[];
    img: File | null;
    title: string;
    subtitle: string;
    price: number;
    category: string;
    cookDuration: string;
    calorie: number;
    weight: string;
    ingredients: Array<{value: string}>;
    nameEn: string;
    oldPrice: number;
    isSpicy: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isPopular: boolean;
    isNew: boolean;
}

interface Category {
    id: string;
    title: string;
}

interface Tag {
    id: string;
    title: string;
}

export const AdminMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const queryClient = useQueryClient();

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuFormData>({
        defaultValues: {
            order: 0,
            tags: [],
            img: null,
            title: '',
            subtitle: '',
            price: 0,
            category: '',
            cookDuration: '',
            calorie: 0,
            weight: '',
            ingredients: [],
            nameEn: '',
            oldPrice: 0,
            isSpicy: false,
            isVegetarian: false,
            isGlutenFree: false,
            isPopular: false,
            isNew: false
        }
    });

    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control,
        name: 'ingredients'
    });

    // Загрузка категорий
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/categories');
            return Array.isArray(response.data) ? response.data : [];
        }
    });

    // Загрузка тегов
    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/tags');
            return Array.isArray(response.data) ? response.data : [];
        }
    });

    // Загрузка блюд
    const { data: menuItems, isLoading } = useQuery({
        queryKey: ["menuItems"],
        queryFn: async () => {
            const response = await apiClient.get('/admin/menu');
            return Array.isArray(response.data) ? response.data : [];
        }
    });

    // Создание блюда
    const createMutation = useMutation({
        mutationFn:
            async (data: MenuFormData) => {
                const formData = new FormData();
                formData.append('order', String(data.order));
                formData.append('tags', JSON.stringify(data.tags));
                if (data.img) formData.append('img', data.img);
                formData.append('title', data.title);
                formData.append('subtitle', data.subtitle);
                formData.append('price', String(data.price));
                formData.append('category', data.category);
                formData.append('cookDuration', data.cookDuration);
                formData.append('calorie', String(data.calorie));
                formData.append('weight', data.weight);
                formData.append('ingredients', JSON.stringify(data.ingredients));
                formData.append('nameEn', data.nameEn);
                formData.append('oldPrice', String(data.oldPrice));
                formData.append('isSpicy', String(data.isSpicy));
                formData.append('isVegetarian', String(data.isVegetarian));
                formData.append('isGlutenFree', String(data.isGlutenFree));
                formData.append('isPopular', String(data.isPopular));
                formData.append('isNew', String(data.isNew));

                const response = await apiClient.post('/admin/menu', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return response.data;
            },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuItems']});
            closeModal();
        }

});

    // Обновление блюда
    const updateMutation = useMutation({
        mutationFn:
            async ({ id, data }: { id: number; data: MenuFormData }) => {
                const formData = new FormData();
                formData.append('order', String(data.order));
                formData.append('tags', JSON.stringify(data.tags));
                if (data.img) formData.append('img', data.img);
                formData.append('title', data.title);
                formData.append('subtitle', data.subtitle);
                formData.append('price', String(data.price));
                formData.append('category', data.category);
                formData.append('cookDuration', data.cookDuration);
                formData.append('calorie', String(data.calorie));
                formData.append('weight', data.weight);
                formData.append('ingredients', JSON.stringify(data.ingredients));
                formData.append('nameEn', data.nameEn);
                formData.append('oldPrice', String(data.oldPrice));
                formData.append('isSpicy', String(data.isSpicy));
                formData.append('isVegetarian', String(data.isVegetarian));
                formData.append('isGlutenFree', String(data.isGlutenFree));
                formData.append('isPopular', String(data.isPopular));
                formData.append('isNew', String(data.isNew));

                const response = await apiClient.put(`/admin/menu/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return response.data;
            },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuItems']});
            closeModal();
        }
});

    // Удаление блюда
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/admin/menu/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuItems']});
        }
    });

    // Обновление порядка
    const updateOrderMutation = useMutation({
        mutationFn: async (updatedItems: MenuItem[]) => {
            const response = await apiClient.put('/admin/menu/order', { items: updatedItems });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuItems']});
        }
    });

    const openModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setValue('order', item.order);
            setValue('tags', item.tags || []);
            setValue('title', item.title);
            setValue('subtitle', item.subtitle || '');
            setValue('price', item.price);
            setValue('category', item.category);
            setValue('cookDuration', item.cookDuration || '');
            setValue('calorie', item.calorie || 0);
            setValue('weight', item.weight || '');
            setValue('ingredients', item.ingredients?.length ? item.ingredients : []);
            setValue('nameEn', item.nameEn || '');
            setValue('oldPrice', item.oldPrice || 0);
            setValue('isSpicy', item.isSpicy || false);
            setValue('isVegetarian', item.isVegetarian || false);
            setValue('isGlutenFree', item.isGlutenFree || false);
            setValue('isPopular', item.isPopular || false);
            setValue('isNew', item.isNew || false);
            setPreviewImage(item.img);
            setValue('img', null);
        } else {
            setEditingItem(null);
            const currentOrder = Array.isArray(menuItems) ? menuItems.length : 0;
            reset({
                order: currentOrder,
                tags: [],
                img: null,
                title: '',
                subtitle: '',
                price: 0,
                category: '',
                cookDuration: '',
                calorie: 0,
                weight: '',
                ingredients: [],
                nameEn: '',
                oldPrice: 0,
                isSpicy: false,
                isVegetarian: false,
                isGlutenFree: false,
                isPopular: false,
                isNew: false
            });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setPreviewImage(null);
        reset();
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
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!Array.isArray(menuItems)) return;

        const newItems = [...menuItems];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newItems.length) return;

        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        newItems.forEach((item, idx) => {
            item.order = idx;
        });

        updateOrderMutation.mutate(newItems);
    };

    // Фильтрация блюд
    const filteredItems = Array.isArray(menuItems)
        ? menuItems.filter((item: MenuItem) => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesTag = selectedTag === 'all' || (item.tags && item.tags.includes(selectedTag));
            return matchesSearch && matchesCategory && matchesTag;
        })
        : [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Управление меню</h1>
                    <p className="text-gray-500 mt-1">Добавление и редактирование блюд</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить блюдо</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск блюд..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">Все категории</option>
                        {categories?.map((cat: Category) => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>

                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">Все теги</option>
                        {tags?.map((tag: Tag) => (
                            <option key={tag.id} value={tag.id}>{tag.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <UtensilsIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                        {searchTerm || selectedCategory !== 'all' || selectedTag !== 'all'
                            ? 'Блюда не найдены'
                            : 'Меню пусто'}
                    </p>
                    {!searchTerm && selectedCategory === 'all' && selectedTag === 'all' && (
                        <button
                            onClick={() => openModal()}
                            className="mt-4 text-amber-600 hover:text-amber-700"
                        >
                            + Добавить первое блюдо
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item: MenuItem, index: number) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group overflow-hidden"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 flex items-center space-x-1">
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === filteredItems.length - 1}
                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                                    {item.isNew && (
                                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Новинка</span>
                                    )}
                                    {item.isPopular && (
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Популярное</span>
                                    )}
                                    {item.isVegetarian && (
                                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Вегетарианское</span>
                                    )}
                                    {item.isSpicy && (
                                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Острое</span>
                                    )}
                                    {item.isGlutenFree && (
                                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Без глютена</span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                                        {item.nameEn && (
                                            <p className="text-xs text-gray-400">{item.nameEn}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.subtitle}</p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Удалить блюдо "${item.title}"?`)) {
                                                    deleteMutation.mutate(item.id);
                                                }
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-3">
                      <span className="flex items-center text-gray-600">
                        <DollarSignIcon className="w-4 h-4 mr-1" />
                          {item.price} ₽
                      </span>
                                            {item.oldPrice && (
                                                <span className="text-gray-400 line-through text-xs">
                          {item.oldPrice} ₽
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {item.calorie > 0 && (
                                                <span className="flex items-center text-gray-600 text-xs">
                          <FlameIcon className="w-3 h-3 mr-1" />
                                                    {item.calorie} ккал
                        </span>
                                            )}
                                            {item.weight && (
                                                <span className="flex items-center text-gray-600 text-xs">
                          <WeightIcon className="w-3 h-3 mr-1" />
                                                    {item.weight}
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {item.cookDuration && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {item.cookDuration}
                                        </div>
                                    )}

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.map((tagId) => {
                                                const tag = tags?.find((t: Tag) => t.id === tagId);
                                                return tag ? (
                                                    <span key={tagId} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag.title}
                          </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Порядок: {item.order}</span>
                                    {item.rating && (
                                        <div className="flex items-center text-sm text-yellow-500">
                                            <StarIcon className="w-4 h-4 fill-current" />
                                            <span className="ml-1 text-gray-600">{item.rating}</span>
                                            <span className="text-xs text-gray-400 ml-1">({item.ratingCount})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold">
                                {editingItem ? 'Редактировать блюдо' : 'Новое блюдо'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Изображение блюда *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 transition-colors">
                                        {previewImage ? (
                                            <div className="relative">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewImage(null);
                                                        setValue('img', null);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block">
                                                <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Нажмите для загрузки изображения</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                    required={!editingItem}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название (RU) *
                                    </label>
                                    <input
                                        {...register('title', { required: 'Название обязательно' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название (EN)
                                    </label>
                                    <input
                                        {...register('nameEn')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        {...register('subtitle')}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Category and Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Категория *
                                    </label>
                                    <select
                                        {...register('category', { required: 'Категория обязательна' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories?.map((cat: Category) => (
                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Порядок сортировки
                                    </label>
                                    <input
                                        type="number"
                                        {...register('order')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Цена *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price', { required: 'Цена обязательна', min: 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Старая цена (скидка)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('oldPrice')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Details */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Время приготовления
                                    </label>
                                    <input
                                        {...register('cookDuration')}
                                        placeholder="15-20 мин"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Калорийность
                                    </label>
                                    <input
                                        type="number"
                                        {...register('calorie')}
                                        placeholder="ккал"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Вес порции
                                    </label>
                                    <input
                                        {...register('weight')}
                                        placeholder="250г"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Теги
                                    </label>
                                    <select
                                        multiple
                                        {...register('tags')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        size={4}
                                    >
                                        {tags?.map((tag: Tag) => (
                                            <option key={tag.id} value={tag.id}>{tag.title}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl для выбора нескольких тегов</p>
                                </div>

                                {/* Ingredients */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ингредиенты
                                    </label>
                                    {ingredientFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center space-x-2 mb-2">
                                            <input
                                                {...register(`ingredients.${index}`)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                placeholder="Ингредиент"
                                            />
                                            {ingredientFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredient(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendIngredient({value: ""})}
                                        className="text-sm text-amber-600 hover:text-amber-700"
                                    >
                                        + Добавить ингредиент
                                    </button>
                                </div>

                                {/* Flags */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Особенности
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('isNew')} className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-1 text-green-500" />
                        Новинка
                      </span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('isPopular')} className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm flex items-center">
                        <TrendingUpIcon className="w-4 h-4 mr-1 text-red-500" />
                        Популярное
                      </span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('isVegetarian')} className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm flex items-center">
                        <LeafIcon className="w-4 h-4 mr-1 text-green-600" />
                        Вегетарианское
                      </span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('isSpicy')} className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm flex items-center">
                        <ZapIcon className="w-4 h-4 mr-1 text-orange-500" />
                        Острое
                      </span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('isGlutenFree')} className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm flex items-center">
                        <WheatIcon className="w-4 h-4 mr-1 text-blue-500" />
                        Без глютена
                      </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <SaveIcon className="w-4 h-4" />
                                    )}
                                    <span>{editingItem ? 'Сохранить' : 'Создать'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

