import mongoose from 'mongoose';
import moment from "moment";

const model = 'shd';

export interface IShd extends mongoose.Document {
    article: string
    desc: string
    type: string
    count: number
    price: number
    createdAt: Date
    date: string
}

const Schema = mongoose.Schema;
const schema = new Schema<IShd>({
        type: String,
        article: String,
        desc: String,
        count: {type: Number, default: 0},
        price: {type: Number, default: 0},
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


export const ShdModel = mongoose.model<IShd>(model, schema)
