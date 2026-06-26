import type {IPart} from "~~/server/models/part.model";

export default defineNuxtPlugin(() => {
    function partCount(parts: IPart[], tab: string) {
        return parts.filter((p: IPart) => p.item.article.match(tab)).reduce((sum, part) => sum + part.count, 0);
    }

    function jbdMaxCount(conf: IConfig) {
        if (conf.platform.modelName === '210') {
            return 1
        }
        if (conf.platform.modelName === '220') {
            return 2
        }
        if (conf.platform.modelName === '230') {
            return conf.platform.typeName === 'Гром' ? 4 : 2
        }
        return -1
    }

    function disksCount(conf: IConfig, form: string) {
        return conf.parts.filter((p: IPart) => p.item.diskForm === form.toUpperCase()).reduce((sum, part) => sum + part.count, 0);
    }

    function disksMaxCount(conf: IConfig, form: string) {
        const noPolkaMax = conf.platform.typeName === 'Гром' ? 20 : 24
        let max = 0;
        const polki = conf.parts.filter((p: IPart) => p.item.type==='de')

        for (const p of polki) {
            max += (p.item[form]) * p.count
        }
        return noPolkaMax + max
    }

    function disksCompat(conf: IConfig) {
        if (conf.platform.typeName === 'Молния') {
            return true
        } else {
            const disks35 = conf.parts.filter((p: IPart) => p.item.desc.match('3.5'))
            return conf.polkiCount || !disks35.length
        }
    }

    return {
        provide: {
            jbdMaxCount,
            cacheSet: (conf: IConfig) => {
                return partCount(conf.parts, '-CH-') === 4
            },
            configValidator: (conf: IConfig) => {
                const list = []
                const jbdCount = partCount(conf.parts, 'JBD') || partCount(conf.parts, '-EF-')
                const cacheCount = partCount(conf.parts, '-NV')
                if (jbdCount > jbdMaxCount(conf)) {
                    list.push(`Количество выбранных полок (${jbdCount}) превышает допустимое (${jbdMaxCount(conf)})`)
                }
                if (![0, 4].includes(cacheCount) && conf.platform.typeName === 'Гром') {
                    list.push(`Количество дисков кэша (${cacheCount}) либо 0, либо 4`)
                }
                if (conf.platform.typeName === 'Гром' && !cacheCount) {
                    list.push(`Необходимо добавить NVMe диски для кэша`)
                }
                if (conf.platform.typeName === 'Гром' && !conf.hbaCount && conf.polkiCount) {
                    list.push(`Добавьте HBA-адаптеры для подключения дисковых полок`)
                }
                if (disksCount(conf, 'lff') > disksMaxCount(conf, 'lff')) {
                    list.push(`Количество выбранных дисков LFF(${disksCount(conf, 'lff')}) превышает максимальное (${disksMaxCount(conf, 'lff')})`);
                }
                if (disksCount(conf, 'sff') > disksMaxCount(conf, 'sff')) {
                    list.push(`Количество выбранных дисков SFF(${disksCount(conf, 'sff')}) превышает максимальное (${disksMaxCount(conf, 'sff')})`);
                }
                if (!disksCompat(conf)) {
                    list.push(`Тип выбранных дисков невозможно установить в систему`);
                }

                if(conf.platform.ocpMax < conf.ocpCount){
                    list.push(`Недостаточно OCP слотов (${conf.platform.ocpMax}) для выбранного количества OCP устройств (${conf.ocpCount})`);
                }
                console.log(conf.platform.pcie8Max, conf.pcie8Count, '===', conf.platform.pcie16Max , conf.pcie16Count)
                if(conf.platform.pcie8Max + conf.platform.pcie16Max < conf.pcie8Count + conf.pcie16Count){
                    list.push(`Недостаточно PCIE слотов (${conf.platform.pcie8Max + conf.platform.pcie16Max}) для выбранного количества устройств (${conf.pcie8Count + conf.pcie16Count})`);
                }


                return list;
            },
            partOptions: (conf: IConfig, tab: string) => {
                if(tab=='de') return Array.from(Array(jbdMaxCount(conf) + 1).keys())
                if(tab=='ch') return [0,4]
                if(tab=='ex') return [0,2,4,6]
                return  Array.from(Array(11).keys())
            },
        }
    }
})