<script setup lang="ts">
const user = defineModel()
const roles = ['admin','user']
const types = ['Сотрудник','Дистрибутор', 'Партнер', 'Заказчик']
</script>

<template lang="pug">
      q-select(v-model="user.role" :options="roles" label="Роль" :rules="[$validateRequired]" )
      div.hidden {{user.roles}}
      //q-option-group(:options="roles" v-model="user.role" :rules="[$validateRequired]")
</template>

<style scoped>

</style>