<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";
import type {IItem} from "~~/server/models/item.model";

const route = useRoute()
const platform = ref<IPlatform>()

async function load() {
  platform.value = await useNuxtApp().$GET(`/config/platform/${route.params.id}`) as IPlatform
}

onMounted(load)
const matches = [
  ['JBD', 'Дисковые полки'],
  ['-CH-', 'Для кэша'],
  ['-AR-', 'Для массива'],
  ['-AR6-', 'Пакеты дисков для массива'],
  ['-LCS-', 'Лицензии'],
]
function addParts(e:any,item:IItem) {
  console.log(e.target.value, item)
}
</script>

<template lang="pug">
  table(v-if="platform")
    tbody
      tr
        th(width="20%") Артикул
        th Описание
        th(width="10%") Количество
        th(width="20%") Цена
      tr.bg-grey-4
        td {{ platform.article }}
        td {{ platform.desc }}
        td 1
        td.text-right {{ platform.price.toFixed(2) }}

    tbody(v-for="match in matches")
      tr
        th(colspan="4") {{ match[1] }}
      tr(v-for="item in platform.items.filter(i=>i.article.match(match[0]))")
        td {{item.article}}
        td {{item.desc}}
        td
          input(@change="e=>addParts(e, item)" type="number" value="0")
        td.text-right {{item.price.toFixed(2) }}

    tbody
      tr
        th(colspan="4") Предустановленные опции
      tr(v-for="include in platform.includes")
        td
        td {{include[0]}}
        td {{include[1]}}
        td
</template>

<style scoped>

</style>