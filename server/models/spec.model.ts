import mongoose from 'mongoose';
import moment from "moment";

const model = 'spec';

export interface ISpec extends mongoose.Document {
    date: string
    name: string
    createdAt: Date
    price: number
    configs: IConfig[]
    user: IUser
    fromUser: IUser
}

const Schema = mongoose.Schema;
const schema = new Schema<ISpec>({
        name: String,
        price: {type: Number, default: 0},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        fromUser: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
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


schema.virtual('configs', {
    ref: 'config',
    localField: '_id',
    foreignField: 'spec'
})


export const SpecModel = mongoose.model<ISpec>(model, schema)
