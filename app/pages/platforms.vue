<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";

const platforms = ref<IPlatform[]>([])
async function load(){
  platforms.value = await useNuxtApp().$GET('/config/platforms') as IPlatform[];
}
onMounted(load)
const includes = computed(()=>[])
</script>

<template lang="pug">
div
  div(v-for="platform in platforms")
    router-link(:to="`/platform-${platform.id}`") {{ platform.article }} -  {{ platform.desc }} - {{ platform.price }}
    //div(v-for="item in platform.includes") {{ item[0] }} - {{ item[1] }}

</template>

<style scoped>

</style>