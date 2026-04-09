import {PolygonRegion} from './polygon/polygon-region'
import {batken_region} from './batken_region'
import {bishkek_city} from './bishkek_city'
import {chuy_region} from './chuy_region'
import {
    AkSuuDistrict,
    AksyDistrict,
    AkTalaDistrict,
    AlaBukaDistrict,
    AlamudunDistrict,
    AlayDistrict,
    AravanDistrict,
    AtBashyDistrict,
    BakayAtaDistrict,
    BatkenDitrict,
    BazarKorgonDistrict,
    ChatkalDistrict,
    ChonAlayDistrict,
    ChuyDistrict,
    JayilDistrict,
    JetiOguzDistrict,
    JumgalDistrict,
    KadamjayDistrict,
    KaraBuuraDistrict,
    KaraKuljaDistrict,
    KaraSuuDistrict,
    KeminDistrict,
    KochkorDistrict,
    LeylekDistrict,
    ManasDistrict,
    MoscowDistrict,
    NarynDistrict,
    NookatDistrict,
    NookenDistrict,
    OzgonDistrict,
    PanfilovDistrict,
    SokulukDistrict,
    SuzakDistrict,
    TalasDistrict,
    TogusToroDistrict,
    ToktogulDistrict,
    TonDistrict,
    TupDistrict,
    YssykAtaDistrict,
    YssykKulDistrict,
} from './districts'
import {issyk_kul_region} from './issyk_ku_regionl'
import {jalal_abad_region} from './jalal_abad_region'
import {naryn_region} from './naryn_region'
import {osh_city} from './osh_city'
import {osh_region} from './osh_region'
import {talas_region} from './talas_region'

const regions = [
    {
        id: 6,
        region: batken_region,
        districts: [
            {id: 1, district: LeylekDistrict},
            {id: 2, district: KadamjayDistrict},
            {id: 3, district: BatkenDitrict},
        ],
    },
    {
        id: 5,
        region: jalal_abad_region,
        districts: [
            {id: 4, district: AksyDistrict},
            {id: 5, district: AlaBukaDistrict},
            {id: 6, district: BazarKorgonDistrict},
            {id: 7, district: NookenDistrict},
            {id: 8, district: SuzakDistrict},
            {id: 9, district: TogusToroDistrict},
            {id: 10, district: ToktogulDistrict},
            {id: 11, district: ChatkalDistrict},
        ],
    },
    {
        id: 3,
        region: naryn_region,
        districts: [
            {id: 17, district: AkTalaDistrict},
            {id: 18, district: AtBashyDistrict},
            {id: 19, district: JumgalDistrict},
            {id: 20, district: KochkorDistrict},
            {id: 21, district: NarynDistrict},
        ],
    },
    {
        id: 4,
        region: osh_region,
        districts: [
            {id: 22, district: AlayDistrict},
            {id: 23, district: AravanDistrict},
            {id: 24, district: KaraKuljaDistrict},
            {id: 25, district: KaraSuuDistrict},
            {id: 26, district: NookatDistrict},
            {id: 27, district: OzgonDistrict},
            {id: 28, district: ChonAlayDistrict},
        ],
    },
    {
        id: 2,
        region: talas_region,
        districts: [
            {id: 29, district: BakayAtaDistrict},
            {id: 30, district: KaraBuuraDistrict},
            {id: 31, district: ManasDistrict},
            {id: 32, district: TalasDistrict},
        ],
    },
    {
        id: 1,
        region: chuy_region,
        districts: [
            {id: 33, district: AlamudunDistrict},
            {id: 34, district: JayilDistrict},
            {id: 35, district: KeminDistrict},
            {id: 36, district: MoscowDistrict},
            {id: 37, district: PanfilovDistrict},
            {id: 38, district: SokulukDistrict},
            {id: 39, district: ChuyDistrict},
            {id: 40, district: YssykAtaDistrict},
        ],
    },
    {
        id: 7,
        region: issyk_kul_region,
        districts: [
            {id: 12, district: AkSuuDistrict},
            {id: 13, district: JetiOguzDistrict},
            {id: 14, district: YssykKulDistrict},
            {id: 15, district: TonDistrict},
            {id: 16, district: TupDistrict},
        ],
    },
    {id: 8, region: bishkek_city, districts: []},
    {id: 9, region: osh_city, districts: []},
]

const colours = [
    'rgba(213,219,243,0.61)',
    'rgba(151,220,155,0.61)',
    'rgba(241,230,168,0.61)',
    'rgba(203,168,234,0.61)',
    'rgba(198,234,160,0.61)',
    'rgba(136,238,203,0.61)',
    'rgba(241,116,42,0.29)',
    'rgba(60,86,246,0.38)',
    'rgba(11,231,4,0.25)',
]

export const RegionsController = () => {
    return (
        <>
            {regions.map((item) => {
                return (
                    <PolygonRegion key={item.id} regionCoords={item.region} color={colours[item.id - 1]}/>
                )
            })}
        </>
    )
}
