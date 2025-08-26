import XLSX from 'xlsx'
import {ShdModel} from "~~/server/models/shd.model";
import {type IItem, ItemModel} from "~~/server/models/item.model";
import {type IPlatform, PlatformModel} from "~~/server/models/platform.model";

export async function parseXls(file: any) {
    const workbook = XLSX.read(file, {type: 'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const sheets = [2]
    PlatformModel.updateMany({}, {deleted: true})
    ItemModel.updateMany({}, {deleted: true})
    for (const sheet of sheets) {
        let platform = undefined
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[sheet]], {header: 1}) as any[]
        const items = []
        const includes = []
        let actual = true
        for (const row of rows) {
            const data = {
                article: row[1],
                desc: row[2],
                count: row[3] || 0,
                price: row[4] || 0,
                items: [],
                includes: [],
                deleted: false

            }
            if(data.desc === 'Пример конфигурации:') {
                actual = false
            }
            if(actual) {
                if (data.article) {
                    if (data.article.match('PLGR')) {
                        platform = await PlatformModel.findOne({article: data.article}) as IPlatform
                        if (!platform) {
                            platform = await PlatformModel.create(data)
                        }
                        await platform.save()
                    } else if (data.article && data.count * 1 > 0) {
                        let itemExists = await ItemModel.findOne({article: data.article, desc: data.desc}) as IItem
                        if (!itemExists) {
                            itemExists = await ItemModel.create(data)
                        }
                        items.push(itemExists.id)
                    }
                } else if (data.desc && data.count * 1 > 0) {
                    //includes
                    includes.push([data.desc, data.count])
                }
            }
        }
        if(platform) {
            platform.includes = includes
            platform.items = items
            await platform.save()
        }

    }
    return `Items: `
}
