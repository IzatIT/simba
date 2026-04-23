import React, {useEffect, useMemo, useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import {motion, useScroll, useTransform, useSpring, AnimatePresence,} from 'framer-motion';
import {
    ChevronRight,
    Star,
    Clock,
    MapPin,
    Phone,
    Calendar,
    Utensils,
    Wine,
    Coffee,
    Users,
    Award,
    Heart,
    ArrowRight,
} from 'lucide-react';
import { usePublicConfig } from '../../entities/public-config/api.ts';

// Градиенты для stat-карточек (назначаются циклически, т.к. в БД цветов нет).
const STAT_GRADIENTS = [
    'from-amber-400 to-yellow-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
];

// Иконки для stat-карточек — тоже по индексу.
const STAT_ICONS = [
    <Star className="w-8 h-8" />,
    <Utensils className="w-8 h-8" />,
    <Users className="w-8 h-8" />,
    <Award className="w-8 h-8" />,
];

// Иконки для event-карточек — назначаются циклически, т.к. в БД их нет.
const EVENT_ICONS = [
    <Heart className="w-6 h-6" />,
    <Coffee className="w-6 h-6" />,
    <Wine className="w-6 h-6" />,
];

// UI-chrome: заголовки секций + креативные тексты. В backend-схеме для них нет полей
// (SiteConfiguration/footer жёстко ограничены DTO), поэтому держим как константы на
// фронте — легко перенести в БД, если позже добавить соответствующие поля.
const UI_TEXT = {
    hero: {
        badge: '✦ Добро пожаловать Конокбекова Сымбат ✦',
        title1: 'Искусство',
        title2: 'вкуса',
        subtitle:
            'Искусство вкуса — простить глупости, ведь тебя любит не за идеальность, а за то, что без тебя всё теряет вкус.',
        ctaReserve: 'Забронировать столик',
        ctaMenu: 'Посмотреть меню',
    },
    stats: {
        eyebrow: 'Наши достижения',
        title: 'Цифры, говорящие сами за себя',
        subtitle:
            'Мы гордимся каждым гостем и каждой наградой, которые стали частью нашей истории',
        footer: 'и это только начало нашей истории успеха ✦',
    },
    gallery: {
        titlePrefix: 'Атмосфера',
        titleAccent: 'ресторана',
        subtitle: 'Погрузитесь в уникальную атмосферу нашего заведения',
    },
    events: {
        titlePrefix: 'Специальные',
        titleAccent: 'события',
        subtitle: 'Мы создаем незабываемые моменты для особых случаев',
    },
    cta: {
        title1: 'Готовы попробовать',
        title2: 'нашу кухню?',
        subtitle:
            'Забронируйте столик прямо сейчас и насладитесь изысканной кухней в атмосфере уюта и гостеприимства',
        ctaReserve: 'Забронировать столик',
        ctaContact: 'Связаться с нами',
    },
} as const;

// Собираем строку часов из worktimeItems: "Ежедневно HH:MM - HH:MM", если все одинаковые.
function formatWorkingHours(
    items?: { openTime: string | null; closeTime: string | null; isClosed: boolean }[],
    is24Hours?: boolean,
): string {
    if (is24Hours) return 'Круглосуточно';
    const open = (items ?? []).filter((i) => !i.isClosed && i.openTime && i.closeTime);
    if (!open.length) return '';
    const allSame =
        open.length === 7 &&
        open.every((i) => i.openTime === open[0].openTime && i.closeTime === open[0].closeTime);
    return allSame ? `Ежедневно ${open[0].openTime} - ${open[0].closeTime}` : '';
}

export const Home: React.FC = () => {
    const { data: config } = usePublicConfig();

    const stats = useMemo(
        () =>
            (config?.statisticItems ?? []).map((s, i) => ({
                icon: STAT_ICONS[i % STAT_ICONS.length],
                value: s.value,
                label: s.title,
                description: s.subtitle ?? '',
                gradient: STAT_GRADIENTS[i % STAT_GRADIENTS.length],
            })),
        [config?.statisticItems],
    );
    const philosophyBlock = config?.philosophyBlock ?? null;
    const personBlock = config?.personBlock ?? null;
    const events = config?.eventItems ?? [];
    const galleryItems = config?.galleryItems ?? [];
    const phone = config?.phoneNumbers?.[0] ?? '';
    const address = config?.addresses?.[0] ?? '';
    const workingHours = formatWorkingHours(config?.worktimeItems, config?.is24Hours);

    // Hero-слайды берём из SiteConfigMedia slot=WELCOME_IMAGE.
    const heroImages = useMemo(() => {
        const items = (config?.siteConfigMedia ?? [])
            .filter((m) => m.slot === 'WELCOME_IMAGE' && m.media?.url)
            .sort((a, b) => a.order - b.order)
            .map((m) => ({ url: m.media.url, alt: m.media.alt ?? '' }));
        return items;
    }, [config?.siteConfigMedia]);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    const springConfig = { stiffness: 300, damping: 30, restDelta: 0.001 };
    const smoothY = useSpring(parallaxY, springConfig);

    useEffect(() => {
        if (heroImages.length < 2) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // Если данные догрузились и индекс вышел за пределы — откатываем к 0.
    useEffect(() => {
        if (heroImages.length > 0 && currentImageIndex >= heroImages.length) {
            setCurrentImageIndex(0);
        }
    }, [heroImages.length, currentImageIndex]);

    const nextImage = () => {
        if (heroImages.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    };

    const prevImage = () => {
        if (heroImages.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };
    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Hero Section с параллаксом */}
            <section
                ref={heroRef}
                className="relative h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Фоновое изображение с параллаксом и анимацией смены */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        y: smoothY,
                        scale: scale,
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 z-10" />

                    {heroImages.length > 0 && (
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImageIndex}
                                src={heroImages[currentImageIndex].url}
                                alt={heroImages[currentImageIndex].alt}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0.1, scale: 1 }}
                                animate={{ opacity: 1, scale: 1.2 }}
                                exit={{ opacity: 0.1, scale: 1.5 }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                            />
                        </AnimatePresence>
                    )}

                    {/* Градиент для лучшей читаемости текста */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
                </motion.div>

                {/* Индикаторы текущего слайда */}
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === currentImageIndex
                                    ? 'w-8 bg-gray-200'
                                    : 'w-4 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Перейти к слайду ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Кнопки навигации слайдшоу */}
                <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-accent-500 transition-colors"
                    aria-label="Предыдущее фото"
                >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </button>

                <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-accent-500 transition-colors"
                    aria-label="Следующее фото"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Контент с анимацией */}
                <motion.div
                    className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto"
                    style={{ opacity }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className="inline-block mb-6"
                    >
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm tracking-wider">
                            {UI_TEXT.hero.badge}
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-8xl font-display font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {UI_TEXT.hero.title1}
                        <span className="block text-accent-400">{UI_TEXT.hero.title2}</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        {UI_TEXT.hero.subtitle}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                    >
                        <Link to="/reservations">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-accent-500 text-white rounded-full font-medium overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                            >
                                <span className="relative z-10 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    {UI_TEXT.hero.ctaReserve}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-accent-600"
                                    initial={{ x: '100%' }}
                                    whileHover={{ x: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.button>
                        </Link>

                        <Link to="/breakfast">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-gray-900 transition-all cursor-pointer"
                            >
                                <span className="flex items-center">
                                    <Utensils className="w-5 h-5 mr-2" />
                                    {UI_TEXT.hero.ctaMenu}
                                </span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2" />
                    </div>
                </motion.div>

                {/* Анимированные частицы */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(100)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            animate={{
                                y: [null, -30, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* Floating Stats Section */}
            <section id="statistic" className="py-10 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                {/* Декоративные элементы */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
                </div>

                {/* Паттерн/сетка */}
                <div className="absolute inset-0 opacity-5"
                     style={{
                         backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
                         backgroundSize: '40px 40px'
                     }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Заголовок секции (опционально) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{UI_TEXT.stats.eyebrow}</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
                            {UI_TEXT.stats.title}
                        </h2>
                        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                            {UI_TEXT.stats.subtitle}
                        </p>
                    </motion.div>

                    {/* Статистика */}
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{
                                    y: -8,
                                    transition: { type: 'spring', stiffness: 400, damping: 10 }
                                }}
                                className="relative group"
                            >
                                {/* Карточка с градиентной обводкой */}
                                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                    {/* Градиентный фон при наведении */}
                                    <motion.div
                                        className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${stat.gradient}`}
                                        initial={false}
                                        transition={{ duration: 0.3 }}
                                    />

                                    {/* Иконка с градиентом */}
                                    <div className="relative mb-6">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {stat.icon}
                                        </div>

                                        {/* Блик на иконке */}
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl bg-white/30"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileHover={{ opacity: 1, scale: 1.2 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ filter: 'blur(4px)' }}
                                        />
                                    </div>

                                    {/* Значение */}
                                    <div className="relative">
                                        <motion.div
                                            className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold mb-2"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                <span className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </span>
                                        </motion.div>

                                        {/* Лейбл */}
                                        <div className="text-xl font-semibold text-gray-800 mb-1">
                                            {stat.label}
                                        </div>

                                        {/* Описание */}
                                        <p className="text-gray-500 text-sm">
                                            {stat.description}
                                        </p>
                                    </div>

                                    {/* Декоративная линия */}
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                                        viewport={{ once: true }}
                                        style={{ originX: 0 }}
                                    />
                                </div>

                                <motion.div
                                    className={`absolute -inset-2 bg-gradient-to-r ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl -z-10`}
                                    initial={false}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-center mt-12 text-gray-500 text-sm"
                    >
                        <p>{UI_TEXT.stats.footer}</p>
                    </motion.div>
                </div>
            </section>


            <section className="relative  py-20 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${
                            philosophyBlock?.img?.url ??
                            heroImages[3]?.url ??
                            heroImages[0]?.url ??
                            ''
                        })`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/60" />
                </motion.div>

                <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="max-w-2xl text-white"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6">
                                {philosophyBlock?.title ?? ""}
                            </h2>
                            {philosophyBlock?.subtitle && (
                                <p className="text-xl mb-8 text-gray-200">
                                    {philosophyBlock.subtitle}
                                </p>
                            )}
                            {(philosophyBlock?.items?.length ?? 0) > 0 && (
                                <div className="grid grid-cols-2 gap-6">
                                    {philosophyBlock!.items.slice(0, 2).map((item) => (
                                        <div key={item.id}>
                                            <div className="text-4xl font-bold text-accent-400 mb-2">
                                                {item.title}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-sm text-gray-300">
                                                    {item.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Галерея с параллаксом */}
            {galleryItems.length > 0 && (
                <section id="atmosphere" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="text-center max-w-3xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
                                {UI_TEXT.gallery.titlePrefix}{' '}
                                <span className="text-primary-600">{UI_TEXT.gallery.titleAccent}</span>
                            </h2>
                            <p className="text-xl text-gray-600">{UI_TEXT.gallery.subtitle}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Большая карточка — первый элемент */}
                            {galleryItems[0] && (
                                <motion.div
                                    className="relative h-full rounded-2xl overflow-hidden group min-h-[400px]"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={galleryItems[0].media?.url}
                                        alt={galleryItems[0].title ?? ''}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        {galleryItems[0].title && (
                                            <h3 className="text-2xl font-bold mb-2">{galleryItems[0].title}</h3>
                                        )}
                                        {galleryItems[0].subtitle && (
                                            <p className="text-gray-200">{galleryItems[0].subtitle}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {galleryItems.length > 1 && (
                                <div className="grid grid-rows-2 gap-4 h-full">
                                    {galleryItems.slice(1, 3).map((g) => (
                                        <motion.div
                                            key={g.id}
                                            className="relative rounded-2xl overflow-hidden group"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <img
                                                src={g.media?.url}
                                                alt={g.title ?? ''}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                {g.title && (
                                                    <h3 className="text-2xl font-bold mb-2">{g.title}</h3>
                                                )}
                                                {g.subtitle && (
                                                    <p className="text-gray-200">{g.subtitle}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-20 bg-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600 rounded-full filter blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500 rounded-full filter blur-3xl" />
                </div>

                <div id="chef" className="container mx-auto px-4 relative">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl sm:text-5xl font-display font-bold text-gray-900 mb-6">
                                <span className="block text-primary-600">
                                    {personBlock?.title ?? ''}
                                </span>
                            </h2>
                            {personBlock?.subtitle && (
                                <p className="text-xl text-gray-600 mb-8">
                                    {personBlock.subtitle}
                                </p>
                            )}
                            <div className="space-y-4 mb-8">
                                {(personBlock?.awards ?? []).map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                                            <Award className="w-8 h-8 text-green-700" />
                                        </div>
                                        <span className="text-gray-700">{item}</span>
                                    </motion.div>
                                ))}
                            </div>

                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative z-10">
                                {personBlock?.img?.url && <img
                                    src={personBlock?.img?.url}
                                    alt={personBlock?.title ?? 'Chef'}
                                    className="rounded-2xl shadow-2xl"
                                />}
                            </div>
                            <div className="absolute -top-6 -left-6 w-48 h-48 bg-primary-100 rounded-full -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="events" className="py-20 bg-gray-50 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.2"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="container mx-auto px-4 relative">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
                            {UI_TEXT.events.titlePrefix}{' '}
                            <span className="text-primary-600">{UI_TEXT.events.titleAccent}</span>
                        </h2>
                        <p className="text-xl text-gray-600">{UI_TEXT.events.subtitle}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                whileHover={{ y: -10 }}
                                viewport={{ once: true }}
                            >
                                {event.media?.url && (
                                    <img
                                        src={event.media.url}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-accent-500 rounded-full">
                                            {EVENT_ICONS[index % EVENT_ICONS.length]}
                                        </div>
                                        <h3 className="text-2xl font-bold">{event.title}</h3>
                                    </div>
                                    {event.subtitle && (
                                        <p className="text-gray-200 mb-4">{event.subtitle}</p>
                                    )}
                                </div>

                                {/* Hover overlay effect */}
                                <div className="absolute inset-0 bg-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-20 overflow-hidden">
                {/* Фоновое изображение с параллакс-эффектом */}
                <motion.div
                    className="absolute inset-0 z-0 top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `url(${heroImages[1]?.url ?? heroImages[0]?.url ?? ''})`,
                        backgroundSize: 'cover',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-accent-900/40" />
                </motion.div>

                {/* Декоративные элементы */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 h-full w-full flex items-center justify-center text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="max-w-4xl px-4"
                    >
                        {/* Заголовок */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
                        >
                            <span className="block text-accent-400 mt-2">{config?.footer?.title || ""}</span>
                        </motion.h2>

                        {/* Описание */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto"
                        >
                            {config?.footer?.subtitle || ""}
                        </motion.p>

                        {/* Кнопки */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
                        >
                            <Link to="/reservations">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(245, 158, 11, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative px-10 py-4 bg-accent-500 text-white rounded-full font-medium text-lg shadow-xl overflow-hidden cursor-pointer"
                                >
                                    <span className="relative z-10">{UI_TEXT.cta.ctaReserve}</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-accent-600 to-accent-400"
                                        initial={{ x: "100%" }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            </Link>

                            <Link to="/contacts">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative px-10 py-4 border-2 border-white text-white rounded-full font-medium text-lg overflow-hidden cursor-pointer"
                                >
                                    <span className="relative z-10">{UI_TEXT.cta.ctaContact}</span>
                                    <motion.div
                                        className="absolute inset-0 bg-white"
                                        initial={{ y: "100%" }}
                                        whileHover={{ y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ originY: 0 }}
                                    />
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Контактная информация */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap justify-center gap-8 pt-10 border-t border-white/20"
                        >
                            {phone && (
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    className="flex items-center gap-3 group cursor-default"
                                >
                                    <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                        <Phone className="w-5 h-5 text-accent-400" />
                                    </div>
                                    <span className="text-gray-200">{phone}</span>
                                </motion.div>
                            )}

                            {address && (
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    className="flex items-center gap-3 group cursor-default"
                                >
                                    <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                        <MapPin className="w-5 h-5 text-accent-400" />
                                    </div>
                                    <span className="text-gray-200">{address}</span>
                                </motion.div>
                            )}

                            {workingHours && (
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    className="flex items-center gap-3 group cursor-default"
                                >
                                    <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                        <Clock className="w-5 h-5 text-accent-400" />
                                    </div>
                                    <span className="text-gray-200">{workingHours}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};