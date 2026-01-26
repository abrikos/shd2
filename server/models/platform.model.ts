import mongoose from 'mongoose';
import moment from "moment/moment";

const model = 'platform';

export interface IPlatform extends mongoose.Document {
    article: string
    desc: string
    typeName: string
    platforms: string[]
    modelName: string
    price: number
    coefficientGpl: number
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IPlatform>({
        article: String,
        desc: String,
        platforms: [String],
        price: {type: Number, default: 0},
        coefficientGpl: {type: Number, default: 0},
        deleted: {type: Boolean, default: false},
    },
    {
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

schema.virtual('typeName')
    .get(function () {
        return this.platforms.includes('GR') ? 'Гром' : 'Молния';
        // const match = this.desc.match(/NIMBUS "(.+)"/)
        // return match ? match[1] : this.desc
    })

schema.virtual('modelName')
    .get(function () {
        const match = this.desc.match(/NIMBUS ".+" (\d+)/)
        return match ? match[1] : this.desc
    })

// schema.virtual('coefficientGpl')
//     .get(function () {
//         if (this.typeName === 'Гром' && this.modelName === '230') {
//             return 28
//         }
//         if (this.typeName === 'Гром' && this.modelName === '220') {
//             return 28
//         }
//         if (this.typeName === 'Гром' && this.modelName === '210') {
//             return 33
//         }
//         if (this.typeName === 'Молния' && this.modelName === '210') {
//             return 33
//         }
//         if (this.typeName === 'Молния' && this.modelName === '220') {
//             return 25
//         }
//         if (this.typeName === 'Молния' && this.modelName === '230') {
//             return 18
//         }
//     })


export const PlatformModel = mongoose.model<IPlatform>(model, schema)
