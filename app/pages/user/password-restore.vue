<script setup lang="ts">
const router = useRouter()
const email = ref('')
const result = ref()

async function submit() {
  result.value = await useNuxtApp().$POST(`/user/request-restore-password`, {email:email.value})
}
</script>

<template lang="pug">
q-card.q-pa-lg.fixed-center
  q-toolbar
    q-toolbar-title Восстановление пароля
  q-card-section(v-if="result") Если такой адрес зарегистрирован, то интсрукции по восстановлению пароля отправлены на него
  q-card-section(v-else)
    q-input(v-model="email" label="Email" )
    q-card-actions
      q-btn(@click="submit") Восстановить

</template>

<style scoped>

</style>
