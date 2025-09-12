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

    function polkiCount(conf:IConfig) {
        return conf.parts.filter((p: IPart) => ['-JBD-','-EF-'].includes(p.item.article)).reduce((sum, part) => sum + part.count, 0);
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
                    list.push(`Количество выбранных полок (${jbdCount}) превышает допустимое (${jbdMaxCount(conf)})`)
                }
                if (![0,4].includes(cacheCount)) {
                    list.push(`Количество дисков кэша (${cacheCount}) либо 0, либо 4`)
                }
                if(conf.platform.typeName === 'Гром' && !cacheCount) {
                    list.push(`Необходимо добавить NVMe диски для кэша`)
                }
                return list;
            },
            partOptions: (conf: IConfig, tab:string) => {
                return ['JBD','-EF-'].includes(tab) ? Array.from(Array(jbdMaxCount(conf)+1).keys())  :
                    tab === '-CH-' ? [0,4] :
                        Array.from(Array(11).keys())
            },
            platformItems: (conf: IConfig, tab: string) => {
                let filter = true

                return conf.platform.items.filter(i => {
                        if (polkiCount(conf) === 0 && tab==='-AR-') {
                            return i.article.match(tab) && !i.desc.match('3.5')
                        }
                        return i.article.match(tab)
                    }
                )
            }
        }
    }
})