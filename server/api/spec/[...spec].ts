import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()

async function cloneSpec(spec:ISpec){
    spec._id = new mongoose.Types.ObjectId;
    spec.name = 'Клон ' + spec.name
    spec.isNew = true;
    spec.createdAt = new Date();
    for (const conf of spec.configs) {
        const newId = new mongoose.Types.ObjectId;
        conf._id = newId
        conf.isNew = true
        conf.spec = spec
        await conf.save()
        for (const p of conf.parts) {
            await PartModel.create({item: p.item, config: newId, count: p.count})
        }
        await conf.save()
    }
    await spec.save()
}

router.get('/clone/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate({path: 'configs', populate: ConfigModel.getPopulation()})
    if (!spec) throw createError({statusCode: 404, message: 'Spec not found'})
    return cloneSpec(spec)
}))

router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate({path: 'configs', populate: ConfigModel.getPopulation()})
    if (!spec) throw createError({statusCode: 404, message: 'Spec not found'})
    return spec
}))

router.delete('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    return SpecModel.findOneAndDelete({_id, user})
}))

router.get('/list/user', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    return SpecModel.find({user}).populate({path: 'configs', populate: ConfigModel.getPopulation()})
}))

router.patch('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const body = await readBody(event)
    const {_id} = event.context.params as Record<string, string>
    return SpecModel.findByIdAndUpdate(_id, {name: body.name})
}))

router.get('/create/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const conf = await ConfigModel.findById(_id)
    if (!conf) throw createError({statusCode: 404, message: 'Configuration not found'})
    conf.spec = await SpecModel.create({name: 'Спецификация ' + moment().format('YYYY-MM-DD HH:mm'), user})

    await conf.save()
    return
}))


export default useBase('/api/spec', router.handler)