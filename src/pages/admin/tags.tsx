import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    TagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XIcon,
    SaveIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    SearchIcon
} from 'lucide-react';
import apiClient from "../../shared/api/api.ts";

interface ProductTag {
    id: string;
    title: string;
    order: number;
}

interface TagFormData {
    title: string;
    order: number;
}

export const AdminProductTags = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TagFormData>({
        defaultValues: {
            title: '',
            order: 0
        }
    });

    // Загрузка тегов
    const { data: tags, isLoading } = useQuery({
        queryKey: ['productTags'],
        queryFn: async () => {
            // const response = await apiClient.get('/admin/product-tags');
            return [] as any;
        },
        refetchOnWindowFocus: false,
    });

    // Создание тега
    const createMutation = useMutation({
        mutationFn: async (data: TagFormData) => {
            const response = await apiClient.post('/admin/product-tags', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['productTags']});
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TagFormData }) => {
            const response = await apiClient.put(`/admin/product-tags/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['productTags']});
            closeModal();
        }
    });

    // Удаление тега
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/admin/product-tags/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['productTags']});
        }
    });

    // Обновление порядка
    const updateOrderMutation = useMutation({
        mutationFn: async (updatedTags: ProductTag[]) => {
            const response = await apiClient.put('/admin/product-tags/order', { tags: updatedTags });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['productTags']});
        }
    })

    const openModal = (tag?: ProductTag) => {
        if (tag) {
            setEditingTag(tag);
            setValue('title', tag.title);
            setValue('order', tag.order);
        } else {
            setEditingTag(null);
            reset({ title: '', order: tags?.length || 0 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);
        reset();
    };

    const onSubmit = (data: TagFormData) => {
        if (editingTag) {
            updateMutation.mutate({ id: editingTag.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const moveTag = (index: number, direction: 'up' | 'down') => {
        if (!tags) return;

        const newTags = [...tags];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newTags.length) return;

        [newTags[index], newTags[newIndex]] = [newTags[newIndex], newTags[index]];

        // Обновляем порядок
        newTags.forEach((tag, idx) => {
            tag.order = idx;
        });

        updateOrderMutation.mutate(newTags);
    };

    const filteredTags = tags?.filter((tag: ProductTag) =>
        tag.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-gray-800">Теги продуктов</h1>
                    <p className="text-gray-500 mt-1">Управление тегами для блюд и продуктов</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить тег</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск тегов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags?.map((tag: ProductTag, index: number) => (
                    <div
                        key={tag.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                                        <TagIcon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{tag.title}</h3>
                                        <p className="text-xs text-gray-500">Порядок: {tag.order}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => moveTag(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUpIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveTag(index, 'down')}
                                        disabled={index === filteredTags.length - 1}
                                        className="p-1 text-gray-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowDownIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openModal(tag)}
                                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Удалить тег "${tag.title}"?`)) {
                                                deleteMutation.mutate(tag.id);
                                            }
                                        }}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTags?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <TagIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Теги не найдены</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-4 text-amber-600 hover:text-amber-700"
                    >
                        + Создать первый тег
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editingTag ? 'Редактировать тег' : 'Новый тег'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название тега
                                </label>
                                <input
                                    {...register('title', { required: 'Название обязательно' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    placeholder="Например: Острое, Вегетарианское, Хит"
                                    autoFocus
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>
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
                            <div className="flex justify-end space-x-3 pt-4">
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
                                    <span>{editingTag ? 'Сохранить' : 'Создать'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

