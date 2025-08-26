import crypto from "crypto";
import mongoose from 'mongoose';
import moment from "moment";

export interface IUser extends mongoose.Document {
    [key: string]: any

    firstName: string
    lastName: string
    middleName: string
    code2fa: string
    email: string
    logged: number,
    blocked: boolean
    passwordHash: string
    restorePassword: string
    fio: string
    role: string
}

interface IUserModel extends mongoose.Model<IUser> {
    getPopulation: () => []
}


const Schema = mongoose.Schema;
export const validateEmail = function (email: string) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email);
};


export function md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex')
}


const schema = new Schema<IUser>({
    type: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    middleName: {type: String},
    inn: {type: String},
    code2fa: {type: String},
    //isNetwork: {type: Boolean, default: false},
    //isSuperUser: {type: Boolean, default: false},
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/, 'Please fill a valid email address']
    },
    logged: Number,
    blocked: {type: Boolean, default: false},
    passwordHash: {type: String},
    restorePassword: {type: String},
    role: {type: String, default: 'user'},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

schema.methods.checkPasswd = function (passwd: string) {
    return md5(passwd) === this.passwordHash;
}
schema.statics.getPopulation = () => []


schema.virtual('password')
    .get(function () {
        return '';
    })
    .set(function (value) {
        //console.log('Password change', value);
        this.passwordHash = md5(value)
    })

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })
schema.virtual('fio')
    .get(function () {
        return `${this.firstName || ''} ${this.middleName || ''} ${this.lastName || ''}`
    })
schema.virtual('isAdmin')
    .get(function () {
        return this.role === 'admin';
    })
schema.virtual('loggedDate')
    .get(function () {
        if (!this.logged) return '';
        return moment.unix(this.logged).format('YYYY-MM-DD HH:mm');
    })


schema.virtual('tokens', {
    ref: 'token',
    localField: '_id',
    foreignField: 'user'
})

schema.virtual('configurations', {
    ref: 'configuration',
    localField: '_id',
    foreignField: 'user'
})

schema.virtual('specsCount', {
    ref: 'spec',
    localField: '_id',
    foreignField: 'user',
    count: true
})

schema.virtual('specs', {
    ref: 'spec',
    localField: '_id',
    foreignField: 'user',
})

schema.virtual('ordersCount', {
    ref: 'order',
    localField: '_id',
    foreignField: 'user',
    count: true
})
export const User = mongoose.model<IUser, IUserModel>('user', schema)
