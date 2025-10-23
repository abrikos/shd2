import mongoose from 'mongoose';
import moment from "moment/moment";

const model = 'platform';

export interface IPlatform extends mongoose.Document {
    article: string
    desc: string
    typeName: string
    modelName: string
    price: number
    priceGpl: number
    priceDdp: number
    items: IItem[]
    includes: object[]
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IPlatform>({
        article: String,
        desc: String,
        includes: [Object],
        items: [{type: mongoose.Schema.Types.ObjectId, ref: 'item'}],
        price: {type: Number, default: 0},
        deleted: {type: Boolean, default: false},
    },
    {
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

schema.virtual('priceDdp')
    .get(function () {
        return this.price * 1.4
    })

schema.virtual('priceGpl')
    .get(function () {
        return this.priceDdp / (1 - 0.15) / (1 - 0.8)
    })

schema.virtual('typeName')
    .get(function () {
        const match = this.desc.match(/NIMBUS "(.+)"/)
        return match ? match[1] : this.desc
    })

schema.virtual('modelName')
    .get(function () {
        const match = this.desc.match(/NIMBUS ".+" (\d+)/)
        return match ? match[1] : this.desc
    })


export const PlatformModel = mongoose.model<IPlatform>(model, schema)
