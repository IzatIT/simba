import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    FolderTreeIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XIcon,
    SaveIcon,
    EyeIcon,
    EyeOffIcon,
    HashIcon,
    SearchIcon,
    RefreshCwIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LayersIcon,
    GlobeIcon,
    FileTextIcon,
} from "lucide-react";
import apiClient from "../../../shared/api/api.ts";
import { Path } from "../../../shared/api/path.ts";
import type { MenuCategory, PaginatedResult } from "../../../shared/api/types.ts";

interface CategoryFormData {
    title: string;
    titleEn: string;
    subtitle: string;
    slug: string;
    order: number;
    isPublished: boolean;
}

const PAGE_SIZE = 20;

type CategoryCardProps = {
    category: MenuCategory;
    onEdit: (category: MenuCategory) => void;
    onDelete: (category: MenuCategory) => void;
}

// Компонент карточки категории для grid-отображения
const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {

    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-200"
        >
            {/* Градиентный фон при наведении */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-amber-50/0 group-hover:from-amber-50/30 group-hover:to-orange-50/30 transition-all duration-500" />

            <div className="relative p-5">
                <div className="flex items-start gap-4">
                    {/* Иконка категории */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <FolderTreeIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                            <LayersIcon className="w-3 h-3 text-gray-600" />
                        </div>
                    </div>

                    {/* Информация о категории */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                {category.title}
                            </h3>
                            {!category.isPublished && (
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    <EyeOffIcon className="w-3 h-3" />
                                    Скрыта
                                </span>
                            )}
                            {category.isPublished && (
                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                                    <EyeIcon className="w-3 h-3" />
                                    Опубликована
                                </span>
                            )}
                        </div>

                        {category.titleEn && (
                            <div className="flex items-center gap-1 mt-1">
                                <GlobeIcon className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{category.titleEn}</span>
                            </div>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                            <code className="text-xs font-mono bg-gray-50 px-2 py-1 rounded-lg text-gray-600">
                                /{category.slug}
                            </code>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <HashIcon className="w-3 h-3" />
                                Порядок: {category.order}
                            </span>
                        </div>

                        {category.subtitle && (
                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                {category.subtitle}
                            </p>
                        )}

                        {/* Количество блюд */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                <FileTextIcon className="w-3 h-3" />
                                <span>{(category as any)._count?.products ?? 0} блюд</span>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => onEdit(category)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Редактировать"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(category)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Удалить"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Декоративная полоса внизу */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:h-1.5" />
            </div>
        </div>
    );
};

type CategoryRowProps = {
    category: MenuCategory;
    index: number;
    onEdit: (category: MenuCategory) => void;
    onDelete: (category: MenuCategory) => void;
}

// Компонент строки таблицы для list-отображения
const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => {
    return (
        <tr className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 group">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <FolderTreeIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-mono text-xs text-gray-400">{category.order}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div>
                    <div className="font-semibold text-gray-900">{category.title}</div>
                    {category.titleEn && (
                        <div className="text-xs text-gray-400 mt-0.5">{category.titleEn}</div>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <code className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-gray-600">
                    {category.slug}
                </code>
            </td>
            <td className="px-4 py-3">
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {category.isPublished ? (
                        <EyeIcon className="w-3 h-3" />
                    ) : (
                        <EyeOffIcon className="w-3 h-3" />
                    )}
                    {category.isPublished ? "Опубликовано" : "Скрыто"}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <FileTextIcon className="w-3.5 h-3.5" />
                    {(category as any)._count?.products ?? 0}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(category)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export function AdminMenuCategories() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<MenuCategory | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const { data, isLoading, refetch } = useQuery<PaginatedResult<MenuCategory>>({
        queryKey: ["admin-categories", page],
        queryFn: async () => {
            const res = await apiClient.get<PaginatedResult<MenuCategory>>(Path.Menu.Categories, {
                params: { page, limit: PAGE_SIZE, search: searchTerm || undefined },
            });
            return res.data;
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormData>({
        defaultValues: { title: "", titleEn: "", subtitle: "", slug: "", order: 0, isPublished: true },
    });


    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-zа-яё\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[ё]/g, 'e')
            .slice(0, 50);
    };

    const openCreate = () => {
        setEditing(null);
        reset({ title: "", titleEn: "", subtitle: "", slug: "", order: 0, isPublished: true });
        setModalOpen(true);
    };

    const openEdit = (cat: MenuCategory) => {
        setEditing(cat);
        reset({
            title: cat.title,
            titleEn: cat.titleEn ?? "",
            subtitle: cat.subtitle ?? "",
            slug: cat.slug,
            order: cat.order,
            isPublished: cat.isPublished,
        });
        setModalOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            const body = {
                title: data.title,
                titleEn: data.titleEn || undefined,
                subtitle: data.subtitle || undefined,
                slug: data.slug || generateSlug(data.title),
                order: Number(data.order),
                isPublished: data.isPublished,
            };
            if (editing) {
                await apiClient.patch(Path.Menu.Category(editing.id), body);
            } else {
                await apiClient.post(Path.Menu.Categories, body);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-categories"] });
            toast.success(editing ? "Категория обновлена" : "Категория создана", {
                icon: "📁",
                style: { background: "#10B981", color: "#fff" },
            });
            setModalOpen(false);
        },
        onError: () => toast.error("Ошибка сохранения"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(Path.Menu.Category(id));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-categories"] });
            toast.success("Категория удалена", { icon: "🗑️" });
            setDeleteTarget(null);
        },
        onError: () => toast.error("Ошибка удаления"),
    });

    const items = data?.data?.items ?? [];
    const meta = data?.data?.meta;

    const handleSearch = () => {
        setPage(1);
        refetch();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                <FolderTreeIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Управление категориями
                            </h1>
                        </div>
                        <p className="text-gray-500 ml-1">
                            Организуйте блюда по категориям для удобной навигации
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Создать категорию</span>
                    </button>
                </div>

                {/* Stats Cards */}
                {meta && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Всего категорий</p>
                                    <p className="text-2xl font-bold text-gray-900">{meta.total}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                                    <FolderTreeIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">На странице</p>
                                    <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                                    <LayersIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Страница</p>
                                    <p className="text-2xl font-bold text-gray-900">{meta.page}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                                    <HashIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Всего страниц</p>
                                    <p className="text-2xl font-bold text-gray-900">{meta.totalPages}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <FileTextIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию или slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium"
                            >
                                Поиск
                            </button>
                            <button
                                onClick={() => refetch()}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                title="Обновить"
                            >
                                <RefreshCwIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <LayersIcon className="w-4 h-4" />
                            <span className="text-sm">Сетка</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                viewMode === 'list'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FileTextIcon className="w-4 h-4" />
                            <span className="text-sm">Список</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FolderTreeIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <FolderTreeIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Категории не найдены" : "Нет созданных категорий"}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={openCreate}
                                className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                            >
                                + Создать первую категорию
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {items.map((cat) => (
                            <CategoryCard
                                key={cat.id}
                                category={cat}
                                onEdit={openEdit}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Порядок</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Название</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Статус</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Блюд</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-600">Действия</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {items.map((cat, idx) => (
                                <CategoryRow
                                    key={cat.id}
                                    category={cat}
                                    index={idx}
                                    onEdit={openEdit}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">
                            {meta.page} из {meta.totalPages} страниц
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={!meta.hasPrevPage}
                                onClick={() => setPage((p) => p - 1)}
                                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Назад
                            </button>
                            <button
                                disabled={!meta.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Вперёд
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Create/Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <FolderTreeIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {editing ? "Редактировать категорию" : "Создать категорию"}
                                            </h2>
                                            <p className="text-white/80 text-sm">
                                                {editing ? "Измените параметры категории" : "Добавьте новую категорию для блюд"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <XIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
                                className="p-6 space-y-5"
                            >
                                {/* Название */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Название <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("title", { required: "Обязательное поле" })}
                                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                                            errors.title ? "border-red-400" : "border-gray-200"
                                        }`}
                                        placeholder="Например: Горячие блюда"
                                        autoFocus
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <XIcon className="w-3 h-3" />
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>


                                {/* Описание */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        {...register("subtitle")}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                                        placeholder="Краткое описание категории"
                                    />
                                </div>

                                {/* Slug и порядок */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Slug
                                        </label>
                                        <div className="relative">
                                            <HashIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                {...register("slug")}
                                                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                placeholder="hot-dishes"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Оставьте пустым — сгенерируется автоматически
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Порядок сортировки
                                        </label>
                                        <input
                                            type="number"
                                            {...register("order", { valueAsNumber: true })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Статус публикации */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        {...register("isPublished")}
                                        className="w-5 h-5 text-amber-500 rounded-lg border-gray-300 focus:ring-amber-500"
                                    />
                                    <label htmlFor="isPublished" className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">Опубликовано</span>
                                        <p className="text-xs text-gray-400">Категория будет видна на сайте</p>
                                    </label>
                                    <div className={`w-2 h-2 rounded-full ${watch("isPublished") ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                </div>

                                {/* Кнопки */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || saveMutation.isPending}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-medium shadow-md disabled:opacity-60"
                                    >
                                        {saveMutation.isPending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <SaveIcon className="w-4 h-4" />
                                        )}
                                        <span>{editing ? "Сохранить" : "Создать"}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <TrashIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Удалить категорию?</h2>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center">
                                        <FolderTreeIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-gray-700 mb-1">
                                        Вы уверены, что хотите удалить категорию
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        «{deleteTarget.title}»
                                    </p>
                                    {(deleteTarget as any)._count?.products > 0 && (
                                        <p className="text-sm text-orange-600 mt-3 flex items-center justify-center gap-1">
                                            ⚠️ В этой категории {(deleteTarget as any)._count.products} блюд
                                        </p>
                                    )}
                                    <p className="text-sm text-red-500 mt-2">
                                        Это действие необратимо
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setDeleteTarget(null)}
                                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        disabled={deleteMutation.isPending}
                                        onClick={() => deleteMutation.mutate(deleteTarget.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-medium shadow-md disabled:opacity-60"
                                    >
                                        {deleteMutation.isPending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <TrashIcon className="w-4 h-4" />
                                        )}
                                        <span>Удалить</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}