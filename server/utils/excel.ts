import Excel from "exceljs";

function colorRow(row: any, color: string) {
    for (let col = 1; col < 7; col++) {
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
    row.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
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

function confidentialCells(row: any, priceDDP: number, spec: IConfig) {
    //row.getCell('price-fob').value = priceFob
    //row.getCell('fob').value = {formula: `C${row.number}*G${row.number}`}
    //row.getCell('price-ddp').value = {formula: `${priceFob}*1.4`}
    row.getCell('price-ddp').value = priceDDP
    row.getCell('ddp').value = {formula: `C${row.number}*H${row.number}`}
    row.getCell('price-gpl').value = {formula: `H${row.number} * 100 / ${spec.platform.coefficientGpl}`}
    row.getCell('gpl').value = {formula: `C${row.number}*J${row.number}`}
    for (let col = 7; col < 13; col++) {
        row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'FFFF0000'},
            fgColor: {argb: 'FFFF0000'}
        }
    }
}

async function excelConf(worksheet: Excel.Worksheet, confidential:boolean, config:IConfig) {
    const confRow = worksheet.addRow(['', config.name])
    confRow.getCell(2).style = {font: {bold: true}}
    const headRow = worksheet.addRow({
        article: 'Артикул',
        desc: 'Описание',
        count: "Кол-во",
        percent: "Скидка (%)",
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
        desc: config.description,
        count: config.count,
        percent: 0,
        price: config.priceTotalGpl
    })
    // console.log('zzzzz', spec.priceTotalGpl)
    configRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    configRow.getCell('sum').value = {formula: `C${configRow.number}*D${configRow.number} * (1 - E${configRow.number}/100)`}
    if (confidential) {
        confidentialCells(configRow, config.price, config)
        // row.getCell('price-fob').value = spec.price
        // row.getCell('fob').value = {formula: `C${row.number}*G${row.number}`}
        configRow.getCell('price-ddp').value = ''

        // row.getCell('price-gpl').value = spec.priceTotalGpl
        configRow.getCell('price-gpl').value = ''
    }

    const platformRow = worksheet.addRow({
        article: config.platform.article,
        desc: config.platform.desc,
        count: 1,
        price: 0
    })
    // console.log('ffffffff', spec.platform.price)
    platformRow.getCell('count').value = {formula: `C${configRow.number}`};
    const partNumbers = [platformRow.number]
    platformRow.getCell('sum').value = {formula: `C${platformRow.number}*D${platformRow.number}`};
    platformRow.getCell('desc').alignment = {vertical: 'middle', wrapText: true}
    if (confidential) {
        confidentialCells(platformRow, config.platform.price, config)
    }

    fontRow(platformRow)
    //colorRow(platformRow, 'DDDDDDDD')

    for (const part of config.parts) {
        const partRow = worksheet.addRow({
            article: part.item.article,
            desc: part.item.desc,
            count: part.count,
            //price: part.item.priceDdp
        })
        partRow.getCell('count').value = {formula: `C${configRow.number}*${part.count}`};
        partRow.getCell('sum').value = {formula: `C${partRow.number}*D${partRow.number}`};
        if (confidential) {
            confidentialCells(partRow, part.item.price, config)
        }

        fontRow(partRow)
        //colorRow(partRow, 'DDDDDDDD')
        //partRow.style = {font: { name: 'Comic Sans MS', size: 16, bold: true }}
        partNumbers.push(partRow.number);

    }

    if (config.service) {
        const serviceRow = worksheet.addRow({
            article: config.service.article,
            //price: spec.priceService,
            desc: config.service.desc
        })
        serviceRow.getCell('count').value = {formula: `C${configRow.number}`};
        serviceRow.getCell('sum').value = {formula: `C${serviceRow.number}*D${serviceRow.number}`};
        if (confidential) {
            confidentialCells(serviceRow, config.priceService, config)
        }

        fontRow(serviceRow)
        //colorRow(nrRow, 'DDDDDDDD')
        partNumbers.push(serviceRow.number);
    }

    if (config.nrDiskService) {
        const nrRow = worksheet.addRow({
            article: 'NMB-SUP-NR-DRIVE',
            //price: spec.priceNr,
            desc: 'Невозврат неисправных накопителей'
        })
        nrRow.getCell('count').value = {formula: `C${configRow.number}`};
        nrRow.getCell('sum').value = {formula: `C${nrRow.number}*D${nrRow.number}`};
        if (confidential) {
            confidentialCells(nrRow, config.priceNr, config)
        }

        fontRow(nrRow)
        //colorRow(nrRow, 'DDDDDDDD')
        partNumbers.push(nrRow.number);
    }

    if (config.startupService) {
        const startupRow = worksheet.addRow({
            article: 'NMB-SUP-INST-START',
            //price: spec.priceStartup,
            desc: 'Installation and Startup Service'
        })
        startupRow.getCell('count').value = {formula: `C${configRow.number}`};
        startupRow.getCell('sum').value = {formula: `C${startupRow.number}*D${startupRow.number}`};
        if (confidential) {
            confidentialCells(startupRow, config.priceStartup, config)
        }

        fontRow(startupRow)
        //colorRow(startupRow, 'DDDDDDDD')
        partNumbers.push(startupRow.number);
    }

    configRow.getCell('ddp').value = confidential ? {formula: `SUM(I${partNumbers[0]}:I${partNumbers[partNumbers.length - 1]})`} : ''
    configRow.getCell('gpl').value = confidential ? {formula: `SUM(K${partNumbers[0]}:K${partNumbers[partNumbers.length - 1]})`} : ''
    return configRow.number
}

export default async function excelSpec(spec: ISpec, confidential: boolean) {
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
        {header: '', key: 'percent', width: 20},
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

    const sumRows = []
    for(const conf of spec.configs){
        const number = await excelConf(worksheet, confidential, conf);
        sumRows.push(number)
        worksheet.addRow([''])
    }

    const totalRow = worksheet.addRow({
        sum: {formula:sumRows.map(r=>`F${r}`).join('+')},
        price:'Итого:',
        ddp: confidential ? {formula:sumRows.map(r=>`I${r}`).join('+')} : '',
        gpl: confidential ? {formula:sumRows.map(r=>`K${r}`).join('+')} : '',
    })
    totalRow.getCell('sum').style.font = {bold: true}
    totalRow.getCell('ddp').style.font = {bold: true}
    totalRow.getCell('gpl').style.font = {bold: true}
    totalRow.getCell('price').style.font = {bold: true}

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