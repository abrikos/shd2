import mongoose from 'mongoose';
import moment from "moment";
import type {IPart} from "~~/server/models/part.model";
import type {IService} from "~~/server/models/service.model";

const model = 'config';

export interface IConfig extends mongoose.Document {
    [key: string]: any

    user: IUser
    platform: IPlatform
    deleted: boolean
    date: string
    description: string
    name: string
    createdAt: Date
    parts: IPart[]
    service: IService
    nrDiskService: boolean
    startupService: boolean
    price: number
    priceService: number
    priceNr: number
    priceStartup: number
    priceTotal: number
    priceHardware: number
    priceDiscs: number
    priceCache: number
    priceLicense: number

    getPopulation(): any
}

interface IConfigModel extends mongoose.Model<IConfig> {
    getPopulation(): any
}


const Schema = mongoose.Schema;
const schema = new Schema<IConfig>({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        platform: {type: mongoose.Schema.Types.ObjectId, ref: 'platform'},
        service: {type: mongoose.Schema.Types.ObjectId, ref: 'service'},
        name: {type: String},
        deleted: {type: Boolean, default: false},
        nrDiskService: {type: Boolean, default: false},
        startupService: {type: Boolean, default: true},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });
const population = [
    'service',
    {path: 'platform'},
    {path: 'parts', populate: ['item']}
]

schema.statics.getPopulation = () => population

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    })

schema.virtual('description')
    .get(function () {
        const platform = this.platform.desc.match(/^Платформа СХД (.*) Cache; (.*)/i) || [0, 'ZZZZZ', 'ddddd']
        const license = this.parts.find((p: IPart) => p.item.article.match(/-LCS-/))
        const lcs = {
            'NMB-LCS-BASE': 'Base License;',
            'NMB-LCS-ENTPKG': 'Enterprise License;',
            'NMB-LCS-DCTPKG': 'Data-Center License;'
        }
        const polki = this.parts.find((p: IPart) => p.item.article.match(/-JBD-|-EF-/))
        const cache = this.parts.find((p: IPart) => p.item.article.match(/-CH-/))
        let disksStr = ''
        const disksData = {} as { [key: string]: any }
        const disks = this.parts.filter((p: IPart) => p.item.article.match(/-AR-/))
        for (const disk of disks) {
            disksData[disk.item.article.replace('NMB-AR-', '')] = {desc: disk.item.desc, count: disk.count}
        }
        const disksPak = this.parts.filter((p: IPart) => p.item.article.match(/-AR6-/))
        for (const disk of disksPak) {
            if (disksData[disk.item.article.replace('NMB-AR6-', '')]) {
                disksData[disk.item.article.replace('NMB-AR6-', '')].count += disk.count * 6
            } else {
                disksData[disk.item.article.replace('NMB-AR6-', '')] = {
                    desc: disk.item.desc.replace('(6 pack)', ''),
                    count: disk.count * 6
                }
            }
        }
        for (const article in disksData) {
            disksStr += `${disksData[article].count} * ${disksData[article].desc};`
        }

        return 'Система хранения данных ' + platform[1] + ' Cache; '
            + (polki ? `${polki.count} * Модуль расширения ${polki.item.desc}; ` : '')
            + (cache ? `${cache.count} * ${cache.item.desc} (Coffer); ` : '')
            + disksStr
            + platform[2] + '; '
            + (lcs[license?.item.article as keyof typeof lcs]||'') + ' '
            + (this.nrDiskService ? 'Невозврат неисправных накопителей; ' : '')
            + (this.startupService ? 'Installation and Startup Service; ' : '')
            + this.service?.desc
    })

schema.virtual('price')
    .get(function () {
        return this.priceHardware + this.priceLicense
    })
schema.virtual('priceHardware')
    .get(function () {
        return this.platform.price
            + (this.parts.filter(p => !p.item.article.match('LCS')).reduce((sum, part) => sum + part.price, 0))
    })

schema.virtual('priceLicense')
    .get(function () {
        return (this.parts.filter(p => p.item.article.match('LCS'))
                .reduce((sum, part) =>  sum + part.price, 0))
    })

schema.virtual('priceDiscs')
    .get(function () {
        return (this.parts.filter(p => p.item.article.match('-AR-')).reduce((sum, part) => sum + part.price, 0))
            + (this.parts.filter(p => p.item.article.match('-AR6-')).reduce((sum, part) => sum + part.price, 0))
            +this.priceCache
    })

schema.virtual('priceCache')
    .get(function () {
        return (this.parts.filter(p => p.item.article.match('-CH-')).reduce((sum, part) => sum + part.price, 0))
    })

schema.virtual('priceService')
    .get(function () {
        return this.service?.percent ?
            this.priceHardware * this.service.percent +
            (this.service.shortName === 'Base-60' ? 0 : this.priceHardware * 0.1 * (1 + (0.012 * this.service.period)))
            : 0
    })


schema.virtual('priceNr')
    .get(function () {
        return this.nrDiskService ? this.priceDiscs * 0.2 : 0
    })
schema.virtual('priceStartup')
    .get(function () {
        return 1000
        //return this.startupService ? this.priceHardware * 0.05 : 0
    })
schema.virtual('priceTotal')
    .get(function () {
        return this.price + this.priceService + this.priceNr + this.priceStartup
    })

schema.virtual('priceTotalGpl')
    .get(function () {
        // console.log('HW', this.priceHardware)
        // console.log('SW', this.priceService)
        // console.log('NR', this.priceNr)
        // console.log('ST', this.priceStartup)
        // console.log('ST', this.priceLicense)
        // console.log('CO', this.platform.coefficientGpl)
        // console.log('xx', this.startupService)
        return (this.priceHardware
            + this.priceService
            + (this.nrDiskService ? this.priceNr : 0)
            + (this.startupService ? this.priceStartup : 0)
            + this.priceLicense) * 100 / this.platform.coefficientGpl
    })

schema.virtual('parts', {
    ref: 'part',
    localField: '_id',
    foreignField: 'config'
})


export const ConfigModel = mongoose.model<IConfig, IConfigModel>(model, schema)
