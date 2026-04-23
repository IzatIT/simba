import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    TagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XIcon,
    SaveIcon,
    HashIcon,
    EyeIcon,
    EyeOffIcon,
    CheckIcon,
    SearchIcon,
    RefreshCwIcon,
} from "lucide-react";
import apiClient from "../../../shared/api/api.ts";
import { Path } from "../../../shared/api/path.ts";
import type { ProductTag } from "../../../shared/api/types.ts";

interface TagFormData {
    title: string;
    slug: string;
    color: string;
    order: number;
    isActive: boolean;
}

const PRESET_COLORS = [
    "#EF4444", "#F97316", "#EAB308", "#22C55E", "#10B981",
    "#14B8A6", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
    "#EC4899", "#F43F5E", "#6B7280", "#4B5563", "#1F2937",
];


type TagCardProps = {
    tag: ProductTag;
    onEdit: (tag: ProductTag) => void;
    onDelete: (tag: ProductTag) => void;
    index: number;
};

// Современный компонент карточки тега
const TagCard = ({ tag, onEdit, onDelete }: TagCardProps) => {

    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-200"
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${tag.color || '#6366f1'}20, transparent)` }}
            />

            <div className="relative p-5">
                <div className="flex items-start gap-4 h-20">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                            style={{ backgroundColor: tag.color ?? "#9CA3AF" }}
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                            <TagIcon className="w-3 h-3 text-gray-600" />
                        </div>
                    </div>

                    {/* Информация о теге */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                {tag.title}
                            </h3>
                            {!tag.isActive && (
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    <EyeOffIcon className="w-3 h-3" />
                                    Скрыт
                                </span>
                            )}
                            {tag.isActive && (
                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                                    <EyeIcon className="w-3 h-3" />
                                    Активен
                                </span>
                            )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <code className="text-xs font-mono bg-gray-50 px-2 py-1 rounded-lg text-gray-600">
                                /{tag.slug}
                            </code>
                            <span className="text-xs text-gray-400">
                                Порядок: {tag.order}
                            </span>
                        </div>

                        {/* Индикатор использования */}
                        {/* {tag.productsCount > 0 && (
                            <div className="mt-2 text-xs text-amber-600">
                                Используется в {tag.productsCount} блюдах
                            </div>
                        )} */}
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => onEdit(tag)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Редактировать"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(tag)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Удалить"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Декоративная полоса внизу */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                    style={{ backgroundColor: tag.color ?? "#9CA3AF" }}
                />
            </div>
        </div>
    );
};

export function AdminProductTags() {
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ProductTag | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProductTag | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: tags = [], isLoading, refetch } = useQuery<ProductTag[]>({
        queryKey: ["admin-tags"],
        queryFn: async () => {
            const res = await apiClient.get<{data: ProductTag[]}>(Path.Menu.Tags);
            return res.data.data;
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TagFormData>({
        defaultValues: { title: "", slug: "", color: "#EF4444", order: 0, isActive: true },
    });

    const selectedColor = watch("color");

    // Автоматическая генерация slug из названия
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
        reset({ title: "", slug: "", color: "#EF4444", order: tags.length, isActive: true });
        setModalOpen(true);
    };

    const openEdit = (tag: ProductTag) => {
        setEditing(tag);
        reset({
            title: tag.title,
            slug: tag.slug,
            color: tag.color ?? "#EF4444",
            order: tag.order,
            isActive: tag.isActive,
        });
        setModalOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: TagFormData) => {
            const body = {
                title: data.title,
                slug: data.slug || generateSlug(data.title),
                color: data.color || undefined,
                order: Number(data.order),
                isActive: data.isActive,
            };
            if (editing) {
                await apiClient.patch(Path.Menu.Tag(editing.id), body);
            } else {
                await apiClient.post(Path.Menu.Tags, body);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-tags"] });
            toast.success(editing ? "Тег обновлён" : "Тег создан", {
                icon: "🏷️",
                style: { background: "#10B981", color: "#fff" },
            });
            setModalOpen(false);
        },
        onError: () => toast.error("Ошибка сохранения"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(Path.Menu.Tag(id));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-tags"] });
            toast.success("Тег удалён", { icon: "🗑️" });
            setDeleteTarget(null);
        },
        onError: () => toast.error("Ошибка удаления"),
    });

    const filteredTags = tags.filter(tag =>
        tag.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = tags.filter(t => t.isActive).length;
    const inactiveCount = tags.filter(t => !t.isActive).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                <TagIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Управление тегами
                            </h1>
                        </div>
                        <p className="text-gray-500 ml-1">
                            Организуйте и классифицируйте блюда с помощью тегов
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Создать тег</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Всего тегов</p>
                                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                                <TagIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Активные</p>
                                <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                <EyeIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Скрытые</p>
                                <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                                <EyeOffIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

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
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => refetch()}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                title="Обновить"
                            >
                                <RefreshCwIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tags Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <TagIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <TagIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Теги не найдены" : "Нет созданных тегов"}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={openCreate}
                                className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                            >
                                + Создать первый тег
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredTags.map((tag, index) => (
                            <TagCard
                                key={tag.id}
                                tag={tag}
                                index={index}
                                onEdit={openEdit}
                                onDelete={setDeleteTarget}
                            />
                        ))}
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
                                            <TagIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {editing ? "Редактировать тег" : "Создать тег"}
                                            </h2>
                                            <p className="text-white/80 text-sm">
                                                {editing ? "Измените параметры тега" : "Добавьте новый тег для блюд"}
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
                                        placeholder="Например: Острое"
                                        autoFocus
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <XIcon className="w-3 h-3" />
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Slug (URL-идентификатор)
                                    </label>
                                    <div className="relative">
                                        <HashIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            {...register("slug")}
                                            className="w-full border border-gray-200 rounded-xl px-9 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                            placeholder="spicy"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <RefreshCwIcon className="w-3 h-3" />
                                        Оставьте пустым — сгенерируется автоматически из названия
                                    </p>
                                </div>

                                {/* Цвет */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Цветовая схема
                                    </label>

                                    {/* Пресеты цветов */}
                                    <div className="grid grid-cols-8 gap-2 mb-3">
                                        {PRESET_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setValue("color", c)}
                                                className={`relative w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110 ${
                                                    selectedColor === c
                                                        ? "ring-2 ring-offset-2 ring-gray-900 scale-105"
                                                        : "hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {selectedColor === c && (
                                                    <CheckIcon className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Кастомный цвет */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div
                                            className="w-10 h-10 rounded-xl shadow-md flex-shrink-0"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                        <input
                                            {...register("color")}
                                            type="text"
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            placeholder="#EF4444"
                                        />
                                        <input
                                            type="color"
                                            value={selectedColor}
                                            onChange={(e) => setValue("color", e.target.value)}
                                            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Порядок и активность */}
                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                {...register("isActive")}
                                                className="w-5 h-5 text-amber-500 rounded-lg border-gray-300 focus:ring-amber-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Активен</span>
                                                <p className="text-xs text-gray-400">Отображать на сайте</p>
                                            </div>
                                        </label>
                                    </div>
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
                                    <h2 className="text-xl font-bold text-white">Удалить тег?</h2>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div
                                        className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg flex items-center justify-center"
                                        style={{ backgroundColor: deleteTarget.color ?? "#9CA3AF" }}
                                    >
                                        <TagIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-gray-700 mb-1">
                                        Вы уверены, что хотите удалить тег
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        «{deleteTarget.title}»
                                    </p>
                                    <p className="text-sm text-red-500 mt-3">
                                        ⚠️ Это действие необратимо
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