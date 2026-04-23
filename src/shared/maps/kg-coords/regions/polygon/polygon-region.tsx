import './polygon.css'

import {Polygon} from '@iminside/react-yandex-maps'

interface Props {
    regionCoords: any
    color: string
}

export const PolygonRegion = ({regionCoords, color}: Props) => {
    return (
        <Polygon
            geometry={
                regionCoords
            }
            options={{
                cursor: 'grab',
                fillColor: color,
                strokeWidth: 0.2,
            }}
        />

    )
}
