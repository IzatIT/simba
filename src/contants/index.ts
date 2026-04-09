export const KG_CENTER_COORDINATE: [number, number] = [41.32372, 74.039612]
export type MapPlaceMarkData = {
    latitude?: number | string,
    longitude?: number | string,
    title?: string,
    id?: string,
    iconHref?: string
}

export type MapPolylineData = {
    id: string;
    title: string;
    color: string;
    coords: [number, number][]
}

export const BASE_URL = import.meta.env.VITE_API_URL || ""