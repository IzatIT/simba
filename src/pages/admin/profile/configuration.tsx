import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    PhoneIcon, MapPinIcon, ClockIcon,
    PlusIcon, TrashIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon,
    MessageCircleIcon,
    MailIcon, AwardIcon,
    TrendingUpIcon, ChefHatIcon, InstagramIcon, MessagesSquare,
    UploadIcon, XIcon, ImageIcon, CalendarIcon, Edit2Icon, EyeOffIcon, EyeIcon,
} from 'lucide-react';
import apiClient from '../../../shared/api/api.ts';
import { Path } from '../../../shared/api/path.ts';
import type {
    SiteConfig, GalleryItem, EventItem, MediaRef,
} from '../../../shared/api/types.ts';
import { AddressField } from '../../../shared/maps/address-field.tsx';
import { BarChart3Icon } from 'lucide-react';
import {BuildingStorefrontIcon, LightBulbIcon} from "@heroicons/react/16/solid";
import {GlobeAltIcon} from "@heroicons/react/24/outline";

// Локальные типы форм
interface WorktimeFormItem {
    id?: string;
    dayKey: string;
    label: string;
    isClosed: boolean;
    openTime: string;
    closeTime: string;
    order: number;
}

interface StatisticFormItem {
    id?: string;
    title: string;
    subtitle: string;
    value: string;
    order: number;
}

interface PhilosophyFormItem {
    id?: string;
    title: string;
    subtitle: string;
    order: number;
}

type BasicForm = {
    siteTitle: string;
    siteSubtitle: string;
    email: string;
    footerTitle: string;
    footerSubtitle: string;
};

type ContactForm = {
    phoneNumbers: { value: string }[];
    addresses: { value: string }[];
    addressCoords: [number, number] | null;
    instagram: string;
    whatsapp: string;
    telegram: string;
};

type WorktimeForm = {
    is24Hours: boolean;
    items: WorktimeFormItem[];
};

type StatisticsForm = {
    items: StatisticFormItem[];
};

type PhilosophyForm = {
    title: string;
    subtitle: string;
    items: PhilosophyFormItem[];
};

type PersonForm = {
    title: string;
    subtitle: string;
    awards: { value: string }[];
};

const DAY_KEYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = {
    MON: 'Понедельник', TUE: 'Вторник', WED: 'Среда',
    THU: 'Четверг', FRI: 'Пятница', SAT: 'Суббота', SUN: 'Воскресенье',
};

// Современный компонент карточки
const Card = ({ children, className = '', icon, title }: { children: React.ReactNode; className?: string; icon?: React.ReactNode; title?: string }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
        {title && (
            <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-gray-50">
                {icon && <div className="text-amber-500">{icon}</div>}
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${props.className ?? ''}`}
    />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none ${props.className ?? ''}`}
    />
);

const SaveBtn = ({ loading, children }: { loading: boolean; children?: React.ReactNode }) => (
    <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
    >
        {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        ) : (
            <CheckIcon className="w-4 h-4" />
        )}
        {children || 'Сохранить'}
    </button>
);

// ─── Media upload helper ─────────────────────────────────────────────────────
// Apiclient дефолтит Content-Type=application/json, поэтому явно снимаем header
// для FormData, чтобы браузер/axios подставили multipart/form-data с boundary.
async function uploadMedia(file: File): Promise<MediaRef> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post(Path.Media.Upload, fd, {
        headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
    });
    const body = res.data as { data?: MediaRef } & MediaRef;
    return (body?.data ?? body) as MediaRef;
}

interface ImageUploadProps {
    value?: { id: string; url: string } | null;
    onChange: (media: MediaRef | null) => void;
    label?: string;
    helperText?: string;
    aspect?: 'square' | 'wide';
}

const ImageUpload = ({ value, onChange, label, helperText, aspect = 'wide' }: ImageUploadProps) => {
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const ratio = aspect === 'square' ? 'aspect-square' : 'aspect-[16/9]';

    const pick = () => inputRef.current?.click();

    const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const media = await uploadMedia(file);
            onChange(media);
            toast.success('Изображение загружено', { icon: '🖼️' });
        } catch {
            toast.error('Не удалось загрузить изображение');
        } finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div>
            {label && <Label>{label}</Label>}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
            {value?.url ? (
                <div className={`relative ${ratio} w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50`}>
                    <img src={value.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <button
                            type="button"
                            onClick={pick}
                            disabled={loading}
                            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow transition"
                            title="Заменить"
                        >
                            <UploadIcon className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            disabled={loading}
                            className="p-2 bg-white/90 hover:bg-red-50 rounded-lg shadow transition"
                            title="Удалить"
                        >
                            <XIcon className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={pick}
                    disabled={loading}
                    className={`w-full ${ratio} border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-amber-600 transition disabled:opacity-50`}
                >
                    {loading ? (
                        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <>
                            <UploadIcon className="w-6 h-6" />
                            <span className="text-sm">Загрузить изображение</span>
                        </>
                    )}
                </button>
            )}
            {helperText && <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

// Аватар-версия ImageUpload: компактная dropzone + маленькая overlay-кнопка.
const LogoUploadDropzone = ({
    loading,
    onPicked,
}: {
    loading: boolean;
    onPicked: (media: MediaRef) => void;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const pick = () => inputRef.current?.click();

    const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const media = await uploadMedia(file);
            onPicked(media);
        } catch {
            toast.error('Не удалось загрузить файл');
        } finally {
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
            <button
                type="button"
                onClick={pick}
                disabled={loading}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
            >
                {loading ? (
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <>
                        <UploadIcon className="w-6 h-6" />
                        <span className="text-xs">Загрузить</span>
                    </>
                )}
            </button>
        </>
    );
};

const LogoUploadButton = ({
    loading,
    onPicked,
}: {
    loading: boolean;
    onPicked: (media: MediaRef) => void;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const media = await uploadMedia(file);
            onPicked(media);
        } catch {
            toast.error('Не удалось загрузить файл');
        } finally {
            if (inputRef.current) inputRef.current.value = '';
        }
    };
    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="p-2 bg-white hover:bg-amber-50 border border-gray-200 rounded-full shadow disabled:opacity-50"
                title="Заменить"
            >
                <UploadIcon className="w-4 h-4 text-gray-700" />
            </button>
        </>
    );
};

// Степпер
const STEPS = [
    { id: 'basic',      label: 'Основное',       icon: BuildingStorefrontIcon, color: 'from-amber-500 to-orange-500' },
    { id: 'contacts',   label: 'Контакты и адрес', icon: PhoneIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'worktime',   label: 'Режим работы',    icon: ClockIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'statistics', label: 'Статистика',      icon: BarChart3Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'philosophy', label: 'Философия',       icon: LightBulbIcon, color: 'from-yellow-500 to-amber-500' },
    { id: 'person',     label: 'Шеф-повар',       icon: ChefHatIcon, color: 'from-red-500 to-rose-500' },
    { id: 'gallery',    label: 'Галерея',         icon: ImageIcon, color: 'from-fuchsia-500 to-pink-500' },
    { id: 'events',     label: 'События',         icon: CalendarIcon, color: 'from-rose-500 to-red-500' },
    { id: 'social',     label: 'Соцсети',         icon: GlobeAltIcon, color: 'from-indigo-500 to-blue-500' },
];

export const AdminProfileConfiguration = () => {
    const [step, setStep] = useState(0);
    const queryClient = useQueryClient();

    const { data: config, isLoading } = useQuery<SiteConfig>({
        queryKey: ['admin-config'],
        queryFn: async () => {
            const res = await apiClient.get('/admin/configuration');
            return res.data.data;
        },
    });

    if (isLoading || !config) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="animate-spin h-16 w-16 border-4 border-amber-500 border-t-transparent rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-6 h-6 text-amber-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-config'] });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Конфигурация ресторана
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-1">
                        Управление контентом, настройками и внешним видом сайта
                    </p>
                </div>

                {/* Modern Stepper */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 overflow-x-auto">
                    <div className="flex flex-wrap gap-2">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const active = i === step;
                            const completed = i < step;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(i)}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                        ${active
                                        ? `bg-gradient-to-r ${s.color} text-white shadow-md`
                                        : completed
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }
                                    `}
                                >
                                    {completed ? (
                                        <CheckIcon className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">{s.label}</span>
                                    {active && (
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    {step === 0 && <StepBasic config={config} onSaved={invalidate} />}
                    {step === 1 && <StepContacts config={config} onSaved={invalidate} />}
                    {step === 2 && <StepWorktime config={config} onSaved={invalidate} />}
                    {step === 3 && <StepStatistics config={config} onSaved={invalidate} />}
                    {step === 4 && <StepPhilosophy config={config} onSaved={invalidate} />}
                    {step === 5 && <StepPerson config={config} onSaved={invalidate} />}
                    {step === 6 && <StepGallery config={config} onSaved={invalidate} />}
                    {step === 7 && <StepEvents config={config} onSaved={invalidate} />}
                    {step === 8 && <StepSocialFooter config={config} onSaved={invalidate} />}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4">
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-all duration-200 rounded-xl hover:bg-gray-100"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Назад
                    </button>
                    <button
                        onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                        disabled={step === STEPS.length - 1}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-all duration-200 rounded-xl hover:bg-gray-100"
                    >
                        Далее
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Step 1: Основное
const StepBasic = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    // Логотип: отдельная SiteConfigMedia-запись slot=LOGO.
    // Загрузка происходит сразу при выборе — не ждёт кнопки «Сохранить»,
    // т.к. endpoint /admin/configuration/logo отдельный от PATCH основных данных.
    const currentLogo =
        config.siteConfigMedia?.find((m) => m.slot === 'LOGO')?.media ?? null;
    const [logo, setLogo] = useState<MediaRef | null>(currentLogo);
    const [logoSaving, setLogoSaving] = useState(false);

    useEffect(() => {
        setLogo(currentLogo);
        // depends on media id only — избежать бесконечного перерисовывания на ре-query
    }, [currentLogo?.id]);

    const persistLogo = async (media: MediaRef | null) => {
        setLogoSaving(true);
        try {
            await apiClient.put(Path.Configuration.Logo, { mediaId: media?.id ?? null });
            setLogo(media);
            toast.success(media ? 'Логотип обновлён' : 'Логотип удалён', { icon: '🖼️' });
            onSaved();
        } catch {
            toast.error('Не удалось сохранить логотип');
        } finally {
            setLogoSaving(false);
        }
    };

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<BasicForm>({
        defaultValues: {
            siteTitle:     config.siteTitle ?? '',
            siteSubtitle:  config.siteSubtitle ?? '',
            email:         config.email ?? '',
            footerTitle:   (config.footer as any)?.title ?? '',
            footerSubtitle: (config.footer as any)?.subtitle ?? '',
        },
    });

    const onSubmit = async (data: BasicForm) => {
        try {
            await apiClient.patch('/admin/configuration', {
                siteTitle:    data.siteTitle,
                siteSubtitle: data.siteSubtitle || undefined,
                email:        data.email || undefined,
                footer: {
                    title:    data.footerTitle,
                    subtitle: data.footerSubtitle,
                },
            });
            toast.success('Основные данные сохранены', { icon: '✅' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<BuildingStorefrontIcon className="w-5 h-5" />} title="Название ресторана">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Аватар / логотип */}
                    <div className="flex flex-col items-center md:items-start md:w-48 flex-shrink-0">
                        <Label>Логотип</Label>
                        {logo?.url ? (
                            <div className="relative">
                                <img
                                    src={logo.url}
                                    alt={logo.alt ?? 'Logo'}
                                    className="w-32 h-32 rounded-2xl object-cover border border-gray-200 shadow-sm"
                                />
                                <div className="absolute -bottom-2 -right-2 flex gap-1">
                                    <LogoUploadButton
                                        loading={logoSaving}
                                        onPicked={(m) => persistLogo(m)}
                                    />
                                    <button
                                        type="button"
                                        disabled={logoSaving}
                                        onClick={() => persistLogo(null)}
                                        className="p-2 bg-white hover:bg-red-50 border border-gray-200 rounded-full shadow disabled:opacity-50"
                                        title="Удалить"
                                    >
                                        <XIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <LogoUploadDropzone
                                loading={logoSaving}
                                onPicked={(m) => persistLogo(m)}
                            />
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            PNG/JPG/WebP, квадратное лучше. До 10 MB.
                        </p>
                    </div>

                    {/* Поля названия/подзаголовка/email */}
                    <div className="flex-1 space-y-5">
                        <div>
                            <Label required>Название</Label>
                            <Input {...register('siteTitle', { required: true })} placeholder="Название ресторана" />
                        </div>
                        <div>
                            <Label>Подзаголовок</Label>
                            <Input {...register('siteSubtitle')} placeholder="Краткое описание ресторана" />
                        </div>
                        <div>
                            <Label>Email для связи</Label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input {...register('email')} type="email" placeholder="info@restaurant.com" className="pl-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card icon={<GlobeAltIcon className="w-5 h-5" />} title="Футер сайта">
                <div className="space-y-5">
                    <div>
                        <Label>Заголовок футера</Label>
                        <Input {...register('footerTitle')} placeholder="Название в футере" />
                    </div>
                    <div>
                        <Label>Подпись</Label>
                        <Input {...register('footerSubtitle')} placeholder="© 2024 Все права защищены" />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={isSubmitting} />
            </div>
        </form>
    );
};

// Step 2: Контакты и адрес
const StepContacts = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<ContactForm>({
        defaultValues: {
            phoneNumbers: (config.phoneNumbers ?? []).map(v => ({ value: v })),
            addresses:    (config.addresses ?? []).map(v => ({ value: v })),
            addressCoords: config.addressCoords ?? null,
            instagram:    '',
            whatsapp:     '',
            telegram:     '',
        },
    });

    const phones   = useFieldArray({ control, name: 'phoneNumbers' });
    const addresses = useFieldArray({ control, name: 'addresses' });
    const coords = watch('addressCoords');

    const onSubmit = async (data: ContactForm) => {
        try {
            // socialLinks / email в этой форме не редактируются — шлём только контакты.
            await apiClient.patch('/admin/configuration', {
                phoneNumbers: data.phoneNumbers.map(p => p.value).filter(Boolean),
                addresses:    data.addresses.map(a => a.value).filter(Boolean),
                addressCoords: data.addressCoords ?? null,
            });
            toast.success('Контакты и адрес сохранены', { icon: '📍' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<PhoneIcon className="w-5 h-5" />} title="Телефоны">
                <div className="space-y-3">
                    {phones.fields.map((f, i) => (
                        <div key={f.id} className="flex gap-2">
                            <Input {...register(`phoneNumbers.${i}.value`)} placeholder="+996 (500) 363 533" />
                            <button type="button" onClick={() => phones.remove(i)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => phones.append({ value: '' })}
                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium mt-2">
                        <PlusIcon className="w-4 h-4" /> Добавить телефон
                    </button>
                </div>
            </Card>

            <Card icon={<MapPinIcon className="w-5 h-5" />} title="Адреса">
                <div className="space-y-3">
                    {addresses.fields.map((f, i) => (
                        <div key={f.id} className="flex gap-2">
                            <Input {...register(`addresses.${i}.value`)} placeholder="ул. Примерная, 1" />
                            <button type="button" onClick={() => addresses.remove(i)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addresses.append({ value: '' })}
                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium mt-2">
                        <PlusIcon className="w-4 h-4" /> Добавить адрес
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Label>Точка на карте</Label>
                    <AddressField
                        value={coords}
                        onChange={(c) => setValue('addressCoords', c, { shouldDirty: true })}
                    />
                    {coords && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>
                                {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
                            </span>
                            <button
                                type="button"
                                onClick={() => setValue('addressCoords', null, { shouldDirty: true })}
                                className="text-red-500 hover:text-red-600"
                            >
                                Сбросить
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={isSubmitting} />
            </div>
        </form>
    );
};

// Step 3: Режим работы
const StepWorktime = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    const defaultItems = DAY_KEYS.map((dayKey, i) => {
        const existing = config.worktimeItems?.find(w => w.dayKey === dayKey);
        return {
            dayKey,
            label:     existing?.label     ?? DAY_LABELS[dayKey],
            isClosed:  existing?.isClosed  ?? false,
            openTime:  existing?.openTime  ?? '11:00',
            closeTime: existing?.closeTime ?? '23:00',
            order: i,
        };
    });

    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<WorktimeForm>({
        defaultValues: { is24Hours: config.is24Hours ?? false, items: defaultItems },
    });

    const is24 = watch('is24Hours');
    const items = watch('items');

    const onSubmit = async (data: WorktimeForm) => {
        try {
            await apiClient.patch('/admin/configuration', { is24Hours: data.is24Hours });
            await apiClient.put('/admin/configuration/worktime', {
                items: data.items.map((item, i) => ({
                    dayKey:    item.dayKey,
                    label:     item.label,
                    isClosed:  item.isClosed,
                    openTime:  item.isClosed ? undefined : item.openTime,
                    closeTime: item.isClosed ? undefined : item.closeTime,
                    order: i,
                })),
            });
            toast.success('Режим работы сохранён', { icon: '🕐' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<ClockIcon className="w-5 h-5" />} title="Режим работы">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Круглосуточный режим</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register('is24Hours')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>

                {is24 ? (
                    <div className="text-center py-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                        <ClockIcon className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                        <p className="text-amber-600 font-medium">Ресторан работает круглосуточно без выходных</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {DAY_KEYS.map((dayKey, i) => (
                            <div key={dayKey} className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <span className="w-28 text-sm font-medium text-gray-700 flex-shrink-0">
                                    {DAY_LABELS[dayKey]}
                                </span>
                                <label className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        {...register(`items.${i}.isClosed`)}
                                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                                    />
                                    Выходной
                                </label>
                                {!items[i]?.isClosed && (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <input
                                            {...register(`items.${i}.openTime`)}
                                            type="time"
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                        <span className="text-gray-400">—</span>
                                        <input
                                            {...register(`items.${i}.closeTime`)}
                                            type="time"
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={isSubmitting} />
            </div>
        </form>
    );
};

// Step 4: Статистика
const StepStatistics = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    const [saving, setSaving] = useState(false);
    const { register, control, handleSubmit } = useForm<StatisticsForm>({
        defaultValues: {
            items: (config.statisticItems ?? []).map(s => ({
                id:       s.id,
                title:    s.title,
                subtitle: s.subtitle ?? '',
                value:    s.value,
                order:    s.order,
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const onSubmit = async (data: StatisticsForm) => {
        setSaving(true);
        try {
            const existing = config.statisticItems ?? [];
            const submitted = data.items;

            const deletedIds = existing
                .filter(e => !submitted.find(s => s.id === e.id))
                .map(e => e.id);
            await Promise.all(deletedIds.map(id =>
                apiClient.delete(`/admin/configuration/statistics/${id}`)
            ));

            for (const [i, item] of submitted.entries()) {
                const payload = { title: item.title, subtitle: item.subtitle || undefined, value: item.value, order: i };
                if (item.id) {
                    await apiClient.patch(`/admin/configuration/statistics/${item.id}`, payload);
                } else {
                    await apiClient.post('/admin/configuration/statistics', payload);
                }
            }

            toast.success('Статистика сохранена', { icon: '📊' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<TrendingUpIcon className="w-5 h-5" />} title="Статистика ресторана">
                <div className="space-y-4">
                    {fields.map((f, i) => (
                        <div key={f.id} className="flex gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <div>
                                    <Label required>Значение</Label>
                                    <Input {...register(`items.${i}.value`, { required: true })} placeholder="500+" />
                                </div>
                                <div>
                                    <Label required>Название</Label>
                                    <Input {...register(`items.${i}.title`, { required: true })} placeholder="Гостей" />
                                </div>
                                <div>
                                    <Label>Подпись</Label>
                                    <Input {...register(`items.${i}.subtitle`)} placeholder="за месяц" />
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(i)}
                                    className="self-center p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ title: '', subtitle: '', value: '', order: fields.length })}
                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                        <PlusIcon className="w-4 h-4" /> Добавить показатель
                    </button>
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={saving} />
            </div>
        </form>
    );
};

// Step 5: Философия
const StepPhilosophy = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    const [saving, setSaving] = useState(false);

    // Admin getConfig теперь возвращает philosophyBlock с img и items — единый источник.
    const block = config.philosophyBlock;
    const [img, setImg] = useState<MediaRef | null>(block?.img ?? null);

    useEffect(() => {
        setImg(block?.img ?? null);
    }, [block?.img]);

    const { register, control, handleSubmit } = useForm<PhilosophyForm>({
        values: {
            title:    block?.title    ?? '',
            subtitle: block?.subtitle ?? '',
            items: (block?.items ?? []).map(it => ({
                id:       it.id,
                title:    it.title,
                subtitle: it.subtitle ?? '',
                order:    it.order,
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const onSubmit = async (data: PhilosophyForm) => {
        setSaving(true);
        try {
            await apiClient.patch(Path.Configuration.Philosophy, {
                title:    data.title,
                subtitle: data.subtitle || undefined,
                imgId:    img?.id ?? undefined,
            });

            const existing = block?.items ?? [];
            const deletedIds = existing
                .filter(e => !data.items.find(s => s.id === e.id))
                .map(e => e.id);
            await Promise.all(deletedIds.map(id =>
                apiClient.delete(`/admin/configuration/philosophy/items/${id}`)
            ));

            for (const [i, item] of data.items.entries()) {
                const payload = { title: item.title, subtitle: item.subtitle || undefined, order: i };
                if (item.id) {
                    await apiClient.patch(`/admin/configuration/philosophy/items/${item.id}`, payload);
                } else {
                    await apiClient.post('/admin/configuration/philosophy/items', payload);
                }
            }

            toast.success('Философия сохранена', { icon: '💡' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<LightBulbIcon className="w-5 h-5" />} title="Философия ресторана">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1">
                        <ImageUpload
                            value={img}
                            onChange={(m) => setImg(m)}
                            label="Изображение блока"
                            helperText="Главное фото для секции «Философия»"
                            aspect="square"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <Label required>Заголовок</Label>
                            <Input {...register('title', { required: true })} placeholder="Наша философия" />
                        </div>
                        <div>
                            <Label>Подзаголовок</Label>
                            <Input {...register('subtitle')} placeholder="Мы готовим с душой" />
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Ценности">
                <div className="space-y-3">
                    {fields.map((f, i) => (
                        <div key={f.id} className="flex gap-3 p-4 bg-gradient-to-r from-amber-50/30 to-orange-50/30 rounded-xl">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                    <Label required>Заголовок</Label>
                                    <Input {...register(`items.${i}.title`, { required: true })} placeholder="Свежие продукты" />
                                </div>
                                <div>
                                    <Label>Описание</Label>
                                    <Input {...register(`items.${i}.subtitle`)} placeholder="Только местные фермеры" />
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(i)}
                                    className="self-center p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ title: '', subtitle: '', order: fields.length })}
                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                        <PlusIcon className="w-4 h-4" /> Добавить ценность
                    </button>
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={saving} />
            </div>
        </form>
    );
};

// Step 6: Шеф-повар
const StepPerson = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    // Admin getConfig теперь возвращает personBlock с img — единый источник.
    const person = config.personBlock;
    const [img, setImg] = useState<MediaRef | null>(person?.img ?? null);

    useEffect(() => {
        setImg(person?.img ?? null);
    }, [person?.img]);

    const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<PersonForm>({
        values: {
            title:    person?.title    ?? '',
            subtitle: person?.subtitle ?? '',
            awards:   (person?.awards ?? []).map(a => ({ value: a })),
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'awards' });

    const onSubmit = async (data: PersonForm) => {
        try {
            await apiClient.patch(Path.Configuration.Person, {
                title:    data.title,
                subtitle: data.subtitle || undefined,
                awards:   data.awards.map(a => a.value).filter(Boolean),
                // imgId — отправляем всегда, чтобы можно было очистить. Backend DTO optional,
                // но null в схеме Prisma допустим (imgId String? @db.Uuid).
                ...(img?.id ? { imgId: img.id } : { imgId: undefined }),
            });
            toast.success('Блок «Шеф-повар» сохранён', { icon: '👨‍🍳' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<ChefHatIcon className="w-5 h-5" />} title="Информация о шеф-поваре">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1">
                        <ImageUpload
                            value={img}
                            onChange={(m) => setImg(m)}
                            label="Фото"
                            helperText="JPG/PNG/WebP до 10 MB"
                            aspect="square"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <Label required>Имя / Заголовок</Label>
                            <Input {...register('title', { required: true })} placeholder="Шеф-повар" />
                        </div>
                        <div>
                            <Label>Описание</Label>
                            <TextArea {...register('subtitle')} rows={3} placeholder="15 лет опыта, авторская кухня..." />
                        </div>
                    </div>
                </div>
            </Card>

            <Card icon={<AwardIcon className="w-5 h-5" />} title="Награды">
                <div className="space-y-3">
                    {fields.map((f, i) => (
                        <div key={f.id} className="flex gap-2">
                            <div className="relative flex-1">
                                <AwardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input {...register(`awards.${i}.value`)} placeholder="Michelin Star 2023" className="pl-10" />
                            </div>
                            <button type="button" onClick={() => remove(i)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ value: '' })}
                            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                        <PlusIcon className="w-4 h-4" /> Добавить награду
                    </button>
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={isSubmitting} />
            </div>
        </form>
    );
};

// Step 7: Соцсети
const StepSocialFooter = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: {
            instagram: (config.socialLinks as any)?.instagram ?? '',
            whatsapp:  (config.socialLinks as any)?.whatsapp  ?? '',
            telegram:  (config.socialLinks as any)?.telegram  ?? '',
            footerTitle:    (config.footer as any)?.title    ?? '',
            footerSubtitle: (config.footer as any)?.subtitle ?? '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await apiClient.patch('/admin/configuration', {
                socialLinks: {
                    instagram: data.instagram || null,
                    whatsapp:  data.whatsapp  || null,
                    telegram:  data.telegram  || null,
                },
                footer: {
                    title:    data.footerTitle,
                    subtitle: data.footerSubtitle,
                },
            });
            toast.success('Соцсети и футер сохранены', { icon: '🌐' });
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card icon={<GlobeAltIcon className="w-5 h-5" />} title="Социальные сети">
                <div className="space-y-4">
                    <div className="relative">
                        <InstagramIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-500" />
                        <Input {...register('instagram')} placeholder="https://instagram.com/restaurant" className="pl-10" />
                    </div>
                    <div className="relative">
                        <MessageCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        <Input {...register('whatsapp')} placeholder="https://wa.me/77770000000" className="pl-10" />
                    </div>
                    <div className="relative">
                        <MessagesSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <Input {...register('telegram')} placeholder="https://t.me/restaurant" className="pl-10" />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <SaveBtn loading={isSubmitting} />
            </div>
        </form>
    );
};

// Отдельный шаг «Адрес» удалён — адреса и ссылка на карту редактируются
// в объединённом шаге «Контакты и адрес» (StepContacts).

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════════════

type GalleryFormData = {
    title: string;
    subtitle: string;
    order: number;
    isPublished: boolean;
};

const StepGallery = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    // Admin getConfig теперь включает galleryItems (все, без фильтра isPublished).
    const items = useMemo(
        () => (config.galleryItems ?? []).slice().sort((a, b) => a.order - b.order),
        [config.galleryItems],
    );
    const [editing, setEditing] = useState<GalleryItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const removeItem = async (id: string) => {
        if (!confirm('Удалить элемент галереи?')) return;
        try {
            await apiClient.delete(Path.Configuration.GalleryItem(id));
            toast.success('Удалено', { icon: '🗑️' });
            onSaved();
        } catch {
            toast.error('Не удалось удалить');
        }
    };

    const togglePublish = async (it: GalleryItem) => {
        try {
            await apiClient.patch(Path.Configuration.GalleryItem(it.id), {
                isPublished: !it.isPublished,
            });
            toast.success(!it.isPublished ? 'Опубликовано' : 'Скрыто', { icon: '👁️' });
            onSaved();
        } catch {
            toast.error('Ошибка');
        }
    };

    return (
        <div className="space-y-6">
            <Card icon={<ImageIcon className="w-5 h-5" />} title={`Галерея (${items.length})`}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                        Список берётся из публичной конфигурации — после создания
                        не забудьте опубликовать, чтобы элемент появился здесь.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(null);
                            setIsOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm hover:from-amber-600 hover:to-orange-700"
                    >
                        <PlusIcon className="w-4 h-4" /> Добавить
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Галерея пуста</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((it) => (
                            <div
                                key={it.id}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                            >
                                {it.media?.url ? (
                                    <img src={it.media.url} alt={it.title ?? ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                {!it.isPublished && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800/75 text-white text-xs rounded">
                                        Черновик
                                    </div>
                                )}
                                {(it.title || it.subtitle) && (
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
                                        {it.title && <p className="text-white font-medium text-sm">{it.title}</p>}
                                        {it.subtitle && <p className="text-white/80 text-xs">{it.subtitle}</p>}
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => togglePublish(it)}
                                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow"
                                        title={it.isPublished ? 'Скрыть' : 'Опубликовать'}
                                    >
                                        {it.isPublished ? (
                                            <EyeIcon className="w-4 h-4 text-gray-700" />
                                        ) : (
                                            <EyeOffIcon className="w-4 h-4 text-gray-700" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(it);
                                            setIsOpen(true);
                                        }}
                                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow"
                                        title="Редактировать"
                                    >
                                        <Edit2Icon className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(it.id)}
                                        className="p-1.5 bg-white/90 hover:bg-red-50 rounded-lg shadow"
                                        title="Удалить"
                                    >
                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {isOpen && (
                <GalleryFormModal
                    item={editing}
                    onClose={() => setIsOpen(false)}
                    onSaved={() => {
                        onSaved();
                        setIsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

function GalleryFormModal({
    item,
    onClose,
    onSaved,
}: {
    item: GalleryItem | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [media, setMedia] = useState<MediaRef | null>(item?.media ?? null);
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<GalleryFormData>({
        defaultValues: {
            title: item?.title ?? '',
            subtitle: item?.subtitle ?? '',
            order: item?.order ?? 0,
            isPublished: item?.isPublished ?? true,
        },
    });

    const onSubmit = async (data: GalleryFormData) => {
        if (!media?.id) {
            toast.error('Загрузите изображение');
            return;
        }
        const payload = {
            mediaId: media.id,
            title: data.title || undefined,
            subtitle: data.subtitle || undefined,
            order: Number(data.order) || 0,
            isPublished: data.isPublished,
        };
        try {
            if (item) {
                await apiClient.patch(Path.Configuration.GalleryItem(item.id), payload);
                toast.success('Изменено', { icon: '✅' });
            } else {
                await apiClient.post(Path.Configuration.Gallery, payload);
                toast.success('Добавлено в галерею', { icon: '🖼️' });
            }
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold">
                        {item ? 'Редактировать' : 'Новый элемент галереи'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <ImageUpload
                        value={media}
                        onChange={setMedia}
                        label="Изображение *"
                        helperText="Обязательное поле"
                        aspect="wide"
                    />

                    <div>
                        <Label>Заголовок</Label>
                        <Input {...register('title', { maxLength: 255 })} placeholder="Главный зал" />
                    </div>
                    <div>
                        <Label>Подпись</Label>
                        <TextArea {...register('subtitle', { maxLength: 500 })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Порядок</Label>
                            <Input
                                type="number"
                                min={0}
                                {...register('order', { valueAsNumber: true, min: 0 })}
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('isPublished')}
                                    className="w-4 h-4 rounded text-amber-500"
                                />
                                <span className="text-sm">Опубликовано</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <SaveBtn loading={isSubmitting}>{item ? 'Сохранить' : 'Создать'}</SaveBtn>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════

type EventFormData = {
    title: string;
    subtitle: string;
    startsAt: string;
    endsAt: string;
    order: number;
    isPublished: boolean;
};

const StepEvents = ({ config, onSaved }: { config: SiteConfig; onSaved: () => void }) => {
    // Admin getConfig теперь включает eventItems (все, без фильтра isPublished).
    const items = useMemo(
        () => (config.eventItems ?? []).slice().sort((a, b) => a.order - b.order),
        [config.eventItems],
    );
    const [editing, setEditing] = useState<EventItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const removeItem = async (id: string) => {
        if (!confirm('Удалить событие?')) return;
        try {
            await apiClient.delete(Path.Configuration.Event(id));
            toast.success('Удалено', { icon: '🗑️' });
            onSaved();
        } catch {
            toast.error('Не удалось удалить');
        }
    };

    const togglePublish = async (it: EventItem) => {
        try {
            await apiClient.patch(Path.Configuration.Event(it.id), {
                isPublished: !it.isPublished,
            });
            toast.success(!it.isPublished ? 'Опубликовано' : 'Скрыто', { icon: '👁️' });
            onSaved();
        } catch {
            toast.error('Ошибка');
        }
    };

    const fmtDt = (iso: string | null) =>
        iso
            ? new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
            : null;

    return (
        <div className="space-y-6">
            <Card icon={<CalendarIcon className="w-5 h-5" />} title={`События (${items.length})`}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                        Анонсы событий, акций и мероприятий.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(null);
                            setIsOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm hover:from-amber-600 hover:to-orange-700"
                    >
                        <PlusIcon className="w-4 h-4" /> Новое событие
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Нет событий</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((it) => (
                            <div
                                key={it.id}
                                className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
                            >
                                <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {it.media?.url ? (
                                        <img src={it.media.url} alt={it.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <CalendarIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {it.title}
                                                </h3>
                                                {!it.isPublished && (
                                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                                        Черновик
                                                    </span>
                                                )}
                                            </div>
                                            {it.subtitle && (
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                    {it.subtitle}
                                                </p>
                                            )}
                                            {(it.startsAt || it.endsAt) && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {fmtDt(it.startsAt) ?? '—'}
                                                    {it.endsAt && <> → {fmtDt(it.endsAt)}</>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => togglePublish(it)}
                                                className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                                                title={it.isPublished ? 'Скрыть' : 'Опубликовать'}
                                            >
                                                {it.isPublished ? (
                                                    <EyeIcon className="w-4 h-4" />
                                                ) : (
                                                    <EyeOffIcon className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditing(it);
                                                    setIsOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                                                title="Редактировать"
                                            >
                                                <Edit2Icon className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(it.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                title="Удалить"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {isOpen && (
                <EventFormModal
                    item={editing}
                    onClose={() => setIsOpen(false)}
                    onSaved={() => {
                        onSaved();
                        setIsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

function EventFormModal({
    item,
    onClose,
    onSaved,
}: {
    item: EventItem | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [media, setMedia] = useState<MediaRef | null>(item?.media ?? null);

    // datetime-local работает в локальной таймзоне. Конвертируем вручную,
    // чтобы не показать пользователю UTC в поле.
    const toLocal = (iso: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        const off = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - off).toISOString().slice(0, 16);
    };
    const toISO = (local: string) =>
        local ? new Date(local).toISOString() : undefined;

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<EventFormData>({
        defaultValues: {
            title: item?.title ?? '',
            subtitle: item?.subtitle ?? '',
            startsAt: toLocal(item?.startsAt ?? null),
            endsAt: toLocal(item?.endsAt ?? null),
            order: item?.order ?? 0,
            isPublished: item?.isPublished ?? true,
        },
    });

    const onSubmit = async (data: EventFormData) => {
        const payload = {
            title: data.title,
            subtitle: data.subtitle || undefined,
            mediaId: media?.id || undefined,
            startsAt: toISO(data.startsAt),
            endsAt: toISO(data.endsAt),
            order: Number(data.order) || 0,
            isPublished: data.isPublished,
        };
        try {
            if (item) {
                await apiClient.patch(Path.Configuration.Event(item.id), payload);
                toast.success('Сохранено', { icon: '✅' });
            } else {
                await apiClient.post(Path.Configuration.Events, payload);
                toast.success('Событие создано', { icon: '📅' });
            }
            onSaved();
        } catch {
            toast.error('Ошибка при сохранении');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold">
                        {item ? 'Редактировать событие' : 'Новое событие'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <ImageUpload
                        value={media}
                        onChange={setMedia}
                        label="Обложка"
                        helperText="Необязательно"
                        aspect="wide"
                    />

                    <div>
                        <Label required>Название</Label>
                        <Input
                            {...register('title', { required: true, maxLength: 255 })}
                            placeholder="Новогодний ужин"
                        />
                    </div>
                    <div>
                        <Label>Описание</Label>
                        <TextArea
                            {...register('subtitle', { maxLength: 500 })}
                            rows={3}
                            placeholder="Краткий анонс..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Начало</Label>
                            <Input type="datetime-local" {...register('startsAt')} />
                        </div>
                        <div>
                            <Label>Окончание</Label>
                            <Input type="datetime-local" {...register('endsAt')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Порядок</Label>
                            <Input
                                type="number"
                                min={0}
                                {...register('order', { valueAsNumber: true, min: 0 })}
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('isPublished')}
                                    className="w-4 h-4 rounded text-amber-500"
                                />
                                <span className="text-sm">Опубликовано</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <SaveBtn loading={isSubmitting}>{item ? 'Сохранить' : 'Создать'}</SaveBtn>
                    </div>
                </form>
            </div>
        </div>
    );
}