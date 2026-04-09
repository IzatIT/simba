import React, {useEffect, useRef, useState} from 'react';
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

export const Home: React.FC = () => {
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

    const heroImages = [
        {
            url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Элегантный зал ресторана'
        },
        {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Интерьер ресторана'
        },
        {
            url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
            alt: 'Атмосфера вечера'
        },
        {
            url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Приготовление блюд'
        },
        {
            url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Винная коллекция'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Меняем каждые 5 секунд

        return () => clearInterval(interval);
    }, [heroImages.length]);

    // Ручное переключение изображений
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    };

    const prevImage = () => {
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

                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={heroImages[currentImageIndex].url}
                            alt={heroImages[currentImageIndex].alt}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0.1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0.1, scale: 1.5 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    </AnimatePresence>

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
                            ✦ Добро пожаловать Конокбекова Сымбат ✦
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-8xl font-display font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        Искусство
                        <span className="block text-accent-400">вкуса</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        Искусство вкуса — простить глупости,
                        ведь тебя любит не за идеальность,
                        а за то, что без тебя всё теряет вкус.
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
                                    Забронировать столик
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
                                    Посмотреть меню
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
                        <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Наши достижения</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
                            Цифры, говорящие сами за себя
                        </h2>
                        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                            Мы гордимся каждым гостем и каждой наградой, которые стали частью нашей истории
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
                        {[
                            {
                                icon: <Star className="w-8 h-8" />,
                                value: '15+',
                                label: 'лет опыта',
                                description: 'безупречной работы',
                                gradient: 'from-amber-400 to-yellow-500'
                            },
                            {
                                icon: <Utensils className="w-8 h-8" />,
                                value: '150+',
                                label: 'блюд в меню',
                                description: 'на любой вкус',
                                gradient: 'from-emerald-400 to-teal-500'
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                value: '5000+',
                                label: 'гостей в месяц',
                                description: 'и это не предел',
                                gradient: 'from-blue-400 to-indigo-500'
                            },
                            {
                                icon: <Award className="w-8 h-8" />,
                                value: '25+',
                                label: 'наград',
                                description: 'и престижных премий',
                                gradient: 'from-purple-400 to-pink-500'
                            },
                        ].map((stat, index) => (
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

                                {/* Тень при наведении */}
                                <motion.div
                                    className={`absolute -inset-2 bg-gradient-to-r ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl -z-10`}
                                    initial={false}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Дополнительная информация (опционально) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-center mt-12 text-gray-500 text-sm"
                    >
                        <p>и это только начало нашей истории успеха ✦</p>
                    </motion.div>
                </div>
            </section>

            {/* About Section с параллаксом */}
            <section className="relative  py-20 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
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
                                Наша <span className="text-accent-400">философия</span>
                            </h2>
                            <p className="text-xl mb-8 text-gray-200">
                                Мы создаем не просто еду, мы создаем впечатления.
                                Каждое блюдо — это история, рассказанная шеф-поваром
                                с любовью к французской кулинарной традиции.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-4xl font-bold text-accent-400 mb-2">20+</div>
                                    <div className="text-sm text-gray-300">лет безупречного сервиса</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-accent-400 mb-2">100%</div>
                                    <div className="text-sm text-gray-300">свежие продукты</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Галерея с параллаксом */}
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
                            Атмосфера <span className="text-primary-600">ресторана</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Погрузитесь в уникальную атмосферу нашего заведения
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                            className="relative h-full rounded-2xl overflow-hidden group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="Restaurant interior"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-2xl font-bold mb-2">Основной зал</h3>
                                <p className="text-gray-200">Элегантный интерьер в классическом стиле</p>
                            </div>
                        </motion.div>

                        <div className="grid grid-rows-2 gap-4 h-full">
                            <motion.div
                                className="relative rounded-2xl overflow-hidden group"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1592861956120-e524fc739696?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                    alt="Wine cellar"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold mb-2">Винный погреб</h3>
                                    <p className="text-gray-200">Коллекция из 500+ вин со всего мира</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="relative rounded-2xl overflow-hidden group"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
                                    alt="Open kitchen"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold mb-2">Открытая кухня</h3>
                                    <p className="text-gray-200">Наблюдайте за процессом приготовления</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chef Section */}
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
                                Шеф-повар
                                <span className="block text-primary-600">Дастан Жээнбеков</span>
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Более 25 лет опыта работы в лучших ресторанах Франции.
                            </p>
                            <div className="space-y-4 mb-8">
                                {[
                                    'Член Французской кулинарной академии',
                                    'Победитель конкурса "Шеф года" 2026',
                                    'Автор книги "Секреты французской кухни"',
                                    'Опыт работы в лучших ресторанах Бишкека'
                                ].map((item, index) => (
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
                                <img
                                    src="/chief.png"
                                    alt="Chef"
                                    className="rounded-2xl shadow-2xl"
                                />
                                <motion.div
                                    className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl">25+</div>
                                        <div className="text-xs">лет опыта</div>
                                    </div>
                                </motion.div>
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
                            Специальные <span className="text-primary-600">события</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Мы создаем незабываемые моменты для особых случаев
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Романтический ужин',
                                description: 'Особая атмосфера для двоих, свечи, живая музыка и изысканное меню',
                                image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
                                icon: <Heart className="w-6 h-6" />
                            },
                            {
                                title: 'Бизнес-ланч',
                                description: 'Деловая встреча в комфортной обстановке с быстрой подачей блюд',
                                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                                icon: <Coffee className="w-6 h-6" />
                            },
                            {
                                title: 'Винная дегустация',
                                description: 'Эксклюзивные сорта вин в сопровождении сырной тарелки',
                                image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                                icon: <Wine className="w-6 h-6" />
                            }
                        ].map((event, index) => (
                            <motion.div
                                key={index}
                                className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                whileHover={{ y: -10 }}
                                viewport={{ once: true }}
                            >
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-accent-500 rounded-full">
                                            {event.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold">{event.title}</h3>
                                    </div>
                                    <p className="text-gray-200 mb-4">{event.description}</p>
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        className="flex items-center text-accent-400 font-medium"
                                    >
                                        Подробнее
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </motion.button>
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
                        backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
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
                            Готовы попробовать
                            <span className="block text-accent-400 mt-2">нашу кухню?</span>
                        </motion.h2>

                        {/* Описание */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto"
                        >
                            Забронируйте столик прямо сейчас и насладитесь изысканной кухней в атмосфере уюта и гостеприимства
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
                                    <span className="relative z-10">Забронировать столик</span>
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
                                    <span className="relative z-10">Связаться с нами</span>
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
                            <motion.div
                                whileHover={{ scale: 1.05, x: 5 }}
                                className="flex items-center gap-3 group cursor-default"
                            >
                                <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                    <Phone className="w-5 h-5 text-accent-400" />
                                </div>
                                <span className="text-gray-200">+996 703 530 377</span>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05, x: 5 }}
                                className="flex items-center gap-3 group cursor-default"
                            >
                                <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                    <MapPin className="w-5 h-5 text-accent-400" />
                                </div>
                                <span className="text-gray-200">ул. Ресторанная, 1</span>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05, x: 5 }}
                                className="flex items-center gap-3 group cursor-default"
                            >
                                <div className="p-2 bg-accent-500/20 rounded-full group-hover:bg-accent-500/30 transition-colors">
                                    <Clock className="w-5 h-5 text-accent-400" />
                                </div>
                                <span className="text-gray-200">Ежедневно 12:00 - 00:00</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};