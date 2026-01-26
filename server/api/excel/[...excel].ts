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
    const font = {name: 'Arial', size: 10, italic: true, color: {argb: 'FFAAAAAA'}, bold: true}
    row.getCell('article').font = font
    row.getCell('article').alignment = {vertical: 'middle', horizontal: 'right'}
    row.getCell('desc').font = font
    //row.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    row.getCell('count').font = font
    row.getCell('price').font = font
    row.getCell('sum').font = font
    const fontConfidential = structuredClone(font);
    fontConfidential.color.argb = 'FFDDAA99'

    //row.getCell('price-fob').font = fontConfidential
    //row.getCell('fob').font = fontConfidential
    row.getCell('price-ddp').font = fontConfidential
    row.getCell('ddp').font = fontConfidential
    row.getCell('price-gpl').font = fontConfidential
    row.getCell('gpl').font = fontConfidential
}

function confidentialCells(row: any, priceDDP: number, spec:IConfig) {
    //row.getCell('price-fob').value = priceFob
    //row.getCell('fob').value = {formula: `C${row.number}*G${row.number}`}
    //row.getCell('price-ddp').value = {formula: `${priceFob}*1.4`}
    row.getCell('price-ddp').value = priceDDP
    row.getCell('ddp').value = {formula: `C${row.number}*G${row.number}`}
    row.getCell('price-gpl').value = {formula: `G${row.number} * 100 / ${spec.platform.coefficientGpl}`}
    row.getCell('gpl').value = {formula: `C${row.number}*I${row.number}`}
    for (let col = 7; col < 13; col++) {
        row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'FFFF0000'},
            fgColor: {argb: 'FFFF0000'}
        }
    }
}

async function excel(spec: IConfig, confidential: boolean) {
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
        {header: '', key: 'space', width: 20, style: {numFmt}},
        //{header: '', key: 'price-fob', width: 20, style: {numFmt}},
        //{header: '', key: 'fob', width: 20, style: {numFmt}},
        {header: '', key: 'price-ddp', width: 20, style: {numFmt}},
        {header: '', key: 'ddp', width: 20, style: {numFmt}},
        {header: '', key: 'price-gpl', width: 20, style: {numFmt}},
        {header: '', key: 'gpl', width: 20, style: {numFmt}},

    ];

    worksheet.addRows([
        ['ИД', spec.id],
        ['Дата', spec.date],
        ['Название', spec.name],
        [],
        ['NIMBUS.RU', spec.user.email, '', '', '', '', confidential ? 'Только для служебного использования' : '']
    ])
    const headRow = worksheet.addRow({
        article: 'Артикул',
        desc: 'Описание',
        count: "Кол-во",
        sum: "Сумма",
        price: "Цена",
    })
    if (confidential) {
        const row = headRow
        //row.getCell('price-fob').value = 'Цена fob'
        //row.getCell('fob').value = 'Сумма fob'
        row.getCell('price-ddp').value = 'Цена ddp'
        row.getCell('ddp').value = 'Сумма ddp'
        row.getCell('price-gpl').value = 'Цена gpl'
        row.getCell('gpl').value = 'Сумма gpl'
        for (let col = 7; col < 13; col++) {
            row.getCell(col).fill = {
                type: 'pattern',
                pattern: 'solid',
                bgColor: {argb: 'BBBBBBBB'},
                fgColor: {argb: 'BBBBBBBB'}
            }
        }
    }
    colorRow(headRow, 'BBBBBBBB')

    const configRow = worksheet.addRow({
        desc: spec.description,
        count: 1,
        price: spec.priceTotalGpl
    })
    // console.log('zzzzz', spec.priceTotalGpl)
    configRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    configRow.getCell('sum').value = {formula: `C${configRow.number}*D${configRow.number}`}
    if (confidential) {
        confidentialCells(configRow, spec.price, spec)
        // row.getCell('price-fob').value = spec.price
        // row.getCell('fob').value = {formula: `C${row.number}*G${row.number}`}
        configRow.getCell('price-ddp').value = ''

        // row.getCell('price-gpl').value = spec.priceTotalGpl
        configRow.getCell('price-gpl').value = ''
    }

    const platformRow = worksheet.addRow({
        article: spec.platform.article,
        desc: spec.platform.desc,
        count: 1,
        price: spec.platform.priceDdp
    })
    // console.log('ffffffff', spec.platform.price)
    platformRow.getCell('count').value = {formula: `C${configRow.number}`};
    const partNumbers = [platformRow.number]
    platformRow.getCell('sum').value = {formula: `C${platformRow.number}*D${platformRow.number}`};
    platformRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    if (confidential) {
        confidentialCells(platformRow, spec.platform.price, spec)
    }

    fontRow(platformRow)
    //colorRow(platformRow, 'DDDDDDDD')

    for (const part of spec.parts) {
        const partRow = worksheet.addRow({
            article: part.item.article,
            desc: part.item.desc,
            count: part.count,
            //price: part.item.priceDdp
        })
        partRow.getCell('count').value = {formula: `C${configRow.number}*${part.count}`};
        partRow.getCell('sum').value = {formula: `C${partRow.number}*D${partRow.number}`};
        if (confidential) {
            confidentialCells(partRow, part.item.price, spec)
        }

        fontRow(partRow)
        //colorRow(partRow, 'DDDDDDDD')
        //partRow.style = {font: { name: 'Comic Sans MS', size: 16, bold: true }}
        partNumbers.push(partRow.number);

    }

    if (spec.service) {
        const serviceRow = worksheet.addRow({
            article: spec.service.article,
            //price: spec.priceService,
            desc: spec.service.desc
        })
        serviceRow.getCell('count').value = {formula: `C${configRow.number}`};
        serviceRow.getCell('sum').value = {formula: `C${serviceRow.number}*D${serviceRow.number}`};
        if (confidential) {
            confidentialCells(serviceRow, spec.priceService, spec)
        }

        fontRow(serviceRow)
        //colorRow(nrRow, 'DDDDDDDD')
        partNumbers.push(serviceRow.number);
    }

    if (spec.nrDiskService) {
        const nrRow = worksheet.addRow({
            article: 'NMB-SUP-NR-DRIVE',
            //price: spec.priceNr,
            desc: 'Невозврат неисправных накопителей'
        })
        nrRow.getCell('count').value = {formula: `C${configRow.number}`};
        nrRow.getCell('sum').value = {formula: `C${nrRow.number}*D${nrRow.number}`};
        if (confidential) {
            confidentialCells(nrRow, spec.priceNr, spec)
        }

        fontRow(nrRow)
        //colorRow(nrRow, 'DDDDDDDD')
        partNumbers.push(nrRow.number);
    }

    if (spec.startupService) {
        const startupRow = worksheet.addRow({
            article: 'NMB-SUP-INST-START',
            //price: spec.priceStartup,
            desc: 'Installation and Startup Service'
        })
        startupRow.getCell('count').value = {formula: `C${configRow.number}`};
        startupRow.getCell('sum').value = {formula: `C${startupRow.number}*D${startupRow.number}`};
        if (confidential) {
            confidentialCells(startupRow, spec.priceStartup, spec)
        }

        fontRow(startupRow)
        //colorRow(startupRow, 'DDDDDDDD')
        partNumbers.push(startupRow.number);
    }

    configRow.getCell('ddp').value = confidential ? {formula: `SUM(H${partNumbers[0]}:H${partNumbers[partNumbers.length - 1]})`} : ''
    configRow.getCell('gpl').value = confidential ? {formula: `SUM(J${partNumbers[0]}:J${partNumbers[partNumbers.length - 1]})`} : ''
    // const summaryRow = worksheet.addRow({
    //     //sum: {formula: `SUM(E${partNumbers[0]}:E${partNumbers[partNumbers.length - 1]})`},
    //     sum: {formula: `E${configRow.number}`},
    //     price: 'Итого',
    //     //fob: confidential ? {formula: `SUM(H${partNumbers[0]}:H${partNumbers[partNumbers.length - 1]})`}: '',
    //     ddp: confidential ? {formula: `SUM(H${partNumbers[0]}:H${partNumbers[partNumbers.length - 1]})`} : '',
    //     gpl: confidential ? {formula: `SUM(J${partNumbers[0]}:J${partNumbers[partNumbers.length - 1]})`} : '',
    // });
    // colorRow(summaryRow, 'BBBBBBBB')
    // for (let col = 7; col < 13; col++) {
    //     if (col < 6 || confidential) {
    //         summaryRow.getCell(col).fill = {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             bgColor: {argb: 'BBBBBBBB'},
    //             fgColor: {argb: 'BBBBBBBB'}
    //         }
    //     }
    // }
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

    worksheet.addRow([''])
    const f3 = worksheet.addRow(['Условия размещения заказа:'])
    f1.getCell(1).style = {font: {bold: true}}
    f3.getCell(1).style = {font: {bold: true}}
    //worksheet.addRow(['Спецификация подлежит уточнению перед закупкой/подписанием договора'])
    worksheet.addRow(['Срок действия спецификации 1 неделя с даты создания. Данная спецификация  носит информационный характер и'])
    worksheet.addRow(['не является публичной офертой. По всем вопросам, связанным с данной спецификацией, обращайтесь к менеджерам по'])
    worksheet.addRow(['работе с партнерами компании NIMBUS. '])

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
    return excel(spec, confidential === '1')

}))

async function test() {
    if (!devMode) return
    const id = '6976e2165413bfd74172a3fe'
    console.log('test excel')
    console.log(id)
    const spec = await ConfigModel.findById(id).populate(ConfigModel.getPopulation()) as IConfig;
    const confidential = '1'
    const buffer = await excel(spec, confidential === '1')
    const fileName = 'output.xlsx';
    fs.writeFileSync(fileName, buffer);
}

test();
export default useBase('/api/excel', router.handler)
