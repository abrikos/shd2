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

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    })

schema.virtual('price')
    .get(function () {
        return this.platform.price + this.parts.reduce((sum, part) => sum + part.price, 0);
    })
schema.virtual('priceService')
    .get(function () {
        return this.service ? this.service.percent * this.price : 0
    })
schema.virtual('priceNr')
    .get(function () {
        return this.nrDiskService ? this.price * 0.2 : 0
    })
schema.virtual('priceStartup')
    .get(function () {
        return this.startupService ? this.price * 0.05 : 0
    })
schema.virtual('priceTotal')
    .get(function () {
        return this.price + this.priceService + this.priceNr + this.priceStartup
    })

schema.virtual('jbdMaxCount')
    .get(function () {
        const match = this.name.match(/"(.+)" (\d+)/);
        if (!match) return 0;
        if (match[2] === '210') {
            return 1
        }
        if (match[2] === '220') {
            return 2
        }
        if (match[2] === '230') {
            return match[1] === 'Гром' ? 4 : 3
        }
        return 'match error'
    })

schema.virtual('parts', {
    ref: 'part',
    localField: '_id',
    foreignField: 'config'
})


export const ConfigModel = mongoose.model<IConfig>(model, schema)
