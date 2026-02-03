import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()
const population = [{path: 'configs', populate: ConfigModel.getPopulation()}, 'fromUser']
async function cloneSpec(spec:ISpec, user:IUser, from?:IUser){
    spec._id = new mongoose.Types.ObjectId;
    if(from){
        spec.fromUser = from
        spec.name = 'Shared ' + spec.name
    }else {
        spec.name = 'Клон ' + spec.name
    }
    spec.isNew = true;
    spec.createdAt = new Date();
    spec.user = user
    for (const conf of spec.configs) {
        const newId = new mongoose.Types.ObjectId;
        conf._id = newId
        conf.isNew = true
        conf.spec = spec
        conf.user = user
        await conf.save()
        for (const p of conf.parts) {
            await PartModel.create({item: p.item, config: newId, count: p.count})
        }
        await conf.save()
    }
    await spec.save()
}

router.post('/share/:_id', defineEventHandler(async (event) => {
    const owner = event.context.user
    if (!owner) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate(population)
    if (!spec) throw createError({statusCode: 404, message: 'Spec not found'})
    const body = await readBody(event)
    for(const email of body){
        const user = await User.findOne({email: email})
        if(user) {
            await cloneSpec(spec, user as IUser, owner)
        }
    }
}))

router.get('/clone/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate(population)
    if (!spec) throw createError({statusCode: 404, message: 'Spec not found'})
    return cloneSpec(spec, user)
}))

router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate(population)
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
    return SpecModel.find({user}).populate(population)
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