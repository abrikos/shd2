import mongoose from 'mongoose';
import moment from "moment";

const model = 'platform';

export interface IPlatform extends mongoose.Document {
    article: string
    desc: string
    price: number
    items: mongoose.Schema.Types.ObjectId[]
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


export const PlatformModel = mongoose.model<IPlatform>(model, schema)
