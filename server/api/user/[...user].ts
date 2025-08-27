import {validateEmail} from "~~/server/models/user.model";
import crypto from "crypto";

//User.deleteMany().then(console.log)
const router = createRouter()
const config = useRuntimeConfig()

router.post('/request-restore-password', defineEventHandler(async (event) => {
    const {email} = await readBody(event)
    const user = await User.findOne({email});
    if (!user) {
        //await utils.sleep(4000)
        return {ok: "200"}
    }
    user.restorePassword = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex')
    await user.save()
    const host = getHeader(event, 'host')
    const res = await utils.sendMail({
        to: email,
        subject: 'Восстановить пароль',
        text: `Ссылка для восстановления http://${host}/api/user/process-restore-password/${user.restorePassword}`
    })
    if (!res.messageId) throw createError({statusCode: 500, message: 'Ошибка отправки'})
    return {message: 'Новый пароль отправлен на почту'}
}))

router.get('/process-restore-password/:code', defineEventHandler(async (event) => {
    const {code} = event.context.params as Record<string, string>
    const user = await User.findOne({restorePassword: code});
    console.log('user', user)
    if (!user) return
    const password = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex').substring(1, 5)
    user.password = password
    user.restorePassword = ''
    await user.save()
    const res = await utils.sendMail({
        to: user.email,
        subject: 'Новый пароль',
        text: `Используйте этот пароль: ${password}`
    })
    return 1
}))

router.get('/checkAuth', defineEventHandler(async (event) => {
    return event.context.user
}))

router.get('/logout', defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const config = useRuntimeConfig(event)
    await Token.deleteOne({access: cookies[config.public.authTokenName]});
    deleteCookie(event, config.public.authTokenName)
}))

const delay = (delayInms: number) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};


router.post('/registration', defineEventHandler(async (event) => {
    const body = await readBody(event)
    const exists = await User.findOne({email: body.email})
    if (exists) throw createError({statusCode: 406, message: 'Юзер уже зарегистрирован'})
    return User.create({role: 'user', ...body})
}))

//User.deleteMany().then(console.log)
//User.findById('636376c6a98e169787cf0a99').then(console.log)
router.post('/login', defineEventHandler(async (event) => {
    const {email, password} = await readBody(event)
    const user = await User.findOne({email});
    if (user?.checkPasswd(password)) {
        await utils.setAuthToken(event, user)
        return utils.adaptUser(user)
    } else throw createError({statusCode: 401, message: 'Ошибка аутентификации'})
}))

router.get('/:_id/toggle-admin', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const found = await User.findById(_id);
    if (!found) throw createError({statusCode: 401, message: 'Ошибка аутентификации'})
    found.isAdmin = !found.isAdmin
    await found.save()
}))

router.post('/update', defineEventHandler(async (event) => {
    const bodyUser = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const found = await User.findById(user.id)
    if (!found) throw createError({statusCode: 403, message: 'STRANGE: user not found: ' + user.id,})
    if (!validateEmail(bodyUser.email)) throw createError({statusCode: 403, message: 'Wrong email'})
    const fields = ['name', 'email', 'avatarImage', 'currency']
    for (const field of fields) {
        found[field] = bodyUser[field]
    }
    try {
        await found.save()
    } catch (e: any) {
        console.error(e)
        if (e.code === 11000) throw createError({statusCode: 406, message: 'This email is already taken'})
        throw createError({statusCode: 406, message: e.message})
    }
}))

//User.updateOne({email:'a.filippov@qtech.ru'},{role:'admin'}).then(console.log)

router.post('/password', defineEventHandler(async (event) => {
    const {password, password2} = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    if (password && password === password2) {
        user.password = password
        await user.save()
    } else {
        throw createError({statusCode: 400, message: 'Ошибка смены пароля',})
    }
}))

export default useBase('/api/user', router.handler)
