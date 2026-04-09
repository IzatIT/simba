import {Map, YMaps} from '@iminside/react-yandex-maps'
import {useRef} from 'react'
import {MapContent} from './map-content'
import {ResizeKg} from "./resize-kg"
import {KG_CENTER_COORDINATE, type MapPlaceMarkData, type MapPolylineData} from "../../contants";


type Props = {
    sidebar?: React.ReactNode,
    center?: [number, number],
    selectedRegion: number | null,
    polylineOnClick?: (id: string | null) => void,
    placemarkOnClick?: (id: string | null) => void,
    placemarksData?: MapPlaceMarkData[],
    height?: string,
    polylinesData?: MapPolylineData[],
    selectedId: string | null
}

export const MapWithContent = ({
                                   sidebar,
                                   center = KG_CENTER_COORDINATE,
                                   height = '540px',
                                   ...props
                               }: Props) => {
    const mapRef = useRef<ymaps.Map | undefined>(undefined)


    return (
        <div className="relative">
            {sidebar}
            <YMaps>
                <Map
                    instanceRef={mapRef}
                    defaultState={{
                        center: center,
                        zoom: 12,
                    }}
                    options={{
                        minZoom: 12,
                        suppressMapOpenBlock: true,
                        suppressObsoleteBrowserNotifier: true,
                        copyrightLogoVisible: false,
                        copyrightProvidersVisible: false,
                        copyrightUaVisible: false
                    }}
                    modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                    width={'100%'}
                    height='450px'
                >
                    <ResizeKg/>
                    <MapContent mapRef={mapRef} {...props}/>
                </Map>
            </YMaps>
        </div>
    )
}
