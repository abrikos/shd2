import {ShdModel} from "~~/server/models/shd.model";
import {PlatformModel} from "~~/server/models/platform.model";
import {ConfigModel} from "~~/server/models/config.model";
import {type IPart, PartModel} from "~~/server/models/part.model";

const router = createRouter()

const population = [
    {path: 'platform', populate: ['items']},
    {path: 'parts', populate: ['item']}
]

router.get('/platforms', defineEventHandler(async (event) => {
    return PlatformModel.find()
}))

router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    return ConfigModel.find({user}).sort({createdAt:-1}).populate(population)
}))

router.get('/platform/:_id', defineEventHandler(async (event) => {
    const {_id} = event.context.params as Record<string, string>
    return PlatformModel.findById(_id).populate('items')
}))

router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    return ConfigModel.findOne({_id, user}).populate(population)
}))

//ItemModel.findOne({article: 'NMB-LCS-BASE'}).then(console.log);
router.post('/create', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const body = await readBody(event)
    const config = await ConfigModel.create({user, ...body})
    const item = await ItemModel.findOne({article: 'NMB-LCS-BASE'})
    console.log(item)
    await PartModel.create({config, item, count: 1})
    return config
}))

router.post('/part/add/:config', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {config} = event.context.params as Record<string, string>
    const body = await readBody(event)
    if (body.count > 0) {
        return PartModel.updateOne({config, item: body.item}, body, {upsert: true})
    } else {
        return PartModel.deleteOne({config, item: body.item})
    }
}))

export default useBase('/api/config', router.handler)
