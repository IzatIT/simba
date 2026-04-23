import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    PhoneIcon,
    MapPinIcon,
    ClockIcon,
    LinkIcon,
    ChartBarIcon,
    SparklesIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    InstagramIcon,
    MessageCircleIcon,
    SendIcon,
    AwardIcon,
    TrendingUpIcon,
    ChefHatIcon,
} from 'lucide-react';
import apiClient from '../../../shared/api/api.ts';
import type { SiteConfig } from '../../../shared/api/types.ts';
import {
    BuildingStorefrontIcon,
    ChatBubbleBottomCenterTextIcon,
    EnvelopeIcon,
    LightBulbIcon,
    PencilSquareIcon
} from "@heroicons/react/16/solid";
import {GlobeAltIcon} from "@heroicons/react/24/outline";

const DAY_LABELS: Record<string, string> = {
    MON: 'Пн', TUE: 'Вт', WED: 'Ср',
    THU: 'Чт', FRI: 'Пт', SAT: 'Сб', SUN: 'Вс',
};

// Современный компонент секции
const Section = ({ icon: Icon, title, children, badge }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    badge?: string;
}) => (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                    <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>
            {badge && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {badge}
                </span>
            )}
        </div>
        <div className="p-5 space-y-3">
            {children}
        </div>
    </div>
);


type RowProps = {
    label: string;
    value?: string;
    icon?: React.ElementType;
    children?: React.ReactNode;
};

// Современный компонент строки
const Row = ({ label, value, icon }: RowProps) => {
    const IconComponent = icon;
    return (
        <div className="flex items-start gap-3 text-sm group/row">
            {IconComponent && (
                <div className="mt-0.5">
                    <IconComponent className="w-3.5 h-3.5 text-gray-400" />
                </div>
            )}
            <span className="text-gray-500 w-28 flex-shrink-0 text-xs uppercase tracking-wide">{label}</span>
            <div className="flex-1 text-gray-800 font-medium break-all">
                {value || <span className="text-gray-300 italic">не указано</span>}
            </div>
        </div>
    );
};

// Компонент для отображения статуса
const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        active
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
        {active ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
        {active ? 'Активно' : 'Неактивно'}
    </span>
);

// Компонент для отображения тегов
const Tag = ({ children, color = 'amber' }: { children: React.ReactNode; color?: 'amber' | 'blue' | 'green' | 'purple' }) => {
    const colors = {
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
            {children}
        </span>
    );
};

// Компонент статистической карточки
const StatCard = ({ value, title }: { value: string; title: string }) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center hover:scale-105 transition-transform duration-200">
        <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {value}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{title}</div>
    </div>
);

export const AdminProfilePreview = () => {
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

    const social = (config.socialLinks as any) ?? {};
    const footer = (config.footer as any) ?? {};

    // Подсчет заполненных секций
    const filledSections = [
        config.email || config.phoneNumbers?.length,
        config.addresses?.length,
        social.instagram || social.whatsapp || social.telegram,
        config.worktimeItems?.length,
        config.statisticItems?.length,
        config.philosophyBlock?.title,
        config.personBlock?.title,
        footer.title || footer.subtitle,
    ].filter(Boolean).length;

    const totalSections = 8;
    const completionPercent = Math.round((filledSections / totalSections) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header with completion bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                    <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        {config.siteTitle || 'Название ресторана'}
                                    </h1>
                                    {config.siteSubtitle && (
                                        <p className="text-sm text-gray-500 mt-0.5">{config.siteSubtitle}</p>
                                    )}
                                </div>
                            </div>
                            {config.email && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    <a href={`mailto:${config.email}`} className="hover:text-amber-600 transition-colors">
                                        {config.email}
                                    </a>
                                </div>
                            )}
                        </div>
                        <Link
                            to="/admin/profile/edit"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                            Редактировать профиль
                        </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">Заполнение профиля</span>
                            <span className="text-xs font-semibold text-amber-600">{completionPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Заполнено {filledSections} из {totalSections} разделов
                        </p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Контакты */}
                    <Section icon={PhoneIcon} title="Контакты" badge={config.email || config.phoneNumbers?.length ? 'Заполнено' : 'Не заполнено'}>
                        {config.email && (
                            <Row label="Email" value={config.email} icon={EnvelopeIcon} />
                        )}
                        {config.phoneNumbers?.length > 0 && (
                            <div className="flex items-start gap-3 text-sm">
                                <span className="text-gray-500 w-28 flex-shrink-0 text-xs uppercase tracking-wide">Телефоны</span>
                                <div className="flex flex-wrap gap-2">
                                    {config.phoneNumbers.map((p, i) => (
                                        <Tag key={i} color="green">{p}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!config.email && !config.phoneNumbers?.length && (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <PhoneIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Контактные данные не добавлены
                            </div>
                        )}
                    </Section>

                    {/* Адрес */}
                    <Section icon={MapPinIcon} title="Адрес" badge={config.addresses?.length ? `${config.addresses.length} адр.` : 'Не указан'}>
                        {config.addresses?.length > 0 ? (
                            <>
                                {config.addresses.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                        <span className="text-gray-800 font-medium">{a}</span>
                                    </div>
                                ))}
                                {config.addressCoords && (
                                    <div className="flex items-start gap-3 text-sm pt-2">
                                        <LinkIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                        <a
                                            href={`https://www.google.com/maps?q=${config.addressCoords[0]},${config.addressCoords[1]}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-amber-600 hover:underline font-medium flex items-center gap-1"
                                        >
                                            Посмотреть на карте
                                            <span className="text-xs text-gray-400">
                                                ({config.addressCoords[0].toFixed(4)},{' '}
                                                {config.addressCoords[1].toFixed(4)})
                                            </span>
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <MapPinIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Адрес не добавлен
                            </div>
                        )}
                    </Section>

                    {/* Социальные сети */}
                    <Section icon={GlobeAltIcon} title="Социальные сети" badge={social.instagram || social.whatsapp || social.telegram ? 'Подключены' : 'Не подключены'}>
                        {social.instagram && (
                            <Row label="Instagram" value={social.instagram} icon={InstagramIcon}>
                                <a href={social.instagram} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline break-all">
                                    {social.instagram}
                                </a>
                            </Row>
                        )}
                        {social.whatsapp && (
                            <Row label="WhatsApp" value={social.whatsapp} icon={MessageCircleIcon}>
                                <a href={social.whatsapp} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline break-all">
                                    {social.whatsapp}
                                </a>
                            </Row>
                        )}
                        {social.telegram && (
                            <Row label="Telegram" value={social.telegram} icon={SendIcon}>
                                <a href={social.telegram} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline break-all">
                                    {social.telegram}
                                </a>
                            </Row>
                        )}
                        {!social.instagram && !social.whatsapp && !social.telegram && (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <GlobeAltIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Социальные сети не добавлены
                            </div>
                        )}
                    </Section>

                    {/* Режим работы */}
                    <Section icon={ClockIcon} title="Режим работы" badge={config.is24Hours ? '24/7' : 'График'}>
                        {config.is24Hours ? (
                            <div className="flex items-center justify-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <ClockIcon className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-green-700 font-medium">Работает круглосуточно, без выходных</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {config.worktimeItems?.map(w => (
                                    <div key={w.dayKey} className="flex items-center gap-3 text-sm py-1">
                                        <span className="w-8 text-gray-500 font-medium text-xs uppercase">{DAY_LABELS[w.dayKey]}</span>
                                        <div className="flex-1">
                                            {w.isClosed ? (
                                                <span className="text-red-400 text-xs">Выходной</span>
                                            ) : (
                                                <span className="text-gray-700">
                                                    {w.openTime} — {w.closeTime}
                                                </span>
                                            )}
                                        </div>
                                        {!w.isClosed && (
                                            <StatusBadge active={true} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Статистика */}
                    <Section icon={TrendingUpIcon} title="Статистика" badge={config.statisticItems?.length ? `${config.statisticItems.length} показ.` : 'Нет данных'}>
                        {config.statisticItems?.length ? (
                            <div className="grid grid-cols-2 gap-3">
                                {config.statisticItems.map(s => (
                                    <StatCard key={s.id} value={s.value} title={s.title} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <ChartBarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Статистические данные не добавлены
                            </div>
                        )}
                    </Section>

                    {/* Философия */}
                    <Section icon={LightBulbIcon} title="Философия" badge={config.philosophyBlock?.items?.length ? `${config.philosophyBlock.items.length} пунктов` : 'Не настроена'}>
                        {config.philosophyBlock ? (
                            <>
                                <Row label="Заголовок" value={config.philosophyBlock.title} />
                                {config.philosophyBlock.subtitle && (
                                    <Row label="Подзаголовок" value={config.philosophyBlock.subtitle} />
                                )}
                                {config.philosophyBlock.items?.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Ценности</span>
                                        <div className="flex flex-wrap gap-2">
                                            {config.philosophyBlock.items.map((item, i) => (
                                                <Tag key={i} color="purple">{item.title}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Философия ресторана не настроена
                            </div>
                        )}
                    </Section>

                    {/* Шеф-повар */}
                    <Section icon={ChefHatIcon} title="Шеф-повар" badge={config.personBlock?.title ? 'Заполнено' : 'Не указан'}>
                        {config.personBlock ? (
                            <>
                                <Row label="Имя" value={config.personBlock.title} icon={UserIcon} />
                                {config.personBlock.subtitle && (
                                    <Row label="Описание" value={config.personBlock.subtitle} />
                                )}
                                {config.personBlock.awards?.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AwardIcon className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Награды</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {config.personBlock.awards.map((a, i) => (
                                                <Tag key={i} color="amber">{a}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Информация о шеф-поваре не добавлена
                            </div>
                        )}
                    </Section>

                    {/* Футер */}
                    <Section icon={ChatBubbleBottomCenterTextIcon} title="Футер" badge={footer.title || footer.subtitle ? 'Настроен' : 'Не настроен'}>
                        {footer.title || footer.subtitle ? (
                            <>
                                {footer.title && <Row label="Заголовок" value={footer.title} />}
                                {footer.subtitle && <Row label="Подпись" value={footer.subtitle} />}
                            </>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Футер не настроен
                            </div>
                        )}
                    </Section>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            </div>
        </div>
    );
};