import XLSX from 'xlsx'
import {ShdModel} from "~~/server/models/shd.model";
import {type IItem, ItemModel} from "~~/server/models/item.model";
import {type IPlatform, PlatformModel} from "~~/server/models/platform.model";
import {ServiceModel} from "~~/server/models/service.model";

export async function parseXls2(file: any) {
    const workbook = XLSX.read(file, {type: 'buffer'});
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1}).filter((r: any) => r[4]?.match('NMB')) as any[]
    await PlatformModel.updateMany({}, {deleted: true})
    await ItemModel.updateMany({}, {deleted: true})
    let platforms = 0
    let items = 0
    for (const row of rows) {
        const data = {
            article: row[4].trim(),
            desc: row[5],
            price: row[7],
            platforms: [row[0], row[1], row[2]],
            type: 'pl',
            models: ['210', '220', '230'],
            deleted: false
        }
        if (data.article.match('NMB-PL')) {
            platforms++
            const platform = await PlatformModel.findOneAndUpdate({article: data.article}, {$set: data}, {
                upsert: true,
                new: true
            })
        } else {
            if (data.platforms.includes('GR') && data.article.match('AR-NV')) {
                data.type = 'ch'
            } else if (data.article.match('-LCS-')) {
                data.type = 'lcs'
                const match = data.article.match(/LCS-..-(\d+)/)
                if (match) {
                    data.models = [match[1]]
                }
            } else if (data.article.match('-DE-')) {
                data.type = 'de'
            } else {
                data.type = 'ar'
                if(row[1])
                console.log(data)
            }
            items++
            const item = await ItemModel.findOneAndUpdate({article: data.article}, {$set: data}, {
                upsert: true,
                new: true
            })
            // if(data.article.match('LCS')) {
            //     console.log(data)
            //     console.log('---------')
            //     console.log(item)
            // }

        }
    }
    return {platforms, items}
}

// export async function parseXls(file: any) {
//     const workbook = XLSX.read(file, {type: 'buffer'});
//     const sheet_name_list = workbook.SheetNames;
//     const sheets = [0, 1, 2, 4, 5, 6]
//     await PlatformModel.updateMany({}, {deleted: true})
//     await ItemModel.updateMany({}, {deleted: true})
//     let total = 0;
//     for (const sheet of sheets) {
//         let platform = undefined
//         const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[sheet]], {header: 1}).filter((r: any) => !!r[0]) as any[]
//         const diskSheet = sheet < 3 ? 3 : 7
//         const disks = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[diskSheet]], {header: 1}) as any[]
//         const rowsWithDisks = rows.concat(disks)
//         const items = []
//         const includes = []
//         console.log(rows.length, disks.length, rowsWithDisks.length)
//         let isItemsList = true
//         for (const row of rowsWithDisks) {
//             const data = {
//                 article: row[0] && row[0].trim(),
//                 desc: row[1] && row[1].replace(';', '').replace('(6 pack)', '').trim(),
//                 count: 1,
//                 price: row[3] || row[6] || 0,
//                 //percent: row[4] || 0,
//                 deleted: false
//
//             }
//             if (data.desc === 'Пример конфигурации:') {
//                 isItemsList = false
//             }
//             if (isItemsList) {
//                 if (data.article === 'NMB-CH-NV3841U2') {
//                     console.log(sheet, data)
//                 }
//                 total++
//                 if (data.article) {
//                     if (data.article.match('-PL')) {
//                         platform = await PlatformModel.findOneAndUpdate({article: data.article}, {$set: data}, {
//                             upsert: true,
//                             new: true
//                         })
//                     } else if (data.article && data.count * 1 > 0) {
//                         const item = await ItemModel.findOneAndUpdate({article: data.article}, {$set: data}, {
//                             upsert: true,
//                             new: true
//                         })
//                         if (item) {
//                             items.push(item.id)
//                         }
//                     }
//                 } else if (data.desc && data.count * 1 > 0) {
//                     //includes
//                     includes.push([data.desc, data.count])
//                 }
//             }
//         }
//         if (platform) {
//             platform.includes = includes
//             platform.items = [...new Set(items)]
//             await platform.save()
//         }
//         const confs = await ConfigModel.find().populate(ConfigModel.getPopulation())
//         for (const conf of confs) {
//             for (let part of conf.parts) {
//                 if (part.item.deleted) {
//                     await PartModel.deleteOne({_id: part._id})
//                 }
//             }
//         }
//     }
//     return `Items: ${total}`
// }
