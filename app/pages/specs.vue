<script setup lang="ts">
const {$listen} = useNuxtApp()
$listen('reload-spec', load)

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
          th Shared
        tr.cursor-pointer(v-for="spec in specs" @click="navigateTo(`/spec/${spec.id}`)")
          td {{ spec.name }}
          td {{ spec.date }}
          td {{ spec.fromUser?.email }}
          td
            excel-button(:id="spec.id")
            spec-clone-button(:id="spec.id")
            spec-delete-button(:id="spec.id")

</template>

<style scoped>

</style>