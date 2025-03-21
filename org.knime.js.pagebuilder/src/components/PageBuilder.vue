<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";

import Page from "@/components/layout/Page.vue";
import AlertGlobal from "@/components/ui/AlertGlobal.vue";
import "../assets/css/global-z-indices.css";

const pageKey = ref(0);
let unsubscribeOnChangeHandler: (() => void) | null = null;
let unsubscribeSetPageHandler: (() => void) | null = null;
const store = useStore();

const hasPage = ref(Boolean(store.state.pagebuilder.page?.wizardPageContent));
const isDialogLayout = ref(store.state.pagebuilder.isDialogLayout);
const isReporting = ref(store.state.pagebuilder.isReporting);

onMounted(() => {
  // This is a workaround as the reactivity system does not detect changes.
  // Most probably due to registering modules after the store is created.
  // see: https://github.com/vuejs/vuex/pull/2201
  unsubscribeSetPageHandler = store.subscribe((mutation) => {
    if (mutation.type === "pagebuilder/setPage") {
      hasPage.value = Boolean(store.state.pagebuilder.page?.wizardPageContent);
      isDialogLayout.value = store.state.pagebuilder.isDialogLayout;
      isReporting.value = store.state.pagebuilder.isReporting;
      pageKey.value++;
    }
  });

  unsubscribeOnChangeHandler = store.subscribeAction(async (action) => {
    if (action.type === "pagebuilder/updateWebNode") {
      const isDirty = await store.dispatch("pagebuilder/isDirty");
      await store.dispatch("api/onChange", {
        isDirty,
      });
    }
  });
});

watch(
  () => store.state.pagebuilder.page?.wizardPageContent,
  () => {
    hasPage.value = Boolean(store.state.pagebuilder.page?.wizardPageContent);
  },
);

onUnmounted(() => {
  if (unsubscribeOnChangeHandler !== null) {
    unsubscribeOnChangeHandler();
  }
  if (unsubscribeSetPageHandler !== null) {
    unsubscribeSetPageHandler();
  }
});
</script>

<template>
  <div>
    <Page v-if="hasPage" :key="pageKey" />
    <AlertGlobal v-if="!isDialogLayout && !isReporting" />
  </div>
</template>
