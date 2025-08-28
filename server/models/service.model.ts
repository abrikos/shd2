import mongoose from 'mongoose';

const model = 'service';

export interface IService extends mongoose.Document {
    article: string
    desc: string
    percent: number
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IService>({
        article: String,
        desc: String,
        percent: {type: Number, default: 0},
        deleted: {type: Boolean, default: false},
    },
    {
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


export const ServiceModel = mongoose.model<IService>(model, schema)
