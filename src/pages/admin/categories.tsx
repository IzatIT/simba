// pages/admin/MenuCategories.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    GridIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XIcon,
    SaveIcon,
    UploadIcon,
    GripVerticalIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ImageIcon,
    SearchIcon
} from 'lucide-react';
import apiClient from "../../shared/api/api.ts";

interface MenuCategory {
    id: string;
    order: number;
    title: string;
    subtitle: string;
    img: string;
}

interface CategoryFormData {
    title: string;
    subtitle: string;
    order: number;
    img: File | null;
}

export const AdminMenuCategories = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormData>({
        defaultValues: {
            title: '',
            subtitle: '',
            order: 0,
            img: null
        }
    });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['menuCategories'],
        queryFn: async () => {
            // const response = await apiClient.get('/admin/menu-categories');
            return  [] as any;
        },
        refetchOnWindowFocus: false,
    });

    console.log(categories)
    const createMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle);
        formData.append('order', String(data.order));
        if (data.img) {
            formData.append('img', data.img);
        }
        const response = await apiClient.post('/admin/menu-categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuCategories']});
            closeModal();
        }
    });

    // Обновление категории
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle);
        formData.append('order', String(data.order));
        if (data.img) {
            formData.append('img', data.img);
        }
        const response = await apiClient.put(`/admin/menu-categories/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuCategories']});
            closeModal();
        }
    });

    // Удаление категории
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/admin/menu-categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuCategories']});
        }
    });

    // Обновление порядка
    const updateOrderMutation = useMutation({
        mutationFn: async (updatedCategories: MenuCategory[]) => {
            const response = await apiClient.put('/admin/menu-categories/order', { categories: updatedCategories });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['menuCategories']});
        }
    });

    const openModal = (category?: MenuCategory) => {
        if (category) {
            setEditingCategory(category);
            setValue('title', category.title);
            setValue('subtitle', category.subtitle);
            setValue('order', category.order);
            setPreviewImage(category.img);
            setValue('img', null);
        } else {
            setEditingCategory(null);
            reset({ title: '', subtitle: '', order: categories?.length || 0, img: null });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setPreviewImage(null);
        reset();
    };

    const onSubmit = (data: CategoryFormData) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
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

    const moveCategory = (index: number, direction: 'up' | 'down') => {
        if (!categories) return;

        const newCategories = [...categories];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newCategories.length) return;

        [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];

        newCategories.forEach((cat, idx) => {
            cat.order = idx;
        });

        updateOrderMutation.mutate(newCategories);
    };

    const filteredCategories = categories?.filter((category: MenuCategory) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold text-gray-800">Категории меню</h1>
                    <p className="text-gray-500 mt-1">Управление категориями блюд и порядком их отображения</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить категорию</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск категорий..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories?.map((category: MenuCategory, index: number) => (
                    <div
                        key={category.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group overflow-hidden"
                    >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                            {category.img ? (
                                <img
                                    src={category.img}
                                    alt={category.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-amber-400" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => moveCategory(index, 'up')}
                                    disabled={index === 0}
                                    className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30"
                                >
                                    <ArrowUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => moveCategory(index, 'down')}
                                    disabled={index === filteredCategories.length - 1}
                                    className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30"
                                >
                                    <ArrowDownIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-800">{category.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{category.subtitle}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openModal(category)}
                                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Удалить категорию "${category.title}"?`)) {
                                                deleteMutation.mutate(category.id);
                                            }
                                        }}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Порядок: {category.order}</span>
                                <GripVerticalIcon className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <GridIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Категории не найдены</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-4 text-amber-600 hover:text-amber-700"
                    >
                        + Создать первую категорию
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold">
                                {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Изображение категории
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
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название категории *
                                </label>
                                <input
                                    {...register('title', { required: 'Название обязательно' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    placeholder="Например: Основные блюда"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Описание
                                </label>
                                <textarea
                                    {...register('subtitle')}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    placeholder="Краткое описание категории"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Порядок сортировки
                                </label>
                                <input
                                    type="number"
                                    {...register('order', { required: 'Порядок обязателен' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Меньшее число = выше в списке
                                </p>
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
                                    <span>{editingCategory ? 'Сохранить' : 'Создать'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

