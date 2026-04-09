
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, CameraIcon, SaveIcon } from 'lucide-react';
import {useQuery, useMutation} from "@tanstack/react-query"
import apiClient from "../../shared/api/api.ts";

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
}

export const AdminProfile = () => {
    const [avatar, setAvatar] = useState<File | null>(null);
    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/profile');
            return response.data;
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('address', data.address);
            formData.append('bio', data.bio);
            if (avatar) {
                formData.append('avatar', avatar);
            }
        }
    });

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8">
                    <h1 className="text-2xl font-bold text-white">Профиль администратора</h1>
                    <p className="text-amber-100 mt-1">Управление личной информацией</p>
                </div>

                <div className="p-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {profile?.name?.charAt(0) || 'A'}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full cursor-pointer shadow-lg">
                                <CameraIcon className="w-4 h-4 text-gray-600" />
                                <input type="file" className="hidden" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                        <h2 className="text-xl font-semibold mt-3">{profile?.name || 'Администратор'}</h2>
                        <p className="text-gray-500 text-sm">{profile?.role || 'Administrator'}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <UserIcon className="w-4 h-4 inline mr-2" />
                                    Имя
                                </label>
                                <input
                                    {...register('name', { required: 'Имя обязательно' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Введите имя"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MailIcon className="w-4 h-4 inline mr-2" />
                                    Email
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'Email обязателен',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Неверный формат email'
                                        }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                                    Телефон
                                </label>
                                <input
                                    {...register('phone')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="+7 (999) 123-45-67"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                                    Адрес
                                </label>
                                <input
                                    {...register('address')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Адрес ресторана"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                О себе
                            </label>
                            <textarea
                                {...register('bio')}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Расскажите о себе..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                            >
                                <SaveIcon className="w-4 h-4" />
                                <span>{updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

