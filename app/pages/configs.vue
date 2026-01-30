<script setup lang="ts">
import type {IConfig} from "~~/server/models/config.model";
import type {QTableColumn} from 'quasar'

const {$priceFormat} = useNuxtApp()
const list = ref<IConfig[]>([])

async function load() {
  list.value = await useNuxtApp().$GET('/config/list') as IConfig[]
}

function deleteConf(id: number) {
  useNuxtApp().$DELETE(`/config/delete/${id}`)
  load()
}

onMounted(load)
const columns: QTableColumn[] = [
  {field: 'id', label: 'ID', name: 'id'},
  {field: 'date', label: 'Дата', name: 'data'},
  {field: 'name', label: 'Описание', name: 'name'},
  {field: (row) => row.spec?.name, label: 'Спецификация', name: 'spec'},
  {field: (row) => $priceFormat(row.priceTotalGpl), label: 'Сумма', name: 'price', style: 'text-align: right;'},
  {name: 'actions', field:'actions',label:''}
]
</script>

<template lang="pug">
  q-table(:rows="list" :columns="columns" @row-click="(e,row)=>navigateTo(`/config/${row.id}`)" :pagination="{rowsPerPage: 50}")
    template(v-slot:body-cell-actions="{row}")
      q-td
        ExcelButton(:id="row.id")
        q-btn(icon="mdi-delete" color="red" @click.stop="deleteConf(row.id)")
</template>

<style scoped>

</style>