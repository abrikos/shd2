import mongoose from 'mongoose';
import moment from "moment";

const model = 'log';

export interface ILogAdmin extends mongoose.Document {
    user: IUser
    route: string;
    params: object
    data: object
    createdAt: Date
    date: string
}

const Schema = mongoose.Schema;
const schema = new Schema<ILogAdmin>({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        route: {type: String},
        params: {type: Object},
        data: {type: Object},
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


export const LogAdmin = mongoose.model<ILogAdmin>(model, schema)
