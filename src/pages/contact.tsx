import React from 'react';
import { motion } from 'framer-motion';
import {
    Phone,
    MapPin,
    Mail,
    Clock,
    Instagram,
    MessageCircle,
    Send,
    Navigation,
    Copy,
    Check,
    ExternalLink,
    Calendar
} from 'lucide-react';

import { Link } from 'react-router-dom';
import {MapWithContent} from "../shared/map";

export const Contacts: React.FC = () => {
    const [copiedPhone1, setCopiedPhone1] = React.useState(false);
    const [copiedPhone2, setCopiedPhone2] = React.useState(false);
    const [copiedAddress, setCopiedAddress] = React.useState(false);

    const contacts = {
        phones: [
            { number: '+996 312 212 212', label: 'Бронирование' },
            { number: '+996 312 211 211', label: 'Администрация' }
        ],
        address: 'ул. Ресторанная, 1, Бишкек',
        email: 'info@simba.kg',
        workHours: [
            { days: 'Пн-Чт', hours: '12:00 - 23:00' },
            { days: 'Пт-Сб', hours: '12:00 - 02:00' },
            { days: 'Вс', hours: '13:00 - 23:00' }
        ],
        social: [
            {
                icon: <Instagram className="w-5 h-5" />,
                label: 'Instagram',
                url: 'https://instagram.com/lebistrot',
                color: 'from-pink-500 to-orange-500'
            },
            {
                icon: <MessageCircle className="w-5 h-5" />,
                label: 'WhatsApp',
                url: 'https://wa.me/996312212212',
                color: 'from-green-500 to-teal-500'
            },
            {
                icon: <Send className="w-5 h-5" />,
                label: 'Telegram',
                url: 'https://t.me/lebistrot',
                color: 'from-blue-400 to-indigo-500'
            }
        ]
    };

    const copyToClipboard = (text: string, type: 'phone1' | 'phone2' | 'address') => {
        navigator.clipboard.writeText(text);

        if (type === 'phone1') {
            setCopiedPhone1(true);
            setTimeout(() => setCopiedPhone1(false), 2000);
        } else if (type === 'phone2') {
            setCopiedPhone2(true);
            setTimeout(() => setCopiedPhone2(false), 2000);
        } else {
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        }
    };

    // Открыть навигатор
    const openMaps = () => {
        const encodedAddress = encodeURIComponent(contacts.address);
        // Проверяем мобильное устройство
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.open(`maps:?q=${encodedAddress}`, '_blank');
        } else {
            window.open(`https://2gis.kg/bishkek/search/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B5%D1%85/station/15763384674812371?m=${74.592686}%2C${42.841417}%2F15.55`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <section className="relative h-[350px] overflow-hidden pt-10">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Contacts"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                </motion.div>

                <div className="relative h-full flex items-center text-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl"
                        >
                            <span className="text-accent-400 font-medium mb-2 block">Свяжитесь с нами</span>
                            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                                Контакты
                            </h1>
                            <p className="text-xl text-gray-200">
                                Мы всегда на связи и готовы ответить на ваши вопросы
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Основной контент */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-8xl">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Левая колонка - Контактная информация */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Заголовок */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                                    Наши контакты
                                </h2>
                                <p className="text-gray-600">
                                    Выберите удобный способ связи или приходите в гости
                                </p>
                            </div>

                            {/* Телефоны */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-accent-600" />
                                    </div>
                                    Телефоны
                                </h3>
                                <div className="space-y-4">
                                    {contacts.phones.map((phone, index) => (
                                        <div key={index} className="flex items-center justify-between group">
                                            <div>
                                                <a
                                                    href={`tel:${phone.number.replace(/\D/g, '')}`}
                                                    className="text-xl font-medium text-gray-900 hover:text-accent-600 transition-colors"
                                                >
                                                    {phone.number}
                                                </a>
                                                <p className="text-sm text-gray-500">{phone.label}</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => copyToClipboard(phone.number, index === 0 ? 'phone1' : 'phone2')}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                                                title="Копировать"
                                            >
                                                {index === 0 ? (
                                                    copiedPhone1 ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    copiedPhone2 ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />
                                                )}
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Адрес */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-accent-600" />
                                    </div>
                                    Адрес
                                </h3>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-900 font-medium">{contacts.address}</p>
                                        <button
                                            onClick={openMaps}
                                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm mt-2 group"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            <span>Проложить маршрут</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => copyToClipboard(contacts.address, 'address')}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Копировать"
                                    >
                                        {copiedAddress ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-accent-600" />
                                    </div>
                                    Email
                                </h3>
                                <a
                                    href={`mailto:${contacts.email}`}
                                    className="text-xl font-medium text-accent-600 hover:text-accent-700 transition-colors"
                                >
                                    {contacts.email}
                                </a>
                                <p className="text-sm text-gray-500 mt-1">Для писем и предложений</p>
                            </div>

                            {/* Часы работы */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-accent-600" />
                                    </div>
                                    Часы работы
                                </h3>
                                <div className="space-y-2">
                                    {contacts.workHours.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-gray-600">{item.days}</span>
                                            <span className="font-medium text-gray-900">{item.hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Социальные сети */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Мы в соцсетях</h3>
                                <div className="flex flex-wrap gap-3">
                                    {contacts.social.map((social, index) => (
                                        <motion.a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 min-w-[120px]"
                                        >
                                            <div className={`bg-gradient-to-r ${social.color} text-white rounded-xl p-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all`}>
                                                {social.icon}
                                                <span className="font-medium">{social.label}</span>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Дополнительная информация */}
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-amber-700 font-bold">i</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-800 mb-1">Для особых случаев</p>
                                        <p className="text-sm text-amber-700">
                                            По вопросам организации банкетов и частных мероприятий обращайтесь по телефону администрации
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Правая колонка - Карта */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:sticky lg:top-24 h-fit"
                        >
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                {/* Заголовок карты */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-accent-600" />
                                            <span className="font-medium">Как нас найти</span>
                                        </div>
                                        <span className="text-sm text-gray-500">📍 Бишкек</span>
                                    </div>
                                </div>

                                <div className="w-full overflow-hidden">
                                    <MapWithContent
                                        selectedRegion={124}
                                        selectedId={"1"}
                                        center={[74.592686, 42.841417]}
                                        placemarkOnClick={() => {
                                            window.open(`https://2gis.kg/bishkek/search/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B5%D1%85/station/15763384674812371?m=${74.592686}%2C${42.841417}%2F15.55`, "_blank")
                                        }}
                                        placemarksData={[{
                                            iconHref: "/location.png",
                                            id: "1",
                                            latitude: 74.592686,
                                            longitude: 42.841417,
                                            title: ""
                                        }]}
                                    />
                                </div>

                                {/* Кнопки действий под картой */}
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={openMaps}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 cursor-pointer transition-colors"
                                        >
                                            <Navigation className="w-5 h-5" />
                                            <span>Построить маршрут</span>
                                        </motion.button>

                                        <Link to="/reservations">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-accent-500 text-accent-600 rounded-xl font-medium hover:bg-accent-50 transition-colors"
                                            >
                                                <Calendar className="w-5 h-5" />
                                                <span>Забронировать</span>
                                            </motion.button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Подсказка для мобильных */}
                            <div className="mt-4 text-center text-sm text-gray-500 lg:hidden">
                                👆 Свайпните по карте для перемещения
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Секция с призывом к действию */}
            <section className="py-16 bg-gradient-to-r from-gray-600 to-gray-700">
                <div className="container mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Ждем вас в гости!
                        </h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Приходите попробовать наши блюда и насладиться атмосферой
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/reservations">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3.5 bg-gray-500 text-accent-600 rounded-full font-medium hover:bg-gray-700 transition-colors shadow-lg"
                                >
                                    Забронировать столик
                                </motion.button>
                            </Link>
                            <a href="tel:+79991234567">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                                >
                                    Позвонить сейчас
                                </motion.button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

