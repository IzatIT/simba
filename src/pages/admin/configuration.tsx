// pages/admin/Configuration.tsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ImageIcon,
    PhoneIcon,
    MapPinIcon,
    ClockIcon,
    BarChart3Icon,
    LightbulbIcon,
    CameraIcon,
    UsersIcon,
    CalendarIcon,
    EyeIcon,
    PencilIcon,
    SaveIcon,
    XIcon,
    PlusIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    UploadIcon
} from 'lucide-react';
import apiClient from "../../shared/api/api.ts";

interface ConfigurationFormData {
    wellcomeImgs: File[];
    logo: File[];
    title: string;
    subtitle: string;
    phoneNumber: string[] | null;
    Instagram: string | null;
    WhatsApp: string | null;
    telegram: string | null;
    address: string[];
    addressLink: string;
    email: string | null;
    worktime: {
        is24Hour: boolean;
        data: Array<{ day: string; hour: string }>;
    };
    statistic: Array<{
        title: string;
        subtitle: string;
        statistic: string;
    }>;
    philosophy: {
        title: string;
        subtitle: string;
        img: File[];
        data: Array<{ title: string; subtitle: string }>;
    };
    photoGallery: Array<{
        img: File;
        title: string;
        subtitle: string;
    }>;
    person: {
        title: string;
        subtitle: string;
        img: File;
        awards: string[];
    };
    events: Array<{
        img: File;
        title: string;
        subtitle: string;
    }>;
    footer: {
        title: string;
        subtitle: string;
    };
}

export const AdminConfiguration = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImages, setPreviewImages] = useState<{ [key: string]: string }>({});
    const queryClient = useQueryClient();
    const { register, control, handleSubmit, reset, setValue, watch } = useForm<ConfigurationFormData>({
        defaultValues: {
            phoneNumber: [''],
            address: [''],
            worktime: {
                is24Hour: false,
                data: [
                    { day: 'Понедельник', hour: '' },
                    { day: 'Вторник', hour: '' },
                    { day: 'Среда', hour: '' },
                    { day: 'Четверг', hour: '' },
                    { day: 'Пятница', hour: '' },
                    { day: 'Суббота', hour: '' },
                    { day: 'Воскресенье', hour: '' }
                ]
            },
            statistic: [{ title: '', subtitle: '', statistic: '' }],
            philosophy: {
                data: [{ title: '', subtitle: '' }]
            },
            photoGallery: [],
            events: [],
            person: {
                awards: ['']
            }
        }
    });

    const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
        control,
        name: 'phoneNumber'
    });

    const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
        control,
        name: 'address'
    });

    const { fields: statisticFields, append: appendStatistic, remove: removeStatistic } = useFieldArray({
        control,
        name: 'statistic'
    });

    const { fields: philosophyDataFields, append: appendPhilosophyData, remove: removePhilosophyData } = useFieldArray({
        control,
        name: 'philosophy.data'
    });

    const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
        control,
        name: 'photoGallery'
    });

    const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
        control,
        name: 'events'
    });

    const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
        control,
        name: 'person.awards'
    });

    // Загрузка конфигурации
    const { data: config, isLoading } = useQuery({
        queryKey: ['configuration'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/configuration');
            return response.data;
        }
    });

    // Сохранение конфигурации
    const saveMutation = useMutation({
        mutationFn: async (data: ConfigurationFormData) => {
            const response = await apiClient.post('/admin/configuration', data);
            await queryClient.invalidateQueries({ queryKey: ['configuration'] });
            return response.data;
        },
        onSuccess: (data) => {
            reset(data);
        }
    });

    const onSubmit = (data: ConfigurationFormData) => {
        saveMutation.mutate(data);
    };

    const steps = [
        { id: 'welcome', title: 'Приветственный экран', icon: ImageIcon },
        { id: 'contact', title: 'Контакты', icon: PhoneIcon },
        { id: 'address', title: 'Адрес', icon: MapPinIcon },
        { id: 'worktime', title: 'Режим работы', icon: ClockIcon },
        { id: 'statistic', title: 'Статистика', icon: BarChart3Icon },
        { id: 'philosophy', title: 'Философия', icon: LightbulbIcon },
        { id: 'gallery', title: 'Фотогалерея', icon: CameraIcon },
        { id: 'person', title: 'Персона', icon: UsersIcon },
        { id: 'events', title: 'События', icon: CalendarIcon },
        { id: 'footer', title: 'Футер', icon: CalendarIcon }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, index?: number) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);
            setPreviewImages(prev => ({ ...prev, [`${fieldName}_${index || 0}`]: previewUrl }));

            if (index !== undefined) {
                // Для массива файлов
                const currentFiles = watch(fieldName as any) || [];
                if (Array.isArray(currentFiles)) {
                    const newFiles = [...currentFiles];
                    newFiles[index] = file;
                    setValue(fieldName as any, newFiles);
                }
            } else {
                setValue(fieldName as any, file);
            }
        }
    };

    const renderWelcomeStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Фоновые изображения</label>
                <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {previewImages[`wellcomeImgs_${index}`] ? (
                                <div className="relative">
                                    <img src={previewImages[`wellcomeImgs_${index}`]} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewImages(prev => {
                                                const newPrev = { ...prev };
                                                delete newPrev[`wellcomeImgs_${index}`];
                                                return newPrev;
                                            });
                                            const currentFiles = watch('wellcomeImgs') || [];
                                            const newFiles = [...currentFiles];
                                            newFiles[index] = undefined as any;
                                            setValue('wellcomeImgs', newFiles);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Загрузить фото {index + 1}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'wellcomeImgs', index)}
                                        disabled={!isEditing}
                                    />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Логотип</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center max-w-xs">
                    {previewImages['logo_0'] ? (
                        <div className="relative">
                            <img src={previewImages['logo_0']} alt="Logo" className="w-32 h-32 object-contain mx-auto" />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImages(prev => {
                                        const newPrev = { ...prev };
                                        delete newPrev['logo_0'];
                                        return newPrev;
                                    });
                                    setValue('logo', []);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Загрузить логотип</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'logo', 0)}
                                disabled={!isEditing}
                            />
                        </label>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                <input
                    {...register('title')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                <input
                    {...register('subtitle')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>
        </div>
    );

    const renderContactStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефоны</label>
                {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2 mb-2">
                        <input
                            {...register(`phoneNumber.${index}`)}
                            disabled={!isEditing}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                            placeholder="+7 (999) 123-45-67"
                        />
                        {isEditing && phoneFields.length > 1 && (
                            <button type="button" onClick={() => removePhone(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <button type="button" onClick={() => appendPhone('')} className="text-sm text-amber-600 hover:text-amber-700">
                        + Добавить телефон
                    </button>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                    {...register('Instagram')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    placeholder="https://instagram.com/..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                    {...register('WhatsApp')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    placeholder="https://wa.me/..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telegram</label>
                <input
                    {...register('telegram')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    placeholder="https://t.me/..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                    {...register('email')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    placeholder="info@restaurant.com"
                />
            </div>
        </div>
    );

    const renderAddressStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Адреса</label>
                {addressFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2 mb-2">
                        <input
                            {...register(`address.${index}`)}
                            disabled={!isEditing}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                            placeholder="г. Москва, ул. Примерная, д. 1"
                        />
                        {isEditing && addressFields.length > 1 && (
                            <button type="button" onClick={() => removeAddress(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <button type="button" onClick={() => appendAddress('')} className="text-sm text-amber-600 hover:text-amber-700">
                        + Добавить адрес
                    </button>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на карту</label>
                <input
                    {...register('addressLink')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    placeholder="https://maps.google.com/..."
                />
            </div>
        </div>
    );

    const renderWorktimeStep = () => (
        <div className="space-y-6">
            <div>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        {...register('worktime.is24Hour')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Круглосуточно</span>
                </label>
            </div>

            <div className="space-y-3">
                {watch('worktime.data')?.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                        <div className="font-medium text-gray-700 pt-2">{item.day}</div>
                        <input
                            {...register(`worktime.data.${index}.hour`)}
                            disabled={!isEditing || watch('worktime.is24Hour')}
                            placeholder="09:00 - 22:00"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStatisticStep = () => (
        <div className="space-y-6">
            {statisticFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Статистика #{index + 1}</h4>
                        {isEditing && statisticFields.length > 1 && (
                            <button type="button" onClick={() => removeStatistic(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <input
                        {...register(`statistic.${index}.title`)}
                        disabled={!isEditing}
                        placeholder="Заголовок"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                    <input
                        {...register(`statistic.${index}.subtitle`)}
                        disabled={!isEditing}
                        placeholder="Подзаголовок"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                    <input
                        {...register(`statistic.${index}.statistic`)}
                        disabled={!isEditing}
                        placeholder="Значение (например: 100+)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                </div>
            ))}
            {isEditing && (
                <button type="button" onClick={() => appendStatistic({ title: '', subtitle: '', statistic: '' })} className="flex items-center space-x-1 text-amber-600">
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить статистику</span>
                </button>
            )}
        </div>
    );

    const renderPhilosophyStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Изображение</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center max-w-md">
                    {previewImages['philosophy_img'] ? (
                        <div className="relative">
                            <img src={previewImages['philosophy_img']} alt="Philosophy" className="w-full h-48 object-cover rounded-lg" />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImages(prev => {
                                        const newPrev = { ...prev };
                                        delete newPrev['philosophy_img'];
                                        return newPrev;
                                    });
                                    setValue('philosophy.img', []);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Загрузить изображение</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'philosophy.img', 0)}
                                disabled={!isEditing}
                            />
                        </label>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                <input
                    {...register('philosophy.title')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                <input
                    {...register('philosophy.subtitle')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пункты философии</label>
                {philosophyDataFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 mb-3 space-y-3">
                        <div className="flex justify-between">
                            <h4 className="font-medium">Пункт #{index + 1}</h4>
                            {isEditing && philosophyDataFields.length > 1 && (
                                <button type="button" onClick={() => removePhilosophyData(index)} className="p-1 text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <input
                            {...register(`philosophy.data.${index}.title`)}
                            disabled={!isEditing}
                            placeholder="Заголовок"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                        />
                        <input
                            {...register(`philosophy.data.${index}.subtitle`)}
                            disabled={!isEditing}
                            placeholder="Подзаголовок"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                        />
                    </div>
                ))}
                {isEditing && (
                    <button type="button" onClick={() => appendPhilosophyData({ title: '', subtitle: '' })} className="text-sm text-amber-600">
                        + Добавить пункт
                    </button>
                )}
            </div>
        </div>
    );

    const renderGalleryStep = () => (
        <div className="space-y-6">
            {galleryFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                        <h4 className="font-medium">Фото #{index + 1}</h4>
                        {isEditing && (
                            <button type="button" onClick={() => removeGallery(index)} className="p-1 text-red-500">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {previewImages[`gallery_${index}`] ? (
                            <div className="relative">
                                <img src={previewImages[`gallery_${index}`]} alt="Gallery" className="w-full h-48 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImages(prev => {
                                            const newPrev = { ...prev };
                                            delete newPrev[`gallery_${index}`];
                                            return newPrev;
                                        });
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Загрузить фото</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, `photoGallery.${index}.img`)}
                                    disabled={!isEditing}
                                />
                            </label>
                        )}
                    </div>
                    <input
                        {...register(`photoGallery.${index}.title`)}
                        disabled={!isEditing}
                        placeholder="Название"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                    <input
                        {...register(`photoGallery.${index}.subtitle`)}
                        disabled={!isEditing}
                        placeholder="Описание"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                </div>
            ))}
            {isEditing && (
                <button type="button" onClick={() => appendGallery({ img: undefined as any, title: '', subtitle: '' })} className="flex items-center space-x-1 text-amber-600">
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить фото</span>
                </button>
            )}
        </div>
    );

    const renderPersonStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Фото персоны</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center max-w-md">
                    {previewImages['person_img'] ? (
                        <div className="relative">
                            <img src={previewImages['person_img']} alt="Person" className="w-full h-64 object-cover rounded-lg" />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImages(prev => {
                                        const newPrev = { ...prev };
                                        delete newPrev['person_img'];
                                        return newPrev;
                                    });
                                    setValue('person.img', undefined as any);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Загрузить фото</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'person.img', 0)}
                                disabled={!isEditing}
                            />
                        </label>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                <input
                    {...register('person.title')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                <input
                    {...register('person.subtitle')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Награды</label>
                {awardFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2 mb-2">
                        <input
                            {...register(`person.awards.${index}`)}
                            disabled={!isEditing}
                            placeholder="Награда"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                        />
                        {isEditing && awardFields.length > 1 && (
                            <button type="button" onClick={() => removeAward(index)} className="p-2 text-red-500">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <button type="button" onClick={() => appendAward('')} className="text-sm text-amber-600">
                        + Добавить награду
                    </button>
                )}
            </div>
        </div>
    );

    const renderEventsStep = () => (
        <div className="space-y-6">
            {eventFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                        <h4 className="font-medium">Событие #{index + 1}</h4>
                        {isEditing && (
                            <button type="button" onClick={() => removeEvent(index)} className="p-1 text-red-500">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {previewImages[`event_${index}`] ? (
                            <div className="relative">
                                <img src={previewImages[`event_${index}`]} alt="Event" className="w-full h-48 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImages(prev => {
                                            const newPrev = { ...prev };
                                            delete newPrev[`event_${index}`];
                                            return newPrev;
                                        });
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Загрузить фото</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, `events.${index}.img`)}
                                    disabled={!isEditing}
                                />
                            </label>
                        )}
                    </div>
                    <input
                        {...register(`events.${index}.title`)}
                        disabled={!isEditing}
                        placeholder="Название события"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                    <input
                        {...register(`events.${index}.subtitle`)}
                        disabled={!isEditing}
                        placeholder="Описание"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                </div>
            ))}
            {isEditing && (
                <button type="button" onClick={() => appendEvent({ img: undefined as any, title: '', subtitle: '' })} className="flex items-center space-x-1 text-amber-600">
                    <PlusIcon className="w-4 h-4" />
                    <span>Добавить событие</span>
                </button>
            )}
        </div>
    );

    const renderFooterStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок футера</label>
                <input
                    {...register('footer.title')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок футера</label>
                <input
                    {...register('footer.subtitle')}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return renderWelcomeStep();
            case 1: return renderContactStep();
            case 2: return renderAddressStep();
            case 3: return renderWorktimeStep();
            case 4: return renderStatisticStep();
            case 5: return renderPhilosophyStep();
            case 6: return renderGalleryStep();
            case 7: return renderPersonStep();
            case 8: return renderEventsStep();
            case 9: return renderFooterStep();
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full  mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Конфигурация ресторана</h1>
                            <p className="text-amber-100 mt-1">Управление настройками и контентом</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => isEditing ? handleSubmit(onSubmit)() : setIsEditing(true)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                isEditing
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                            }`}
                        >
                            {isEditing ? (
                                <>
                                    <SaveIcon className="w-4 h-4" />
                                    <span>Сохранить</span>
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Редактировать</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Steps Navigation */}
                <div className="border-b overflow-x-auto">
                    <div className="flex min-w-max">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(index)}
                                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 ${
                                        isCurrent
                                            ? 'border-amber-500 text-amber-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 min-h-[500px]">
                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="border-t px-6 py-4 bg-gray-50 flex justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                            <span>Назад</span>
                        </button>

                        <div className="flex space-x-3">
                            {!isEditing && (
                                <div className="text-sm text-gray-500 flex items-center">
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    Режим просмотра
                                </div>
                            )}
                            {isEditing && currentStep === steps.length - 1 && (
                                <button
                                    type="submit"
                                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700"
                                >
                                    <SaveIcon className="w-4 h-4" />
                                    <span>Сохранить все</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                                disabled={currentStep === steps.length - 1}
                                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Далее</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

