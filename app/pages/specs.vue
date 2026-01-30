<script setup lang="ts">

const specs = ref()
async function load(){
  specs.value = await useNuxtApp().$GET(`/spec/list/user`)
}
onMounted(load)
</script>

<template lang="pug">
  div(v-if='specs')
    table
      tbody
        tr
          th Название
          th Дата
        tr.cursor-pointer(v-for="spec in specs" @click="navigateTo(`/spec/${spec.id}`)")
          td {{ spec.name }}
          td {{ spec.date }}
</template>

<style scoped>

</style>