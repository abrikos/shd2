<script setup lang="ts">
const $q = useQuasar()
const services = ref<IService[]>([])
const {$listen} = useNuxtApp()

async function load() {
  services.value = await useNuxtApp().$GET('/config/services') as IService[];
}

$listen('load-services', load)
onMounted(load)
const columns = [
  {field: 'article', label: 'Article'},
  {field: 'desc', label: 'Описание'},
  {field: 'percent', label: 'Процент'},
  {field: 'controls', label: ''},
].map(item => ({...item, name: item.field}))

async function update(row: IService) {
  await useNuxtApp().$POST('/admin/services-update', row)
  await load()
}

const service = ref({})
const addDialog = ref(false)

async function add() {
  await useNuxtApp().$POST('/admin/services-add', service.value)
  await load()
}

const levels = ['ADV', 'PRE', 'BAS']
</script>

<template lang="pug">
  q-toolbar
    q-toolbar-title Список сервисов тех-поддержки
    q-btn(icon="mdi-plus" @click="addDialog=true")
      q-tooltip Добавить сервис
    q-dialog(v-model="addDialog")
      q-card
        q-form(@submit.prevent="add")
          q-toolbar
            q-toolbar-title Добавить сервис
          q-card-section
            q-input(v-model="service.name" label="Описание" :rules="[$validateRequired]")
            q-select(v-model="service.level" label="Уровень" :options="levels" :rules="[$validateRequired]")
            q-input(v-model="service.coefficient" label="Коэффициент" type="number" :min="0" :max="1" :step="0.05" :rules="[$validateRequired]")
            //q-input(v-model="service.period" label="Период"  type="number" :min="3" :max="5" :rules="[$validateRequired]")
          q-card-actions
            q-btn(type="submit" label="Сохранить" color="primary" )
            q-btn(label="Отмена" @click="service={};addDialog=false" )
  q-table(:rows="services" :columns="columns" :pagination="{rowsNumber:100, rowsPerPage:100}" )
    template(v-slot:body="{row}")
      tr
        td
          q-input(v-model="row.article")
        td
          q-input(v-model="row.desc" )
        td
          q-input(v-model="row.percent" type="number" step="any" )
        td
          q-btn(@click="update(row)" color="primary" ) Save


</template>

<style scoped>

</style>