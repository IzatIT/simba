import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    ShieldIcon,
    ShieldCheckIcon,
    ShieldAlertIcon,
    UserIcon,
    UsersIcon,
    PlusIcon,
    Edit2Icon,
    TrashIcon,
    XIcon,
    SearchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MailIcon,
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    EyeOffIcon,
    FilterIcon,
    ArrowUpDownIcon,
    CalendarIcon,
    CrownIcon,
} from 'lucide-react';
import apiClient from '../../../shared/api/api.ts';
import { Path } from '../../../shared/api/path.ts';
import type { AdminRole, AdminUser } from '../../../shared/api/types.ts';
import { authService } from '../../../entities/auth/api.ts';

// ─── Roles ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<AdminRole, string> = {
    SUPER_ADMIN: 'Супер-админ',
    ADMIN: 'Администратор',
    MANAGER: 'Менеджер',
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
    SUPER_ADMIN: 'Полный доступ. Управление пользователями и ролями.',
    ADMIN: 'Управление меню, конфигурацией сайта, бронированиями.',
    MANAGER: 'Работа с бронированиями и медиа.',
};

const ROLE_STYLE: Record<AdminRole, { badge: string; icon: typeof ShieldIcon; gradient: string }> = {
    SUPER_ADMIN: {
        badge: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
        icon: ShieldAlertIcon,
        gradient: 'from-red-500 to-rose-500',
    },
    ADMIN: {
        badge: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200',
        icon: ShieldCheckIcon,
        gradient: 'from-indigo-500 to-purple-500',
    },
    MANAGER: {
        badge: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
        icon: ShieldIcon,
        gradient: 'from-emerald-500 to-teal-500',
    },
};

const PAGE_LIMIT = 10;

interface Paginated<T> {
    items: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

function getErrMsg(err: unknown): string {
    const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = e?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return e?.message ?? 'Ошибка запроса';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const AdminUsers = () => {
    const queryClient = useQueryClient();

    const { data: currentUser } = useQuery<AdminUser>({
        queryKey: ['auth-me'],
        queryFn: authService.getCurrentUser,
    });

    const [search, setSearch] = useState('');
    const [role, setRole] = useState<AdminRole | 'all'>('all');
    const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
    const [sortBy, setSortBy] = useState<'email' | 'firstName' | 'createdAt'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const {
        data: listData,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ['admin-users', { search, role, active, sortBy, sortDir, page }],
        queryFn: async () => {
            const res = await apiClient.get(Path.Users.List, {
                params: {
                    ...(search ? { search } : {}),
                    ...(role !== 'all' ? { role } : {}),
                    ...(active !== 'all' ? { isActive: active } : {}),
                    sortBy,
                    sortDir,
                    page,
                    limit: PAGE_LIMIT,
                },
            });
            return unwrap<Paginated<AdminUser>>(res.data);
        },
    });

    const users = listData?.items ?? [];
    const totalPages = listData?.meta?.totalPages ?? 1;
    const total = listData?.meta?.total ?? 0;

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const res = await apiClient.patch(Path.Users.One(id), { isActive });
            return unwrap<AdminUser>(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('Статус обновлён', { icon: '🔄' });
        },
        onError: (err) => toast.error(getErrMsg(err)),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(Path.Users.One(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('Пользователь удалён', { icon: '🗑️' });
        },
        onError: (err) => toast.error(getErrMsg(err)),
    });

    const resetFilters = () => {
        setSearch('');
        setRole('all');
        setActive('all');
        setSortBy('createdAt');
        setSortDir('desc');
        setPage(1);
    };

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const forbidden = (error as { response?: { status?: number } } | null)?.response?.status === 403;

    // Подсчет статистики
    const activeCount = users.filter(u => u.isActive).length;
    const inactiveCount = users.filter(u => !u.isActive).length;
    const superAdminCount = users.filter(u => u.role === 'SUPER_ADMIN').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const managerCount = users.filter(u => u.role === 'MANAGER').length;

    if (forbidden) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
                        <ShieldAlertIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Доступ запрещён</h2>
                    <p className="text-gray-500">
                        Модуль управления пользователями доступен только роли SUPER_ADMIN.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Управление пользователями
                            </h1>
                        </div>
                        <p className="text-gray-500 ml-1">
                            Управление администраторами, ролями и правами доступа
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Новый пользователь</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <StatCard label="Всего" value={total} icon={<UsersIcon className="w-5 h-5" />} gradient="from-gray-500 to-gray-600" />
                    <StatCard label="Активные" value={activeCount} icon={<CheckCircleIcon className="w-5 h-5" />} gradient="from-green-500 to-emerald-500" />
                    <StatCard label="Отключены" value={inactiveCount} icon={<XCircleIcon className="w-5 h-5" />} gradient="from-red-500 to-rose-500" />
                    <StatCard label="Супер-админы" value={superAdminCount} icon={<CrownIcon className="w-5 h-5" />} gradient="from-red-500 to-rose-500" />
                    <StatCard label="Администраторы" value={adminCount} icon={<ShieldCheckIcon className="w-5 h-5" />} gradient="from-indigo-500 to-purple-500" />
                    <StatCard label="Менеджеры" value={managerCount} icon={<ShieldIcon className="w-5 h-5" />} gradient="from-emerald-500 to-teal-500" />
                </div>

                {/* Roles Reference */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => {
                        const { badge, icon: Icon, gradient } = ROLE_STYLE[r];
                        return (
                            <div key={r} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${badge}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {ROLE_LABELS[r]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters Toggle */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FilterIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Фильтры и сортировка</span>
                            {(search || role !== 'all' || active !== 'all') && (
                                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                                    Активны
                                </span>
                            )}
                        </div>
                        <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                    </button>

                    {showFilters && (
                        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="relative md:col-span-2">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Имя, фамилия или email..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => { setRole(e.target.value as AdminRole | 'all'); setPage(1); }}
                                    className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="all">Все роли</option>
                                    {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                    ))}
                                </select>
                                <select
                                    value={active}
                                    onChange={(e) => { setActive(e.target.value as 'all' | 'true' | 'false'); setPage(1); }}
                                    className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="true">Активные</option>
                                    <option value="false">Отключённые</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">Сортировка:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                                    >
                                        <option value="createdAt">По дате создания</option>
                                        <option value="email">По email</option>
                                        <option value="firstName">По имени</option>
                                    </select>
                                    <button
                                        onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <ArrowUpDownIcon className="w-3.5 h-3.5" />
                                        {sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'}
                                    </button>
                                </div>
                                <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-amber-600 transition-colors">
                                    Сбросить все
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <UsersIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <UsersIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Пользователи не найдены</p>
                        <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры фильтрации</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <Th>Пользователь</Th>
                                    <Th>Email</Th>
                                    <Th>Роль</Th>
                                    <Th>Статус</Th>
                                    <Th>Создан</Th>
                                    <Th align="right">Действия</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {users.map((u) => {
                                    const { badge, icon: RoleIcon, gradient } = ROLE_STYLE[u.role];
                                    const isSelf = currentUser?.id === u.id;
                                    return (
                                        <tr key={u.id} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-transparent transition-all duration-200 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                                                        {(u.firstName[0] ?? '').toUpperCase()}
                                                        {(u.lastName[0] ?? '').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                            {u.firstName} {u.lastName}
                                                            {isSelf && (
                                                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                                                        Это вы
                                                                    </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <MailIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    {u.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${badge}`}>
                                                        <RoleIcon className="w-3 h-3" />
                                                        {ROLE_LABELS[u.role]}
                                                    </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            Активен
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-gray-400 text-sm">
                                                            <XCircleIcon className="w-4 h-4" />
                                                            Отключён
                                                        </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    {u.createdAt
                                                        ? new Date(u.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ActionButton
                                                        onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
                                                        disabled={isSelf || !isSuperAdmin}
                                                        icon={u.isActive ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                        color={u.isActive ? 'gray' : 'green'}
                                                        title={isSelf ? 'Нельзя отключить себя' : (u.isActive ? 'Отключить' : 'Активировать')}
                                                    />
                                                    <ActionButton
                                                        onClick={() => { setEditing(u); setIsFormOpen(true); }}
                                                        icon={<Edit2Icon className="w-4 h-4" />}
                                                        color="blue"
                                                        title="Редактировать"
                                                    />
                                                    <ActionButton
                                                        onClick={() => {
                                                            if (confirm(`Удалить пользователя ${u.firstName} ${u.lastName}?`)) {
                                                                deleteMutation.mutate(u.id);
                                                            }
                                                        }}
                                                        disabled={isSelf}
                                                        icon={<TrashIcon className="w-4 h-4" />}
                                                        color="red"
                                                        title={isSelf ? 'Нельзя удалить себя' : 'Удалить'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <span className="text-sm text-gray-500">
                                    Всего: {total} {isFetching && '(обновление…)'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        <span className="text-sm">Назад</span>
                                    </button>
                                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                                    >
                                        <span className="text-sm">Вперёд</span>
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Modal */}
                {isFormOpen && (
                    <UserFormModal
                        user={editing}
                        currentUser={currentUser}
                        onClose={() => setIsFormOpen(false)}
                        onSaved={() => {
                            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                            setIsFormOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// ─── Table Head ─────────────────────────────────────────────────────────────

const Th = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
    <th className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {children}
    </th>
);

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, gradient }: { label: string; value: number; icon: React.ReactNode; gradient: string }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-sm`}>
                <div className="w-4 h-4 text-white">{icon}</div>
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
);

// ─── Action Button ──────────────────────────────────────────────────────────

const ActionButton = ({ onClick, disabled, icon, color, title }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : `text-${color}-500 hover:bg-${color}-50 hover:scale-110`}`}
        title={title}
    >
        {icon}
    </button>
);

// ─── Form Modal ─────────────────────────────────────────────────────────────

interface UserFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
    isActive: boolean;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

function UserFormModal({
                           user,
                           currentUser,
                           onClose,
                           onSaved,
                       }: {
    user: AdminUser | null;
    currentUser?: AdminUser;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = Boolean(user);
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isSelf = currentUser?.id === user?.id;
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        defaultValues: {
            email: user?.email ?? '',
            password: '',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            role: user?.role ?? 'MANAGER',
            isActive: user?.isActive ?? true,
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: UserFormData) => {
        setError(null);
        setPending(true);
        try {
            if (isEdit && user) {
                const patch: Partial<UserFormData> = {};
                if (data.email !== user.email) patch.email = data.email;
                if (data.firstName !== user.firstName) patch.firstName = data.firstName;
                if (data.lastName !== user.lastName) patch.lastName = data.lastName;
                if (isSuperAdmin && data.role !== user.role) patch.role = data.role;
                if (data.isActive !== user.isActive) patch.isActive = data.isActive;
                if (data.password) patch.password = data.password;
                await apiClient.patch(Path.Users.One(user.id), patch);
                toast.success('Пользователь обновлён', { icon: '✅' });
            } else {
                await apiClient.post(Path.Users.List, {
                    email: data.email,
                    password: data.password,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role,
                });
                toast.success('Пользователь создан', { icon: '👤' });
            }
            onSaved();
        } catch (err) {
            setError(getErrMsg(err));
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        if (isEdit && !isSuperAdmin && user && selectedRole !== user.role) {
            setError('Только SUPER_ADMIN может менять роли');
        }
    }, [selectedRole, isSuperAdmin, isEdit, user]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                                    <UsersIcon className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}
                                </h2>
                            </div>
                            {isSelf && (
                                <p className="text-xs text-amber-600">Вы редактируете свою учётную запись</p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Имя <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('firstName', { required: 'Имя обязательно', maxLength: { value: 100, message: 'Макс. 100 символов' } })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder="Введите имя"
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Фамилия <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('lastName', { required: 'Фамилия обязательна', maxLength: { value: 100, message: 'Макс. 100 символов' } })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder="Введите фамилию"
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                {...register('email', { required: 'Email обязателен', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' } })}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                                placeholder="user@example.com"
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Пароль {isEdit ? '(оставьте пустым, чтобы не менять)' : <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                {...register('password', {
                                    required: isEdit ? false : 'Пароль обязателен',
                                    minLength: { value: 8, message: 'Минимум 8 символов' },
                                    maxLength: { value: 128, message: 'Максимум 128' },
                                    validate: (v) => {
                                        if (!v) return true;
                                        return PASSWORD_REGEX.test(v) || 'Должен содержать заглавную, строчную букву и цифру';
                                    },
                                })}
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                        <p className="mt-1 text-xs text-gray-400">Минимум 8 символов, заглавная и строчная буква, цифра.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Роль</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => {
                                const { badge, icon: Icon } = ROLE_STYLE[r];
                                const disabled = r === 'SUPER_ADMIN' && !isSuperAdmin;
                                const isSelected = selectedRole === r;
                                return (
                                    <label
                                        key={r}
                                        className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-amber-400 bg-amber-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <input type="radio" value={r} disabled={disabled} {...register('role', { required: true })} className="mt-0.5 w-4 h-4 text-amber-500 focus:ring-amber-500" />
                                        <div className="flex-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${badge}`}>
                                                <Icon className="w-3 h-3" />
                                                {ROLE_LABELS[r]}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        {isEdit && !isSuperAdmin && (
                            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                <ShieldAlertIcon className="w-3.5 h-3.5" />
                                Менять роли может только SUPER_ADMIN
                            </p>
                        )}
                    </div>

                    {isEdit && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div>
                                <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Активность учётной записи
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">Отключённый пользователь не сможет войти.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" {...register('isActive')} disabled={isSelf} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50" />
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                            <ShieldAlertIcon className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Отмена
                        </button>
                        <button type="submit" disabled={pending} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-medium shadow-md disabled:opacity-50">
                            {pending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <CheckCircleIcon className="w-4 h-4" />}
                            <span>{isEdit ? 'Сохранить' : 'Создать'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}