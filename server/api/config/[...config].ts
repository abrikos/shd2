import {ShdModel} from "~~/server/models/shd.model";
import {PlatformModel} from "~~/server/models/platform.model";
import {ConfigModel} from "~~/server/models/config.model";
import {type IPart, PartModel} from "~~/server/models/part.model";
import {ServiceModel} from "~~/server/models/service.model";
import moment from "moment";

const router = createRouter()

router.get('/platforms', defineEventHandler(async (event) => {
    return PlatformModel.find()
}))

router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    return ConfigModel.find({user}).sort({createdAt: -1}).populate(ConfigModel.getPopulation())
}))

router.get('/platform/:_id', defineEventHandler(async (event) => {
    const {_id} = event.context.params as Record<string, string>
    return PlatformModel.findById(_id).populate('items')
}))

router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    return ConfigModel.findOne({_id, user}).populate(ConfigModel.getPopulation())
}))

// ConfigModel.findOne({_id:'68df8929b9bd3eaec6f93dbd'}).populate(ConfigModel.getPopulation())
//     .then(c=>console.log(c.id, c.parts.map(p=>p.item)))

router.get('/services', defineEventHandler(async (event) => {
    return ServiceModel.find()
}))

router.delete('/delete/:_id', defineEventHandler(async (event) => {
    const {_id} = event.context.params as Record<string, string>
    return ConfigModel.deleteOne({_id})
}))

router.put('/update', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id, ...rest} = await readBody(event)
    const config = await ConfigModel.findOne({_id, user}).populate(ConfigModel.getPopulation())
    if (!config) throw createError({statusCode: 404, message: 'Конфигурация не найдена'})
    const fields = ['name', 'service', 'nrDiskService', 'startupService']
    for (const field in rest) {
        if (fields.includes(field)) {
            config[field] = rest[field]
            console.log(field, rest[field])
        }
    }
    await config.save()
    await config.populate(ConfigModel.getPopulation())
    return config
}))


//ItemModel.findOne({article: 'NMB-LCS-BASE'}).then(console.log);
//ServiceModel.deleteMany().then(console.log)
//ItemModel.find({article:'NMB-CH-NV3841U2'}).then(console.log);
router.post('/create', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const body = await readBody(event)
    const platform = await PlatformModel.findById(body.platform)
    if (!platform) throw createError({statusCode: 406, message: 'Платформа не найдена'})
    const config = await ConfigModel.create({
        user,
        platform,
        name: `NIMBUS "${platform.typeName}" ${platform.modelName} - ${moment().format('YYYY-MM-DD HH:mm')}`
    })
    await config.populate(ConfigModel.getPopulation())
    const parts = ['NMB-LCS-NVMECCH', 'NMB-LCS-BASE']
    for (const article of parts) {
        const item = await ItemModel.findOne({article, deleted: false})
        if(item) {
            await PartModel.create({config, item, count: 1})
        }
    }
    if(platform.typeName === 'Гром'){
        const item = await ItemModel.findOne({article:'NMB-CH-NV3841U2', deleted: false})
        if(item) {
            await PartModel.create({config, item, count: 4})
        }
    }
    const service = await ServiceModel.findOne({article: 'NMB-SUP-BAS-3Y'})
    if (service) {
        config.service = service
        config.save()
    }
    return config
}))

//ItemModel.find({article:'NMB-LCS-ENTPKG'}).then(console.log);;
async function dctPkgAutomation(config: IConfig) {
    const configParts = await PartModel.find({config}).populate('item')
    const item = await ItemModel.findOne({article: 'NMB-LCS-DCTPKG', deleted: false})
    if (configParts.filter(p => ['NMB-LCS-LOCALREP', 'NMB-LCS-RRP-AS', 'NMB-LCS-METROCL'].includes(p.item.article)).length > 1) {
        await PartModel.updateOne({config, item}, {count: 1}, {upsert: true})
    } else {
        await PartModel.deleteOne({config, item})
    }
}

router.post('/part/add/:cid', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {cid} = event.context.params as Record<string, string>
    const config = await ConfigModel.findById(cid).populate(ConfigModel.getPopulation())
    if (!config) throw createError({statusCode: 404, message: 'Конфигурация не найдена'})
    const body = await readBody(event)
    if (body.count > 0) {
        if (body.item.article === 'NMB-LCS-COMP-DEDUP' && body.count) {
            const item = await ItemModel.findOne({article: 'NMB-LCS-ENTPKG', deleted: false})
            await PartModel.updateOne({config, item}, {count: 1}, {upsert: true})
        }
        await PartModel.updateOne({config, item: body.item.id}, body, {upsert: true})
        //DCTPKG
        await dctPkgAutomation(config)
    } else {
        const x = await PartModel.deleteOne({config, item: body.item.id})
        await dctPkgAutomation(config)
    }
}))

export default useBase('/api/config', router.handler)
