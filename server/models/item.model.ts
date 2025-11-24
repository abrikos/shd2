import mongoose from 'mongoose';

const model = 'item';

export interface IItem extends mongoose.Document {
    article: string
    desc: string
    price: number
    priceDdp: number
    priceGpl: number
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IItem>({
        article: String,
        desc: String,
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
        return this.article.match('LCS') ? this.price : this.price * 1.4
    })

schema.virtual('priceGpl')
    .get(function () {
        return this.article.match('-LCS-') ? this.price : this.priceDdp / (1 - 0.15) / (1 - 0.8)
    })


export const ItemModel = mongoose.model<IItem>(model, schema)
