<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";
import type {IItem} from "~~/server/models/item.model";
import type {IService} from "~~/server/models/service.model";

const route = useRoute()
const conf = ref<IConfig>()
const items = ref<IItem[]>([])
const services = ref<IService[]>([])

async function load() {
  conf.value = await useNuxtApp().$GET(`/config/${route.params.id}`) as IConfig
  items.value = await useNuxtApp().$GET(`/config/items`) as IItem[]
  services.value = await useNuxtApp().$GET(`/config/services`) as IService[]
  if (!tab.value) {
    tab.value = 'de'
  }
}

onMounted(load)
const tabs2 = [
  {name: 'de', label: 'Полки', match: '-DE-'},
  {name: 'ch', label: 'Кэш', match: '-NV'},
  {name: 'ar', label: 'Массив', match: '-AR-HD'},
  {name: 'lcs', label: 'Лицензии', match: '-LCS'},
  {name: 'srv', label: 'Сервисы'},
  //{name: 'pred', label: 'Предустановки'},
]

const tabs = computed(() => {
  const t = {
    de: {label: 'Полки', match: '-DE-', name: 'de'},
    ch: {label: 'Кэш', match: '-NV', name: 'ch'},
    ar: {label: 'Массив', match: '-AR-HD', name: 'ar'},
    lcs: {label: 'Лицензии', match: '-LCS', name: 'lcs'},
    srv: {label: 'Сервисы', name: 'srv'},
  }
  if(conf.value?.platform.typeName === 'Молния'){
    delete t.ch
  }
  return t
})

async function addParts(count: number, item: IItem) {
  await useNuxtApp().$POST(`/config/part/add/${route.params.id}`, {count, item})
  await load()
}

function partCount(item: IItem) {
  const exists = conf.value?.parts.find(p => p.item.id === item.id)
  //if('NMB-LCS-ENTPKG' === item.article) console.log(item.article, exists?.count, exists?.item)
  return exists ? exists.count : 0
}


const tab = ref()
const split = ref(30)

async function update(type: string) {
  if (!conf.value) return
  if (type === 'service') {
    conf.value = await useNuxtApp().$PUT(`/config/update`, {
      _id: conf.value.id,
      service: conf.value.service.id
    }) as IConfig
  } else {
    conf.value = await useNuxtApp().$PUT(`/config/update`, conf.value) as IConfig
  }
  //await load()
}

const editName = ref(true)

const itemsFiltered = computed(() => {
  return items.value
      // items for selected tab Гром cache (ch) = Молния massive (ar)
      .filter((i: any) => conf.value?.platform.typeName === 'Гром' ? i.type === tab.value : tab.value === 'ar' ? i.type==='ch' : i.type === tab.value)
      //items for platform type
      .filter((i: any) => i.platforms.filter((v: any) => !!v).filter((v: any) => conf.value?.platform.platforms.includes(v)).length)
      // items for platform model
      .filter((i: any) => i.models.includes(conf.value?.platform.modelName))

})

function tabParts(){
  return conf.value?.parts.filter(p => p.item.type === (tab.value))
}

async function addToSpec(){
  await useNuxtApp().$GET(`/spec/create/${conf.value?.id}`)
  await load()
}

</script>

<template lang="pug">
  div(v-if="conf")
    div.row
      div.col-6
        div.row.items-center
          div.col-8
            q-input(v-model="conf.name" @update:model-value="update")
          div.col.text-right
            ExcelButton(:id="conf.id")
            //span.text-h6 {{ $priceFormat(conf.priceTotalGpl) }}


        //q-banner {{conf.platform.desc}}
        q-tabs(v-model="tab" dense no-caps indicator-color="primary" inline-label outside-arrows  mobile-arrows)
          q-route-tab(v-for="t in Object.keys(tabs)" :name="t" :label="tabs[t].label" :to="{query:{tab:t}}")

        q-tab-panels(v-model="tab" animated swipeable )
          q-tab-panel(v-for="t in tabs" :name="t.name")
            div(v-if="tab==='srv'")
              q-option-group(v-if="conf.service" :options="services.map((s:IService)=>({label:s.desc,value:s.id}))" type="radio" v-model="conf.service.id" @update:model-value="update('service')")
              q-checkbox(v-model="conf.nrDiskService" label="Невозврат неисправных накопителей" @update:model-value="update")
              q-checkbox(v-model="conf.startupService" label="Installation and Startup Service" @update:model-value="update")
            table(v-else)
              tbody
                tr
                  th(width="20%") Артикул
                  th Описание
                  th(width="10%") Количество &nbsp;
                    span(v-if="['JBD','-EF-'].includes(tab)") (макс {{$jbdMaxCount(conf)}} шт)
                  //th(width="20%") Цена
                tr(v-for="item in itemsFiltered" :class="partCount(item)?'bg-grey-4':''")
                  td {{item.article}}
                  td {{item.desc}}
                  td.text-right
                    //input(v-if=" @change="e=>addParts(e.target.value, item)" type="number" :value="partCount(item)" :min="0" :max="$maxCount(conf,tab)")
                    span(v-if="['de','ch'].includes(tab) && !partCount(item) && tabParts().reduce((sum,item)=>sum+item.count,0)") --

                    input(v-else-if="tab==='lcs'"
                      type="radio"
                      :checked="!!partCount(item)"
                      @change="e=>addParts(partCount(item)?0:1, item)"
                      :value="partCount(item)")
                    select(v-else-if="['de','ch'].includes(tab)" @change="e=>addParts(e.target.value, item)" :value="partCount(item)")
                      option(v-for="val in $partOptions(conf,tab)" :value="val") {{val}}
                    input(v-else @change="e=>addParts(e.target.value, item)" type="number" :value="partCount(item)" :min="0")


                  //td.text-right {{$priceFormat(item.price) }}
      div.col
        div
          q-btn(color="primary" @click="addToSpec" v-if="!conf.spec" ) Добавить в спецификацию
          router-link(:to="`/spec/${conf.spec.id}`") {{conf.spec.name}}
        table
          tbody
            tr
              th(width="20%") Артикул
              th Описание
              th Кол-во
              //th(width="20%") Цена
              //th(width="20%") Стоимость
              th
            tr
              td {{ conf.platform.article }}
              td
                span(v-if="conf.platform.desc.length>30") {{conf.platform.desc.substring(0,30)}}...
                  q-icon.cursor-pointer(name="mdi-information-outline" )
                    q-popup-proxy
                      q-banner(style="width:400px") {{conf.platform.desc}}
                span(v-else) {{conf.platform.desc}}

              td 1
              //td.text-right {{ $priceFormat(conf.platform.price) }}
              //td.text-right {{ $priceFormat(conf.platform.price) }}
              td
            tr(v-for="part in conf.parts")
              td {{part.item.article}}
              td
                span(v-if="part.item.desc.length>30") {{part.item.desc.substring(0,30)}}...
                  q-icon.cursor-pointer(name="mdi-information-outline" )
                    q-popup-proxy
                      q-banner(style="width:400px") {{part.item.desc}}
                span(v-else) {{part.item.desc}}
              td {{part.count}}
              //td.text-right {{$priceFormat(part.item.price) }}
              //td.text-right {{$priceFormat(part.price) }}
              td
                q-btn(v-if="!part.item.article.match('-LCS-')" icon="mdi-close" color="red" @click="addParts(0, part.item)")
            tr(v-if="conf.service")
              td {{conf.service.article}}
              td {{conf.service.desc}}
              td 1
              //td.text-right {{$priceFormat(conf.priceService) }}
              //td.text-right {{$priceFormat(conf.priceService) }}
              td
            tr(v-if="conf.nrDiskService")
              td NMB-SUP-NR-DRIVE
              td Невозврат неисправных накопителей
              td 1
              //td.text-right {{$priceFormat(conf.priceNr) }}
              //td.text-right {{$priceFormat(conf.priceNr) }}
              td
            tr(v-if="conf.startupService")
              td NMB-SUP-INST-START
              td Installation and Startup Service
              td 1
              //td.text-right {{$priceFormat(conf.priceStartup) }}
              //td.text-right {{$priceFormat(conf.priceStartup) }}
              td


            //tr
              td.text-right(colspan="4") Disks DDP
              td.text-right {{ $priceFormat(conf.priceDiscs) }}
            //tr
              td.text-right(colspan="4") Hardware total DDP
              td.text-right {{ $priceFormat(conf.priceHardware) }}
            //tr
              td.text-right(colspan="4") License GPL
              td.text-right {{ $priceFormat(conf.priceLicense) }}

            //tr
              td.text-right(colspan="4") Итого
              td.text-right {{ $priceFormat(conf.priceTotal) }}
            //tr
              td.text-right(colspan="4") Итого
              td.text-right {{ $priceFormat(conf.priceTotalGpl) }}



        q-banner#full-info.bg-grey-4 {{conf.description}}
        q-banner.text-white.bg-red.q-my-sm(v-for="err in $configValidator(conf)" color="error" rounded) {{err}}
</template>

<style scoped lang="sass">
#full-info
  white-space: pre-wrap

table
  font-size: .8em

input
  width: 50px
  border: 1px solid silver
</style>