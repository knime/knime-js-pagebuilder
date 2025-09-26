<script setup lang="ts">
import { computed } from "vue";

import { sanitization } from "@knime/utils";

type Props = {
  value: string;
};

const props = defineProps<Props>();
const sanitized = computed(() => sanitization.sanitizeHTML(props.value));
</script>

<template>
  <!-- eslint-disable vue/no-v-html  -->
  <div v-html="sanitized" />
</template>
