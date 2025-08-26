<script setup lang="ts">


import type {ILogAdmin} from "~/server/models/log.model";

const rows = ref<ILogAdmin[]>([])
const filter = ref()
async function load(){
  rows.value = await useNuxtApp().$GET('/admin/log') as ILogAdmin[]
}
onMounted(load)
const columns = [
  {label:'Date',field:'date'},
  {label:'Route',field:'route'},
  {label:'Params',field:'params'},
  {label:'Data',field:'data'},
  {label:'User',field:(row:ILogAdmin)=>row.user.email},
].map(c=>({...c, name:c.field}))
</script>

<template lang="pug">
  q-table(:rows="rows" :filter="filter" :columns="columns" :pagination="{rowsPerPage:20}")
    template(v-slot:body-cell-data="{row}")
      q-td
        q-btn(v-if="row.data" icon="mdi-eye" )
          q-popup-proxy {{row.data}}
</template>

<style scoped>

</style>