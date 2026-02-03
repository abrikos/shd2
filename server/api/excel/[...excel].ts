import {ConfigModel} from "~~/server/models/config.model";
import excelSpec from '~~/server/utils/excel'
import * as fs from "node:fs";

const {devMode} = useRuntimeConfig()
const router = createRouter()




router.get('/spec/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const {confidential} = getQuery(event)
    const filter = user.isAdmin ? {_id} : {_id, user}
    const spec = await SpecModel.findOne(filter).populate({path: 'configs', populate: ConfigModel.getPopulation()}) as ISpec;
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    return excelSpec(spec, confidential === '1')

}))

async function test() {
    if (!devMode) return
    const id = '697c4ea3bfd731d11bca1f7f'
    console.log('test excel')
    console.log(id)
    const spec = await SpecModel.findById(id).populate({path:'configs', populate:ConfigModel.getPopulation()}) as ISpec;
    const confidential = '1'
    const buffer = await excelSpec(spec, confidential === '1')
    const fileName = 'output.xlsx';
    fs.writeFileSync(fileName, buffer);
}

test();
export default useBase('/api/excel', router.handler)
