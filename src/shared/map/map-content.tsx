import {Clusterer, Placemark, Polyline} from '@iminside/react-yandex-maps'
import {type RefObject, useEffect, useMemo} from 'react'
import {KG_CENTER_COORDINATE, type MapPlaceMarkData, type MapPolylineData} from "../../contants";
import {getRegionCenter, normalizeCoordinates} from "../../lib";

interface Props {
    mapRef: RefObject<ymaps.Map | undefined>,
    selectedRegion: number | null,
    polylineOnClick?: (id: string | null) => void,
    placemarkOnClick?: (id: string | null) => void,
    placemarksData?: MapPlaceMarkData[]
    polylinesData?: MapPolylineData[],
    selectedId: string | null

}

export const MapContent = ({
                               mapRef,
                               selectedRegion,
                               placemarksData,
                               polylinesData,
                               placemarkOnClick,
                               polylineOnClick,
                           }: Props) => {

    const selectedRegionCoords = useMemo(() => {
        return selectedRegion ? getRegionCenter(selectedRegion) : null
    }, [selectedRegion])


    useEffect(() => {
        if (mapRef.current && selectedRegionCoords) {
            mapRef.current.setCenter(selectedRegionCoords, 7, {
                duration: 500,
                timingFunction: 'ease-in-out',
            });
        } else if (mapRef.current && !selectedRegion) {
            mapRef.current.setCenter(KG_CENTER_COORDINATE, 7, {
                duration: 500,
                timingFunction: 'ease-in-out',
            });
        }
    }, [selectedRegion]);

    return (
        <>
            <Clusterer
                options={{
                    preset: 'islands#invertedVioletClusterIcons',
                    groupByCoordinates: false,
                }}
            >
                {placemarksData?.map((item) => {
                    return (
                        <Placemark
                            onClick={() => placemarkOnClick && placemarkOnClick(item?.id || null)}
                            geometry={normalizeCoordinates(item.latitude, item.longitude)}
                            key={item.id}
                            properties={{hintContent: item.title}}
                            options={{
                                iconLayout: 'default#image',
                                iconImageHref: item.iconHref,
                                iconImageSize: [54, 54],
                                iconImageOffset: [-16, -16],
                            }}
                        />
                    )
                })}
            </Clusterer>
            {polylinesData?.map((item) => {
                if (!Array.isArray(item.coords)) return null
                return (
                    <Polyline
                        onClick={() => polylineOnClick && polylineOnClick(item?.id || null)}
                        key={item.id}
                        geometry={item.coords}
                        properties={{hintContent: item.title}}
                        options={{
                            strokeColor: item.color,
                            strokeWidth: 4,
                            strokeOpacity: 0.5,
                        }}
                    />
                )
            })}
        </>
    )
}
