import mongoose from 'mongoose';
import moment from "moment";
import type {IPart} from "~~/server/models/part.model";

const model = 'config';

export interface IConfig extends mongoose.Document {
    user: IUser
    platform: IPlatform
    deleted: boolean
    date: string
    createdAt: Date
    parts: IPart[]
    price: number
}

const Schema = mongoose.Schema;
const schema = new Schema<IConfig>({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        platform: {type: mongoose.Schema.Types.ObjectId, ref: 'platform'},
        deleted: {type: Boolean, default: false},
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

schema.virtual('parts', {
    ref: 'part',
    localField: '_id',
    foreignField: 'config'
})


export const ConfigModel = mongoose.model<IConfig>(model, schema)
