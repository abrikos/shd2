<script setup lang="ts">
const {id} = defineProps<{id: string}>()
const {$event} = useNuxtApp()
function deleteSpec() {
  useNuxtApp().$DELETE(`/spec/${id}`)
  $event('reload-spec')
}

</script>

<template lang="pug">
  q-btn(icon="mdi-delete" color="red" @click.stop="deleteSpec()")
</template>

<style scoped>

</style>