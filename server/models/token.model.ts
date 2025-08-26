import mongoose from 'mongoose';
import {IUser} from "~/server/models/user.model";
import moment from "moment";

const model = 'token'
const config = useRuntimeConfig()

export interface IToken extends mongoose.Document {
    access: string;
    resetCode: string;
    secondsFromCreation: number
    createdAt: number
    expired: boolean
    user: IUser
}

export interface TokenModel extends mongoose.Model<IToken> {
    deleteExpiredTokens(): Promise<void>;
}

const tokenPrefix = 'auth'
const Schema = mongoose.Schema;

const schema = new Schema({
    access: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    resetCode: {type: String},
    createdAt: {type: Number, default: 0},
}, {
    /*statics:{
        async  deleteExpiredTokens() {
            await this.deleteMany({createdAt: {$lt: moment().unix() - authExpiration}})
        }
    },*/
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

schema.virtual('expired')
    .get(function () {
        const timestamp = moment().unix()
        const secondsFromCreation = timestamp - (this.createdAt || timestamp);
        return  config.public.authExpiration - secondsFromCreation < config.public.authRefreshBeforeExpiration
    })

schema.statics.deleteExpiredTokens = async function(){
    await this.deleteMany({createdAt: {$lt: moment().unix() - config.public.authExpiration}})
}

schema.pre('save', function (next) {
    // do stuff
    this.access = tokenPrefix + Math.random().toString()
    this.createdAt = moment().unix()
    next();
})
export const Token = mongoose.model<IToken, TokenModel>(model, schema)
