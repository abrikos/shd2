<script setup lang="ts">
const {id} = defineProps<{id: string}>()
const {$event} = useNuxtApp()
async function cloneSpec() {
  await useNuxtApp().$GET(`/spec/clone/${id}`)
  $event('reload-spec')
}

</script>

<template lang="pug">
  q-btn(icon="mdi-content-duplicate" @click.stop="cloneSpec()")
    q-tooltip Клонировать спецификацию
</template>

<style scoped>

</style>