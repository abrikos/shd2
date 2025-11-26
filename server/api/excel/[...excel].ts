import moment from "moment";
import mongoose from "mongoose";
import {ConfigModel} from "~~/server/models/config.model";
import Excel from 'exceljs'
import * as fs from "node:fs";

const {devMode} = useRuntimeConfig()
const router = createRouter()


function colorRow(row: any, color: string) {
    for (let col = 1; col < 6; col++) {
        row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: color},
            fgColor: {argb: color}
        }
    }
}

function fontRow(row: any) {
    const font = {name: 'Arial', size: 8, italic: true, color: {argb:'FFAAAAAA'}}
    row.getCell('article').font = font
    row.getCell('article').alignment = {vertical: 'middle',horizontal: 'right'}
    row.getCell('desc').font = font
    row.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    row.getCell('count').font = font
    row.getCell('price').font = font
    row.getCell('sum').font = font
}

async function excel(spec: IConfig, confidential: any) {
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const numFmt = `_(* #,##0.00_)"$"`
    const currName = '$' //confidential ? '$' : user.currency
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
        ['QTECH.RU', spec.user.email, new Date()]
    ])
    const headRow = worksheet.addRow({
        article: 'Артикул',
        desc: 'Описание',
        count: "Кол-во",
        sum: "Сумма",
        price: "Цена",
    })

    colorRow(headRow, 'BBBBBBBB')

    const configRow = worksheet.addRow({
        desc: spec.description,
        count: 1,
        price: spec.priceTotal
    })
    configRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    configRow.getCell('sum').value = {formula: `C${configRow.number}*D${configRow.number}`};

    const platformRow = worksheet.addRow({
        article: spec.platform.article,
        desc: spec.platform.desc,
        count: 1,
        price: spec.platform.priceDdp
    })
    platformRow.getCell('count').value = {formula: `C${configRow.number}`};
    const partNumbers = [platformRow.number]
    platformRow.getCell('sum').value = {formula: `C${platformRow.number}*D${platformRow.number}`};
    platformRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    fontRow(platformRow)
    //colorRow(platformRow, 'DDDDDDDD')

    for (const part of spec.parts) {
        const partRow = worksheet.addRow({
            article: part.item.article,
            desc: part.item.desc,
            count: part.count,
            price: part.item.priceDdp
        })
        partRow.getCell('count').value = {formula: `C${configRow.number}*${part.count}`};
        partRow.getCell('sum').value = {formula: `C${partRow.number}*D${partRow.number}`};
        fontRow(partRow)
        //colorRow(partRow, 'DDDDDDDD')
        //partRow.style = {font: { name: 'Comic Sans MS', size: 16, bold: true }}
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
        nrRow.getCell('count').value = {formula: `C${configRow.number}`};
        nrRow.getCell('sum').value = {formula: `C${nrRow.number}*D${nrRow.number}`};
        fontRow(nrRow)
        //colorRow(nrRow, 'DDDDDDDD')
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
        startupRow.getCell('count').value = {formula: `C${configRow.number}`};
        startupRow.getCell('sum').value = {formula: `C${startupRow.number}*D${startupRow.number}`};
        fontRow(startupRow)
        //colorRow(startupRow, 'DDDDDDDD')
        partNumbers.push(startupRow.number);
    }
    const summaryRow = worksheet.addRow({
        sum: {formula: `SUM(E${partNumbers[0]}:E${partNumbers[partNumbers.length - 1]})`},
        price: 'Итого'
    });
    colorRow(summaryRow, 'BBBBBBBB')
    // const descRow = worksheet.addRow([spec.description])
    // descRow.alignment = {wrapText: true};
    // worksheet.mergeCells(`A${descRow.number}:E${descRow.number}`)
    // worksheet.addRow([''])

    worksheet.addRow([''])
    const f1 = worksheet.addRow(['Условия гарантии:'])
    worksheet.addRow(['На все оборудование распространяется услуга гарантийного и/или сервисного обслуживания.'])
    worksheet.addRow(['Начало гарантии/сервиса считается с момента приобретения оборудования.'])
    worksheet.addRow(['Производитель обязуется в течение всего гарантийного срока устранять выявленные дефекты'])
    worksheet.addRow(['путем ремонта или замены оборудования при условии, что дефект возник по вине Производителя.'])
    worksheet.addRow(['Подробнее по ссылке - www.qtech.ru/support'])

    worksheet.addRow([''])
    const f3 = worksheet.addRow(['Условия размещения заказа:'])
    f1.getCell(1).style = {font: {bold: true}}
    f3.getCell(1).style = {font: {bold: true}}
    //worksheet.addRow(['Спецификация подлежит уточнению перед закупкой/подписанием договора'])
    worksheet.addRow(['Срок действия спецификации 1 неделя с даты создания. Данная спецификация  носит информационный характер и'])
    worksheet.addRow(['не является публичной офертой. По всем вопросам, связанным с данной спецификацией, обращайтесь к менеджерам по'])
    worksheet.addRow(['работе с партнерами компании QTECH. '])

    return workbook.xlsx.writeBuffer();
}

router.get('/conf/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const {confidential} = getQuery(event)
    const filter = user.isAdmin ? {_id} : {_id, user}
    const spec = await ConfigModel.findOne(filter).populate(ConfigModel.getPopulation()) as IConfig;
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    return excel(spec, confidential)

}))

async function test() {
    if(!devMode) return
    const spec = await ConfigModel.findById('69269afb66fb89f9ee218744').populate(ConfigModel.getPopulation()) as IConfig;
    const buffer = await excel(spec, '0')
    const fileName = 'output.xlsx';
    fs.writeFileSync(fileName, buffer);

}

test()
export default useBase('/api/excel', router.handler)
