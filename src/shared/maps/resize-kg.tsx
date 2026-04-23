import {Polygon} from '@iminside/react-yandex-maps'
import {KyrgyzstanGeometry} from "./kg-coords/regions";

export const ResizeKg = () => {
    return <Polygon
        geometry={[
            ...KyrgyzstanGeometry,
            [
                [85, -100],
                [85, 0],
                [85, 100],
                [85, 180],
                [85, -110],
                [-85, -110],
                [-85, 180],
                [-85, 100],
                [-85, 0],
                [-85, -100],
                [85, -100],
            ],
        ]}
        options={{
            fillColor: 'rgba(255,255,255,0.54)',
            strokeWidth: 0.5,
            strokeColor: '#000'
        }}
    />
}