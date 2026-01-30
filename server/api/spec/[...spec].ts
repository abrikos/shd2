import moment from "moment";

const router = createRouter()

router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const spec = await SpecModel.findById(_id).populate({path: 'configs', populate: ConfigModel.getPopulation()})
    if (!spec) throw createError({statusCode: 404, message: 'Spec not found'})
    return spec
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