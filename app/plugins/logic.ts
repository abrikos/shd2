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