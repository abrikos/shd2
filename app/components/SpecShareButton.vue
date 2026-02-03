<script setup lang="ts">
const {id} = defineProps<{id: string}>()
const emails = ref()
async function shareSpec() {
  if(!emails.value) return
  await useNuxtApp().$POST(`/spec/share/${id}`, emails.value.split(','))
}

</script>

<template lang="pug">
  q-btn(icon="mdi-share")
    q-tooltip Клонировать спецификацию
    q-popup-proxy
      q-input(type="textarea" v-model="emails" placeholder="Через запятую")
      q-btn(@click.stop="shareSpec()") Поделиться
</template>

<style scoped>

</style>