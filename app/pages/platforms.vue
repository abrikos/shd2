<script setup lang="ts">
import type {IPlatform} from "~~/server/models/platform.model";
import type {IConfig} from "~~/server/models/config.model";
const {$priceFormat} = useNuxtApp()
const route = useRoute()
const platforms = ref<IPlatform[]>([])
async function load(){
  platforms.value = await useNuxtApp().$GET('/config/platforms') as IPlatform[];
}
onMounted(load)
async function create(platform:number){
  const config = await useNuxtApp().$POST('/config/create', {platform, spec:route.query.spec}) as IConfig;
  navigateTo(`/config/${config.id}`)
}
</script>

<template lang="pug">
table
  tbody
    tr(v-for="platform in platforms")
      td
        q-btn(@click="create(platform.id)") {{ platform.desc }}

      //td.text-right {{ $priceFormat(platform.price) }}
      //div(v-for="item in platform.includes") {{ item[0] }} - {{ item[1] }}

</template>

<style scoped>

</style>