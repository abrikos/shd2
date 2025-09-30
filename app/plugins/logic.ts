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
            return conf.platform.typeName === 'Гром' ? 4 : 3
        }
        return -1
    }

    function polkiCount(conf: IConfig) {
        return conf.parts.filter((p: IPart) => p.item.article.match(/-JBD-|-EF-/)).reduce((sum, part) => sum + part.count, 0);
    }

    function disksCount(conf: IConfig) {
        const dCount = conf.parts.filter((p: IPart) => p.item.article.match('-AR-')).reduce((sum, part) => sum + part.count, 0);
        const mCount = conf.parts.filter((p: IPart) => p.item.article.match('-AR6-')).reduce((sum, part) => sum + part.count, 0) * 6;
        return mCount + dCount;
    }

    function disksMaxCount(conf: IConfig) {
        const counts = [
            {name: 'NMB-JBD-24S4U', max: 24},
            {name: 'NMB-JBD-90S4U', max: 90},
            {name: 'NMB-EF-24S2', max: 24},
        ]
        const noPolkaMax = conf.platform.typeName === 'Гром' ? 20 : 24
        for (const count of counts) {
            if (conf.parts.find((p: IPart) => p.item.article === count.name)) {
                return count.max * polkiCount(conf) + noPolkaMax;
            }
        }
        return noPolkaMax
    }

    function disksCompat(conf: IConfig) {
        if(conf.platform.typeName === 'Молния') {
            return true
        }else{
            const disks35 = conf.parts.filter((p: IPart) => p.item.desc.match('3.5'))
            return polkiCount(conf) || !disks35.length
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
                const cacheCount = partCount(conf.parts, '-CH-')
                if (jbdCount > jbdMaxCount(conf)) {
                    list.push(`Количество выбранных полок (${jbdCount}) превышает допустимое (${jbdMaxCount(conf)})`)
                }
                if (![0, 4].includes(cacheCount)) {
                    list.push(`Количество дисков кэша (${cacheCount}) либо 0, либо 4`)
                }
                if (conf.platform.typeName === 'Гром' && !cacheCount) {
                    list.push(`Необходимо добавить NVMe диски для кэша`)
                }
                if (disksCount(conf) > disksMaxCount(conf)) {
                    list.push(`Количество выбранных дисков (${disksCount(conf)}) превышает максимальное (${disksMaxCount(conf)})`);
                }
                if(!disksCompat(conf)){
                    list.push(`Тип выбранных дисков невозможно установить в систему" - вот такую давай сделаем`);
                }

                return list;
            },
            partOptions: (conf: IConfig, tab: string) => {
                return ['JBD', '-EF-'].includes(tab) ? Array.from(Array(jbdMaxCount(conf) + 1).keys()) :
                    tab === '-CH-' ? [0, 4] :
                        Array.from(Array(11).keys())
            },
            platformItems: (conf: IConfig, tab: string) => {
                let filter = true

                return conf.platform.items.filter(i => {
                        if (polkiCount(conf) === 0 && tab === '-AR-') {
                            return i.article.match(tab) && !i.desc.match('3.5')
                        }
                        return i.article.match(tab)
                    }
                )
            }
        }
    }
})