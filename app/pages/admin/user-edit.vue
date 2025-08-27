<script setup lang="ts">
import RoleForm from "~/components/RoleForm.vue";
import UserForm from "~/components/UserForm.vue";

const route = useRoute()
onMounted(load)
const user = ref()

async function load() {
  user.value = await useNuxtApp().$GET(`/admin/user/${route.query.id}`)
}

async function submit() {
  const res = await useNuxtApp().$POST(`/admin/user/update/${user.value.id}`, user.value)
}

</script>

<template lang="pug">
  q-form(v-if="user" ref="form" @submit="submit")
    q-card.fixed-center
      q-toolbar
        q-toolbar-title Редактирование пользователя

      q-card-section
          UserForm(v-model="user")
          q-select(v-model="user.role" :options="['admin','user']" label="Роль" :rules="[$validateRequired]" )
          q-toggle(v-model="user.blocked" label="Заблокирован" )

      q-card-actions
        q-card-section.flex.justify-between
          q-btn(type="submit" label="Сохранить" color="primary" )
</template>

<style scoped>

</style>