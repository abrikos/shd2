<script setup lang="ts">
const {$listen} = useNuxtApp()
$listen('reload-spec', load)
const route = useRoute()
const spec = ref()

async function load(){
  spec.value = await useNuxtApp().$GET(`/spec/${route.params.id}`)
}
async function update(){
  await useNuxtApp().$PATCH(`/spec/${route.params.id}`, spec.value)
}
onMounted(load)
</script>

<template lang="pug">
div(v-if='spec')
  q-input(v-model="spec.name" @blur="update")
    template(v-slot:prepend)
      q-icon(name="mdi-pencil")
    template(v-slot:append)
      ExcelButton(:id="spec.id")
      q-btn(@click="navigateTo({path:'/platforms', query:{spec:spec.id}})" icon="mdi-plus" )
        q-tooltip Добавить конфигурацию
      spec-clone-button(:id="spec.id")
      spec-delete-button(:id="spec.id")

  div.text-h6 Конфигурации:
  table
    tbody
      tr
        th.text-left Название
        th.text-left Дата
      tr.cursor-pointer(v-for="conf in spec.configs" @click="navigateTo(`/config/${conf.id}`)")
        td {{ conf.name }}
        td {{ conf.date }}
        td
          conf-delete-button(:id="conf.id")
</template>

<style scoped>

</style>