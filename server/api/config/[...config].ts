import {ShdModel} from "~~/server/models/shd.model";
import {PlatformModel} from "~~/server/models/platform.model";

const router = createRouter()

router.get('/platforms', defineEventHandler(async (event) => {
    return PlatformModel.find()
}))

router.get('/platform/:_id', defineEventHandler(async (event) => {
    const {_id} = event.context.params as Record<string, string>
    return PlatformModel.findById(_id).populate('items')
}))

export default useBase('/api/config', router.handler)
