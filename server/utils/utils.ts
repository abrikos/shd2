import {H3Event} from "h3";
import nodemailer from "nodemailer";
import {IUser} from "~~/server/models/user.model";
import {Token} from "~~/server/models/token.model";

const config = useRuntimeConfig()

const {mailUser, mailPassword,mailUserQ, mailPasswordQ, devMode} = useRuntimeConfig()

const transporterQ = nodemailer.createTransport({
    host: 'ex.telecorgroup.ru',
    port: 587,
    secure: false,
    auth: {
        user: mailUserQ,
        pass: mailPasswordQ,
    },
    tls: {
        ciphers: 'SSLv3'
    }

});

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: mailUser,
        pass: mailPassword,
    },
});
//transporter.verify().then(e=>console.log('Mail verify', e)).catch(e=>console.error('mail send ERROR: ', e));
//sendMail({to:'abrikoz@gmail.com'}).then(console.log)

export function sendMail(mailData: any) {
    return transporterQ.sendMail({
        from: mailUserQ,
        to: devMode ? 'abrikoz@gmail.com' : mailData.to,
        subject: 'Веб-конфигуратор QTECH: ' + mailData.subject,
        text: mailData.text + '\n-------------------\nСообщение отправлено ботом веб-конфигуратора'
    })
}

export default {
    sendMail,
    adaptUser(user: IUser) {
        if (user) {
            user.passwordHash = ''
            user.restorePassword = ''
        }
        return user
    },
    async setAuthToken(event: H3Event, user: IUser) {
        const config = useRuntimeConfig(event)
        const token = await Token.create({user})
        setCookie(event, config.public.authTokenName, token.access, {maxAge: config.public.authExpiration})
        return token
    },
    sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },

}
