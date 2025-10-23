import mongoose from 'mongoose';
import type {IConfig} from "~~/server/models/config.model";

const model = 'part';

export interface IPart extends mongoose.Document {
    config: IConfig;
    item: IItem;
    count: number
    price: number
}

const Schema = mongoose.Schema;
const schema = new Schema<IPart>({
        config: {type: mongoose.Schema.Types.ObjectId, ref: 'config'},
        item: {type: mongoose.Schema.Types.ObjectId, ref: 'item'},
        count: {type: Number, default: 0},
    },
    {
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

schema.virtual('price')
    .get(function () {
        return this.count * this.item?.priceGpl;
    })


export const PartModel = mongoose.model<IPart>(model, schema)
