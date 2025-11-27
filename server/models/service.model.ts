import mongoose from 'mongoose';

const model = 'service';

export interface IService extends mongoose.Document {
    article: string
    desc: string
    type: string
    shortName: string
    percent: number
    period: number
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

schema.virtual('period')
    .get(function () {
        const match = this.desc.match(/(\d+) меся/)
        return match ? parseInt(match[1]) : 36
    })

schema.virtual('type')
    .get(function () {
        const match = this.desc.match(/поддержка (\w+) /)
        return match ? match[1] : 'Not set'
    })

schema.virtual('shortName')
    .get(function () {
        return `${this.type}-${this.period}`;
    })

export const ServiceModel = mongoose.model<IService>(model, schema)
