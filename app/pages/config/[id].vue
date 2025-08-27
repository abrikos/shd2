<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";
import type {IItem} from "~~/server/models/item.model";
import type {IConfig} from "~~/server/models/config.model";

const route = useRoute()
const config = ref<IConfig>()

async function load() {
  config.value = await useNuxtApp().$GET(`/config/${route.params.id}`) as IConfig
}

onMounted(load)
const matches = [
  ['JBD', 'Дисковые полки'],
  ['-CH-', 'Для кэша'],
  ['-AR-', 'Для массива'],
  ['-AR6-', 'Пакеты дисков для массива'],
  ['-LCS-', 'Лицензии'],
]

async function addParts(count: number, item: IItem) {
  await useNuxtApp().$POST(`/config/part/add/${route.params.id}`, {count, item})
  await load()
}

function partCount(item: IItem) {
  const exists = config.value?.parts.find(p => p.item.id === item.id)
  return exists ? exists.count : 0
}
const tab =ref('JBD')
const split =ref(30)
</script>

<template lang="pug">
div(v-if="config")
  div.row.items-center
    div.col-9.text-h6 {{ config.platform.desc }}
    div.col.text-h6.text-right {{ $priceFormat(config.price) }}
  div.row
    div.col-8
          //q-splitter(v-model="split" )
            template(v-slot:before)
          q-tabs(v-model="tab" dense no-caps indicator-color="primary" inline-label outside-arrows  mobile-arrows)
            q-tab(v-for="match in matches" :name="match[0]" :label="match[1]" )
            q-tab(name="pred" label="Предустановленные опции")
          //template(v-slot:after)
          q-tab-panels(v-model="tab" animated swipeable vertical )
            q-tab-panel(v-for="match in matches" :name="match[0]")
              table
                tbody
                  tr
                    th(width="20%") Артикул
                    th Описание
                    th(width="10%") Количество
                    th(width="20%") Цена
                  tr(v-for="item in config.platform.items.filter(i=>i.article.match(match[0]))" :class="partCount(item)?'bg-grey-4':''")
                    td {{item.article}}
                    td {{item.desc}}
                    td.text-right
                      input(@change="e=>addParts(e.target.value, item)" type="number" :value="partCount(item)")
                    td.text-right {{$priceFormat(item.price) }}
            q-tab-panel(name="pred")
              table
                tbody
                  tr(v-for="include in config.platform.includes")
                    td
                    td {{include[0]}}
                    td {{include[1]}}
                    td
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
            td {{ config.platform.article }}
            td
              span(v-if="config.platform.desc.length>30") {{config.platform.desc.substring(0,30)}}...
                q-icon.cursor-pointer(name="mdi-information-outline" )
                  q-popup-proxy
                    q-banner(style="width:400px") {{config.platform.desc}}
              span(v-else) {{config.platform.desc}}

            td 1
            td.text-right {{ $priceFormat(config.platform.price) }}
            td.text-right {{ $priceFormat(config.platform.price) }}
            td
          tr(v-for="part in config.parts")
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
              q-btn(icon="mdi-close" color="red" @click="addParts(0, part.item)")

          tr
            td.text-right(colspan="4") Итого
            td.text-right {{ $priceFormat(config.price) }}
</template>

<style scoped lang="sass">
table
  font-size: .8em
input
  width: 50px
  border: 1px solid silver
</style>