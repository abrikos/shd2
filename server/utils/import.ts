import XLSX from 'xlsx'
import {ShdModel} from "~~/server/models/shd.model";
import {type IItem, ItemModel} from "~~/server/models/item.model";
import {type IPlatform, PlatformModel} from "~~/server/models/platform.model";
import {ServiceModel} from "~~/server/models/service.model";

export async function parseXls(file: any) {
    const workbook = XLSX.read(file, {type: 'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const sheets = [0, 1, 2, 3, 4, 5]
    await PlatformModel.updateMany({}, {deleted: true})
    await ItemModel.updateMany({}, {deleted: true})
    let total = 0;
    for (const sheet of sheets) {
        let platform = undefined
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[sheet]], {header: 1}) as any[]
        const items = []
        const includes = []
        let isItemsList = true
        total += rows.length
        for (const row of rows) {
            const data = {
                article: row[1] && row[1].trim(),
                desc: row[2],
                count: row[3] || 0,
                price: row[4] || 0,
                percent: row[4] || 0,
                items: [],
                includes: [],
                deleted: false

            }
            if (data.desc === 'Пример конфигурации:' || sheet === 3) {
                isItemsList = false
            }
            if (isItemsList) {
                if (data.article) {
                    if (data.article.match('-PL')) {
                        await PlatformModel.updateOne({article: data.article}, data, {upsert: true})
                        platform = await PlatformModel.findOne({article: data.article}) as IPlatform
                    } else if (data.article && data.count * 1 > 0) {
                        const x = await ItemModel.updateOne({article: data.article}, data, {upsert: true})
                        const item = await ItemModel.findOne({article: data.article})
                        if (item) {
                            items.push(item.id)
                        }
                    }
                } else if (data.desc && data.count * 1 > 0) {
                    //includes
                    includes.push([data.desc, data.count])
                }
            }
        }
        if (platform) {
            platform.includes = includes
            platform.items = [...new Set(items)]
            await platform.save()
        }

    }
    return `Items: ${total}`
}
