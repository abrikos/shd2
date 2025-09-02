import type {IPart} from "~~/server/models/part.model";

export default defineNuxtPlugin(() => {
    function partCount(parts: IPart[], tab: string) {
        return parts.filter((p: IPart) => p.item.article.match(tab)).reduce((sum, part) => sum + part.count, 0);
    }
    function jbdMaxCount(conf: IConfig) {
        const match = conf.name.match(/"(.+)" (\d+)/);
        if (!match) return 0;
        if (match[2] === '210') {
            return 1
        }
        if (match[2] === '220') {
            return 2
        }
        if (match[2] === '230') {
            return match[1] === 'Гром' ? 4 : 3
        }
        return -1
    }

    return {
        provide: {
            jbdMaxCount,
            cacheSet: (conf: IConfig) => {
                return  partCount(conf.parts, '-CH-') === 4
            },
            configValidator: (conf: IConfig)=> {
                const list = []
                const jbdCount = partCount(conf.parts, 'JBD') || partCount(conf.parts, '-EF-')
                const cacheCount = partCount(conf.parts, '-CH-')
                if (jbdCount > jbdMaxCount(conf)) {
                    list.push(`Количество выбранных полок (${jbdCount}) превышает допустимое (${conf.jbdMaxCount})`)
                }
                if (![0,4].includes(cacheCount)) {
                    list.push(`Количество дисков кэша (${cacheCount}) либо 0, либо 4`)
                }
                return list;
            },
            partOptions: (conf: IConfig, tab:string) => {
                return ['JBD','-EF-'].includes(tab) ? Array.from(Array(jbdMaxCount(conf)+1).keys())  :
                    tab === '-CH-' ? [0,4] :
                        Array.from(Array(11).keys())
            }
        }
    }
})