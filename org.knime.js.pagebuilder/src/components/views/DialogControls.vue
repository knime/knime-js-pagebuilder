<script setup lang="ts">
import Button from "webapps-common/ui/components/Button.vue";

defineProps<{ isMetaKeyPressed: boolean; isWriteProtected?: boolean }>();
const emit = defineEmits(["cancel", "ok"]);
</script>

<template>
  <div class="controls">
    <Button with-border compact @click="() => emit('cancel')"> Cancel </Button>
    <Button
      primary
      compact
      :disabled="isWriteProtected"
      @click.prevent="() => emit('ok')"
    >
      {{ isMetaKeyPressed ? "Ok and Execute" : "Ok" }}
    </Button>
  </div>
</template>

<style scoped lang="postcss">
.controls {
  display: flex;
  justify-content: space-between;
  height: var(--controls-height);
  padding: 14px 20px;
  background-color: var(--knime-gray-ultra-light);
  border-top: 1px solid var(--knime-silver-sand);
}
</style>
