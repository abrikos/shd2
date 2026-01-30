<script setup lang="ts">
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
  div.text-h6 Конфигурации:
  table
    tbody
      tr
        th Название
        th Дата
      tr.cursor-pointer(v-for="conf in spec.configs" @click="navigateTo(`/config/${conf.id}`)")
        td {{ conf.name }}
        td {{ conf.date }}
</template>

<style scoped>

</style>