<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const {loggedUser} = storeToRefs(useCustomStore())
const {id} = defineProps({
  id: {type: String, required: true},
})

async function download(confidential:number) {
  document.location.href = (`/api/excel/conf/${id}?confidential=${confidential}`)
}

</script>

<template lang="pug">
  q-btn(icon="mdi-microsoft-excel" @click.stop="download(0)" color="green" round)
    //a.q-btn(:href="`/api/spec/${spec}/excel?confidential=${confidential?1:0}`")
    //q-icon(name="mdi-microsoft-excel")
    q-tooltip {{'Выгрузить в Excel'}}

  q-btn(v-if="loggedUser.isAdmin" icon="mdi-microsoft-excel" @click.stop="download(1)" color="red" round)
    //a.q-btn(:href="`/api/spec/${spec}/excel?confidential=${confidential?1:0}`")
    //q-icon(name="mdi-microsoft-excel")
    q-tooltip {{'Выгрузить в Excel конфидециально'}}

</template>

<style scoped>

</style>