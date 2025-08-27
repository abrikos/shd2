<script setup lang="ts">
import type {IConfig} from "~~/server/models/config.model";
import type { QTableColumn } from 'quasar'
const {$priceFormat} = useNuxtApp()
const list = ref<IConfig[]>([])
async function load(){
  list.value = await useNuxtApp().$GET('/config/list') as IConfig[]
}
onMounted(load)
const columns : QTableColumn[] = [
  {field: 'date', label: 'Дата', name:'data'},
  {field: (row)=>row.platform.desc, label: 'Описание', name:'desc'},
  {field: (row)=>$priceFormat(row.price), label: 'Сумма', name: 'price', style: 'text-align: right;'},
]
</script>

<template lang="pug">
q-table(:rows="list" :columns="columns" @row-click="(e,row)=>navigateTo(`/config/${row.id}`)")
</template>

<style scoped>

</style>