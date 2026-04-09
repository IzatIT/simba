import React, { useState } from 'react';
import { Map, Placemark, SearchControl, YMaps } from '@iminside/react-yandex-maps';
import { MapPin, X } from 'lucide-react';

interface AddressFieldProps  {
    onChange?: (data: [number, number]) => void;
    value?: [number, number] | null;
    center?: [number, number] | null;
    [key: string]: any
}

export const AddressField: React.FC<AddressFieldProps> = ({ onChange, className, ...props }) => {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);

    const getReverseGeocode = async (coords: [number, number]) => {
        onChange?.(coords);
        setCoordinates(coords);
    };

    const handleMapClick = (e: any) => {
        getReverseGeocode(e.get('coords'));
        e.stopPropagation();
    };

    return (
        <>
            <div className="relative">
                <input
                    {...props}
                    type="text"
                    value={coordinates ? coordinates.join(', ') : ''}
                    readOnly
                    className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all cursor-pointer ${className || ''}`}
                    placeholder="Выберите адрес на карте"
                    onClick={() => setIsMapOpen(true)}
                />

                {/* Кнопка открытия карты */}
                <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-100 hover:bg-accent-200 rounded-lg transition-colors"
                >
                    <MapPin className="w-5 h-5 text-accent-600" />
                </button>
            </div>

            {/* Модальное окно с картой */}
            {isMapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-[90vw] max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Заголовок */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Выберите местоположение
                            </h3>
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Карта */}
                        <div className="h-[calc(90vh-120px)]">
                            <YMaps
                                query={{
                                    apikey: 'cc2dfddf-0e99-48d5-a255-ebcccad40e34',
                                    suggest_apikey: '64a1a816-cc27-4855-b272-7b2ab9cc18d7',
                                    lang: 'ru_RU',
                                }}
                            >
                                <Map
                                    defaultState={{
                                        center: [41.62372, 74.039612],
                                        zoom: 7,
                                        controls: [],
                                    }}
                                    options={{
                                        minZoom: 5,
                                        suppressMapOpenBlock: true,
                                        suppressObsoleteBrowserNotifier: true,
                                        copyrightLogoVisible: false,
                                        copyrightProvidersVisible: false,
                                        copyrightUaVisible: false
                                    }}
                                    modules={[
                                        'geoObject.addon.balloon',
                                        'geoObject.addon.hint',
                                        'control.SearchControl',
                                    ]}
                                    width="100%"
                                    height="100%"
                                    onClick={handleMapClick}
                                    className="rounded-b-2xl"
                                >
                                    <SearchControl
                                        options={{
                                            float: 'right',
                                        }}
                                    />
                                    {coordinates && (
                                        <Placemark
                                            geometry={coordinates}
                                            options={{
                                                iconColor: '#f59e0b'
                                            }}
                                        />
                                    )}
                                </Map>
                            </YMaps>
                        </div>

                        {/* Нижняя панель с кнопками */}
                        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                            {coordinates && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-accent-500" />
                                    <span>Выбрано: {coordinates.join(', ')}</span>
                                </div>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <button
                                    onClick={() => setIsMapOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={() => setIsMapOpen(false)}
                                    className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
                                >
                                    Подтвердить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
