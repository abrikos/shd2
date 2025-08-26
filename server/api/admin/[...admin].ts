import {H3Event} from "h3";
import {LogAdmin} from "~~/server/models/log.model";
import moment from "moment";
import {parseXls} from "~~/server/utils/import";
const router = createRouter()

async function logAction(event: H3Event) {
    await LogAdmin.create({
        user: event.context.user,
        route: JSON.stringify(event.context.matchedRoute),
        params: getQuery(event),
        data: await readBody(event)
    });
}

function checkAdmin(user: IUser) {
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return user
}

router.get('/user-all', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return User.find({}, '-passwordHash').populate(User.getPopulation())
}))

router.delete('/user/delete/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    await User.findByIdAndDelete(_id)
}))

router.get('/log', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return LogAdmin.find().sort({createdAt: -1}).populate('user')
}))


router.post('/user/update/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    const {_id} = event.context.params as Record<string, string>
    const user = await User.findById(_id)
    if (!user) throw createError({statusCode: 404, message: 'Юзер не найдена',})
    if (body.password) {
        user.password = body.password
    }
    const fields = ['type', 'firstName', 'lastName',
        'middleName',
        'inn',
        'company',
        'jobTitle',
        'phone',
        'parent', 'blocked']
    for (const field of fields) {
        user[field] = body[field]
    }
    await user.save()
    return user
}))

router.post('/user/create', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const user = await readBody(event)
    if (!user.email.includes('@qtech.ru')) {
        user.role = 'External'
    }
    return User.create(user)
}))

router.get('/user/:id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const {id} = event.context.params as Record<string, string>
    return User.findById(id).populate(User.getPopulation())
}))


router.get('/import-list', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const storage = useStorage();
    return  storage.keys('excel')
}))

router.post('/import/:type', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {type} = event.context.params as Record<string, string>
    let formData = await readMultipartFormData(event)
    const storage = useStorage('excel');
    if (formData) {
        await storage.setItemRaw(`import-${type}-${moment().format('YYYY-MM-DD')}-${formData[0].name}`, formData[0].data);
        switch (type) {
            case 'shd':
                return parseXls(formData[0].data)
            default:
        }
    }

}))

export default useBase('/api/admin', router.handler)
