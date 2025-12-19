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

    function polkiCount(conf: IConfig) {
        return conf.parts.filter((p: IPart) => p.item.article.match(/-JBD-|-EF-/)).reduce((sum, part) => sum + part.count, 0);
    }

    function disksCount(conf: IConfig) {
        return conf.parts.filter((p: IPart) => p.item.type === 'ar').reduce((sum, part) => sum + part.count, 0);
    }

    function disksMaxCount(conf: IConfig) {
        const counts = {
            'NMB-DE-JBD-24S4U': 24,
            'NMB-DE-JBD-90S4U': 90,
            'NMB-DE-EF-24S2': 24
        }
        const noPolkaMax = conf.platform.typeName === 'Гром' ? 20 : 24
        let max = 0;
        const polki = conf.parts.filter((p: IPart) => Object.keys(counts).includes(p.item.article))

        for (const p of polki) {
            console.log('zzzzzzz', p)
            max += counts[p.item.article as keyof typeof counts] * p.count
        }
        return noPolkaMax + max
    }

    function disksCompat(conf: IConfig) {
        if (conf.platform.typeName === 'Молния') {
            return true
        } else {
            const disks35 = conf.parts.filter((p: IPart) => p.item.desc.match('3.5'))
            return polkiCount(conf) || !disks35.length
        }
    }

    return {
        provide: {
            polkiCount,
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
                if (disksCount(conf) > disksMaxCount(conf)) {
                    list.push(`Количество выбранных дисков (${disksCount(conf)}) превышает максимальное (${disksMaxCount(conf)})`);
                }
                if (!disksCompat(conf)) {
                    list.push(`Тип выбранных дисков невозможно установить в систему`);
                }

                return list;
            },
            partOptions: (conf: IConfig, tab: string) => {
                return ['de'].includes(tab) ? Array.from(Array(jbdMaxCount(conf) + 1).keys()) :
                    tab === 'ch' ? [0, 4] :
                        Array.from(Array(11).keys())
            },
        }
    }
})