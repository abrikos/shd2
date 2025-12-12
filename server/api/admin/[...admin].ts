import {H3Event} from "h3";
import {LogAdmin} from "~~/server/models/log.model";
import moment from "moment";
import {parseXls2} from "~~/server/utils/import";
import {ItemModel} from "~~/server/models/item.model";
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
    const fields = ['type', 'firstName', 'lastName','role',
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
        user.role = 'external'
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

router.put('/clear/base', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await PlatformModel.deleteMany({})
    await ItemModel.deleteMany({})
    await ConfigModel.deleteMany({})
    await PartModel.deleteMany({})

}))

router.post('/import', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    let formData = await readMultipartFormData(event)
    const storage = useStorage('excel');
    if (formData) {
        await storage.setItemRaw(`import-${moment().format('YYYY-MM-DD')}-${formData[0].name}`, formData[0].data);
        return parseXls2(formData[0].data)
    }
}))

router.post('/services-add', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    const exists = await ServiceModel.findOne({...body, partNumber: undefined})
    if (exists) throw createError({statusCode: 400, message: 'Такой сервис уже создан',})
    return ServiceModel.create({...body, article: Math.random()})
}))

router.post('/services-update', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    return ServiceModel.updateOne({_id: body.id}, body)
}))

router.delete('/services-delete/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    return ServiceModel.deleteOne({_id})
}))


export default useBase('/api/admin', router.handler)
