export const regionCenters: Record<number, [number, number]> = {
    50: [42.5167, 72.2333], // Таласская область
    51: [42.8746, 74.6122], // Чуйская область (центр — Бишкек)
    52: [42.4833, 78.4000], // Иссык-Кульская область (центр — Каракол)
    53: [40.9333, 73.0000], // Джалал-Абадская область
    54: [39.9375, 70.8333], // Баткенская область
    55: [40.5333, 72.8000], // Ошская область
    56: [41.4333, 75.9911], // Нарынская область
    124: [42.8746, 74.6122], // г. Бишкек
    125: [40.5333, 72.8000], // г. Ош
    128: [41.5200, 74.7667], // Все (середина страны условно — Токтогул/Суусамыр)
}


export const getRegionCenter = (regionId: number): [number, number] => {
    return regionCenters[regionId] || [41.5200, 74.7667]; // fallback: центр Кыргызстана
};


export function normalizeCoordinates(latitude?: number | string, longitude?: number | string): [number, number] {
    if (!latitude || !longitude) return [0, 0]
    const lat = parseFloat(String(latitude));
    const lon = parseFloat(String(longitude));

    const isLatSuspicious = lat < 38 || lat > 44;
    const isLonSuspicious = lon >= 81 || lon <= 69;

    if (isLatSuspicious && isLonSuspicious) {
        return [lon, lat]
    }

    return [lat, lon];
}