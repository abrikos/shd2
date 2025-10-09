<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";
import type {IItem} from "~~/server/models/item.model";
import type {IService} from "~~/server/models/service.model";

const route = useRoute()
const conf = ref<IConfig>()
const services = ref<IService[]>([])

async function load() {
  conf.value = await useNuxtApp().$GET(`/config/${route.params.id}`) as IConfig
  services.value = await useNuxtApp().$GET(`/config/services`) as IService[]
  if (!tab.value) {
    tab.value = conf.value?.platform.typeName === 'Молния' ? '-EF-' : 'JBD'
  }
}

onMounted(load)
const tabs = [
  {name: 'JBD', label: 'Полки'},
  {name: '-EF-', label: 'Полки'},
  {name: '-CH-', label: 'Кэш'},
  {name: '-AR-', label: 'Массив'},
  {name: '-AR6-', label: 'Пакеты дисков (6шт)'},
  {name: '-LCS-', label: 'Лицензии'},
  {name: 'srv', label: 'Сервисы'},
  //{name: 'pred', label: 'Предустановки'},
]

function getTabs() {
  const excluded = conf.value?.platform.typeName === 'Молния' ? ['JBD', '-CH-'] : ['-EF-']
  return tabs.filter((item) => !excluded.includes(item.name))
}

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
function tabParts(){
  return conf.value?.parts.filter(p => p.item.article.match(tab.value))
}
</script>

<template lang="pug">
  div(v-if="conf")
    div.row.items-center
      div.col-9.text-h6
        q-input(v-model="conf.name" @update:model-value="update")
      div.col
        ExcelButton(:id="conf.id")
      div.col.text-h6.text-right {{ $priceFormat(conf.priceTotal) }}
    div.row
      div.col-8
        q-tabs(v-model="tab" dense no-caps indicator-color="primary" inline-label outside-arrows  mobile-arrows)
          q-route-tab(v-for="match in getTabs()" :name="match.name" :label="match.label" :to="{query:{tab:match.name}}")


        //template(v-slot:after)
        q-tab-panels(v-model="tab" animated swipeable )
          q-tab-panel(v-for="match in getTabs()" :name="match.name")
            table(v-if="tab==='pred'")
              tbody
                tr(v-for="include in conf.platform.includes")
                  td {{include[0]}}
                  td {{include[1]}}
            div(v-else-if="tab==='srv'")
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
                  th(width="20%") Цена
                tr(v-for="item in $platformItems(conf, match.name)" :class="partCount(item)?'bg-grey-4':''")
                  td {{item.article}}
                  td {{item.desc}}
                  td.text-right
                    //input(v-if=" @change="e=>addParts(e.target.value, item)" type="number" :value="partCount(item)" :min="0" :max="$maxCount(conf,tab)")
                    span(v-if="['JBD','-EF-','-CH-'].includes(tab) && !partCount(item) && tabParts().reduce((sum,item)=>sum+item.count,0)") --

                    input(v-else-if="tab==='-LCS-'"
                      type="checkbox"
                      :checked="!!partCount(item)"
                      :Xdisabled="['NMB-LCS-BASE', 'NMB-LCS-DCTPKG'].includes(item.article)"
                      @change="e=>addParts(partCount(item)?0:1, item)"
                      :value="partCount(item)")
                    select(v-else-if="['JBD','-EF-','-CH-'].includes(tab)" @change="e=>addParts(e.target.value, item)" :value="partCount(item)")
                      option(v-for="val in $partOptions(conf,tab)" :value="val") {{val}}
                    input(v-else @change="e=>addParts(e.target.value, item)" type="number" :value="partCount(item)" :min="0")


                  td.text-right {{$priceFormat(item.price) }}
      div.col
        table
          tbody
            tr
              th(width="20%") Артикул
              th Описание
              th Кол-во
              th(width="20%") Цена
              th(width="20%") Стоимость
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
              td.text-right {{ $priceFormat(conf.platform.price) }}
              td.text-right {{ $priceFormat(conf.platform.price) }}
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
              td.text-right {{$priceFormat(part.item.price) }}
              td.text-right {{$priceFormat(part.price) }}
              td
                q-btn(v-if="!['NMB-LCS-BASE', 'NMB-LCS-DCTPKG'].includes(part.item.article)" icon="mdi-close" color="red" @click="addParts(0, part.item)")
            tr(v-if="conf.service")
              td {{conf.service.article}}
              td {{conf.service.desc}}
              td 1
              td.text-right {{$priceFormat(conf.priceService) }}
              td.text-right {{$priceFormat(conf.priceService) }}
              td
            tr(v-if="conf.nrDiskService")
              td NMB-SUP-NR-DRIVE
              td Невозврат неисправных накопителей
              td 1
              td.text-right {{$priceFormat(conf.priceNr) }}
              td.text-right {{$priceFormat(conf.priceNr) }}
              td
            tr(v-if="conf.startupService")
              td NMB-SUP-INST-START
              td Installation and Startup Service
              td 1
              td.text-right {{$priceFormat(conf.priceStartup) }}
              td.text-right {{$priceFormat(conf.priceStartup) }}
              td


            tr
              td.text-right(colspan="4") Итого
              td.text-right {{ $priceFormat(conf.priceTotal) }}
        q-banner.text-white.bg-red.q-my-sm(v-for="err in $configValidator(conf)" color="error" rounded) {{err}}
</template>

<style scoped lang="sass">
table
  font-size: .8em

input
  width: 50px
  border: 1px solid silver
</style>