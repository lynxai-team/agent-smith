<template>
  <the-header :lib-title="libTitle" :links="links"></the-header>
  <div id="main" class="absolute p-5 pb-16 md:w-[calc(100%_-_20rem)] top-16 md:left-80 main-h flex flex-col">
    <div id="router" class="flex-grow">
      <router-view></router-view>
    </div>
    <div id="footer" class="mt-8 text-right text-sm txt-semilight mr-8">
      Documentation made with <a href="https://github.com/synw/docdundee">Docdundee</a>
    </div>
  </div>
  <the-sidebar class="fixed left-0 hidden p-3 overflow-y-auto w-80 top-16 md:block secondary main-h"></the-sidebar>
  <Toast />
  <ConfirmDialog>
    <template #message="slotProps">
      <div class="flex flex-row items-center p-4">
        <div class="pl-2">{{ slotProps.message.message }}</div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import TheHeader from "./components/TheHeader.vue";
import TheSidebar from "./components/TheSidebar.vue";
import { libTitle, links } from "@/conf.js";
import { initState } from "./state.js";
import { useRouter } from "vue-router";
import { initNotifyService } from "./services/notify.js";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";

const router = useRouter();

function openLink(url: string) {
  if (url.startsWith("http")) {
    window.open(url, '_blank');
  } else {
    router.push(url)
  }
}

// global helper for markdown links
// use these links format in markdown files:
// <a href="javascript:openLink('/category/name')">My link</a>
window["openLink"] = openLink;

onBeforeMount(() => {
  initNotifyService();
  initState();
});
</script>

<style lang="sass">
a, a:visited, a:active
  text-decoration: underline !important
.dark
  .prose
    @apply text-neutral-200
    & h1, h2, h3, h4, h5, a
      @apply text-neutral-400
.static-code, #router, #footer
  @apply max-w-screen-lg
.main-h
  height: calc(100vh - 4rem)
  @apply overflow-y-auto
.p-inputtext
  @apply background bord-lighter
.pystatus .ficon
  font-size: 1.8rem !important
</style>
