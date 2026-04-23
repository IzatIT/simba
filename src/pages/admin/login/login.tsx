import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {authService, type LoginCredentials} from "../../../entities/auth/api.ts";
import {Storage} from "../../../shared/utils/storage.ts";
import {resetRefreshCounter} from "../../../shared/api/api.ts";
import "./login.css"


const AdminLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Состояние проверки авторизации

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginCredentials>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginCredentials) => {
            const res = await authService.login(data);
            const daysToExpire = data.rememberMe ? 30 : 1;
            Storage.setItem("ACCESS_TOKEN", res.data.accessToken, daysToExpire);
            resetRefreshCounter(); // Сброс счетчика при успешном входе
            return res;
        },
        onSuccess: (res) => {
            // Редирект после успешного входа
            if (res.data.user.role === "ADMIN" || res.data.user.role === "SUPER_ADMIN") {
                navigate("/admin/profile", { replace: true });
            } else if (res.data.user.role === "MANAGER") {
                navigate("/admin/book", { replace: true });
            } else {
                navigate("/admin/profile", { replace: true });
            }
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message || error?.message || "Неверный email или пароль";
            setError("root", { message });
        },
    });

    const onSubmit = (data: LoginCredentials) => {
        loginMutation.mutate(data);
    };

    useEffect(() => {
        const checkAuth = async () => {
            setIsCheckingAuth(true);
            try {
                const token = Storage.getItem("ACCESS_TOKEN");
                if (!token) {
                    setIsCheckingAuth(false);
                    return;
                }

                const user = await authService.getCurrentUser();
                resetRefreshCounter();

                if (user && user.role) {
                    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                        navigate("/admin/profile", { replace: true });
                        return;
                    } else if (user.role === "MANAGER") {
                        navigate("/admin/book", { replace: true });
                        return;
                    }
                }
            } catch (error) {
                // Если ошибка при получении пользователя, очищаем токены
                console.error("Auth check failed:", error);
                Storage.removeItem("ACCESS_TOKEN");
                Storage.removeItem("REFRESH_TOKEN");
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [navigate]);

    // Показываем лоадер во время проверки авторизации
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-xl opacity-20 animate-pulse" />
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gray-600 font-medium">Проверка авторизации...</p>
                            <p className="text-xs text-gray-400">Пожалуйста, подождите</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Вход в панель управления
                        </h1>
                        <p className="text-sm text-gray-500">
                            Введите свои учетные данные для доступа
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email обязателен",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Введите корректный email",
                                        },
                                    })}
                                    className={`w-full pl-10 pr-3 py-3 border ${
                                        errors.email ? "border-red-500" : "border-gray-300"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="admin@restaurant.com"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Пароль
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Пароль обязателен",
                                        minLength: {
                                            value: 6,
                                            message: "Пароль должен быть не менее 6 символов",
                                        },
                                    })}
                                    className={`w-full pl-10 pr-12 py-3 border ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <svg
                                            className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Запомнить меня */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("rememberMe")}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Запомнить меня</span>
                            </label>
                        </div>

                        {errors.root && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-sm text-red-600 text-center">
                                    {errors.root.message}
                                </p>
                            </div>
                        )}

                        {/* Кнопка входа */}
                        <button
                            type="submit"
                            disabled={isSubmitting || loginMutation.isPending}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loginMutation.isPending ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Вход...</span>
                                </div>
                            ) : (
                                "Войти в панель управления"
                            )}
                        </button>
                    </form>

                    {/* Дополнительная информация */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            Безопасный вход для администраторов ресторана
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;