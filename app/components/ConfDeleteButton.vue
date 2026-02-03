<script setup lang="ts">
const {id} = defineProps<{id: string}>()
const {$event} = useNuxtApp()
async function deleteConf() {
  await useNuxtApp().$DELETE(`/config/delete/${id}`)
  $event('reload-spec')
}

</script>

<template lang="pug">
  q-btn(icon="mdi-delete" color="red" @click.stop="deleteConf()")
</template>

<style scoped>

</style>