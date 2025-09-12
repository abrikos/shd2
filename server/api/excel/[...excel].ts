import moment from "moment";
import mongoose from "mongoose";
import {ConfigModel} from "~~/server/models/config.model";
import Excel from 'exceljs'

const router = createRouter()


router.get('/conf/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const filter = user.isAdmin ? {_id} : {_id, user}
    const spec = await ConfigModel.findOne(filter).populate(ConfigModel.getPopulation())
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const {confidential} = getQuery(event)
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}"`
    const workbook = new Excel.Workbook();
    const imageId1 = workbook.addImage({
        filename: process.cwd() + '/public/logo.png',
        extension: 'jpeg',
    });
    const worksheet = workbook.addWorksheet(spec.name.replace(/[^а-яА-Яa-zA-Z0-9]/g, '-').replace('NIMBUS', ''));
    //worksheet.addImage(imageId1, 'A1:A6');

    worksheet.columns = [
        {header: '', key: 'article', width: 40},
        {
            header: '',
            key: 'desc',
            width: 60,
            alignment: {vertical: 'middle', horizontal: 'center'},
            style: {numFmt: '0.00'}
        },
        {header: '', key: 'count', width: 12},
        {header: '', key: 'price', width: 20, style: {numFmt}}, //РРЦ доллар
        {header: '', key: 'sum', width: 20, style: {numFmt}},

    ];

    worksheet.addRows([
        ['ИД', spec.id],
        ['Дата', spec.date],
        ['Название', spec.name],
        [],
        ['QTECH.RU', user.email, new Date()]
    ])
    const headRow = worksheet.addRow({
        article: 'Артикул',
        desc: 'Описание',
        count: "Кол-во",
        sum: "Сумма",
        price: "Цена",
    })
    for (let col = 1; col < 6; col++) {
        headRow.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'CCCCCCCC'},
            fgColor: {argb: 'CCCCCCCC'}
        }
    }

    const platformRow = worksheet.addRow({
        article: spec.platform.article,
        desc: spec.platform.desc,
        count: 1,
        price: spec.platform.price
    })
    const partNumbers = [platformRow.number]
    platformRow.getCell('sum').value = {formula: `C${platformRow.number}*D${platformRow.number}`};
    platformRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}

    for (const part of spec.parts) {
        const partRow = worksheet.addRow({
            article: part.item.article,
            desc: part.item.desc,
            count: part.count,
            price: part.item.price
        })
        partRow.getCell('sum').value = {formula: `C${partRow.number}*D${partRow.number}`};
        partNumbers.push(partRow.number);
    }
    if (spec.nrDiskService) {
        const nrRow = worksheet.addRow({
            article: 'NMB-SUP-NR-DRIVE',
            count: 1,
            price: spec.priceNr,
            sum: spec.priceNr,
            desc: 'Невозврат неисправных накопителей'
        })
        partNumbers.push(nrRow.number);
    }
    if (spec.startupService) {
        const startupRow = worksheet.addRow({
            article: 'NMB-SUP-INST-START',
            count: 1,
            price: spec.priceStartup,
            sum: spec.priceStartup,
            desc: 'Installation and Startup Service'
        })
        partNumbers.push(startupRow.number);
    }
    const summaryRow = worksheet.addRow({
        sum: {formula: `SUM(E${partNumbers[0]}:E${partNumbers[partNumbers.length - 1]})`},
        price: 'Итого'
    });
    for (let col = 1; col < 6; col++) {
        summaryRow.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'CCCCCCCC'},
            fgColor: {argb: 'CCCCCCCC'}
        }
    }
    return workbook.xlsx.writeBuffer();
    //return specToXls(spec, user, user.isAdmin && confidential !== '0', settings?.course || 0)
}))

export default useBase('/api/excel', router.handler)
