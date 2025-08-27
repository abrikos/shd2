<script setup lang="ts">
import type {IConfig} from "~~/server/models/config.model";

const list = ref<IConfig[]>([])
async function load(){
  list.value = await useNuxtApp().$GET('/config/list') as IConfig[]
}
onMounted(load)
const columns = [
  {field: 'date', label: 'Дата'},
  {field: (p)=>p.platform.desc, label: 'Описание'},
  {field: 'price', label: 'Сумма'},
]
</script>

<template lang="pug">
q-table(:rows="list" :columns="columns" @row-click="(e,row)=>navigateTo(`/config/${row.id}`)")
</template>

<style scoped>

</style>