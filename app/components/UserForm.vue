<script setup lang="ts">
const user = defineModel<IUser>()
const {noValidations} = defineProps({noValidations:String})
const companies = ref()

async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, user.value)
}

const check = ref()

async function checkEmail() {
  check.value = await useNuxtApp().$GET(`/user/check-email/${user.value?.email}`)
}

</script>

<template lang="pug">
  q-input(v-model="user.email" label="E-mail" :rules="[$validateEmail, $validateRequired]" :disable="!!user.id")
  q-input(v-model="user.firstName" label="Фамилия" :rules="user.id ? [] : [$validateRequired]" hint="")
  q-input(v-model="user.lastName" label="Имя" :rules="user.id ? [] : [$validateRequired]" hint="")
  q-input(v-model="user.middleName" label="Отчество" :rules="user.id ? [] : [$validateRequired]" hint="")
  q-input(v-model="user.password" label="Пароль" :rules="user.id ? [] : [$validateRequired]" hint="" type="password")
  q-input(v-model="user.password1" label="Подтверждение пароля" :rules="user.password?[()=>user.password===user.password1||'Пароли не совпадают']:[]" hint="" type="password")

</template>

<style scoped>

</style>