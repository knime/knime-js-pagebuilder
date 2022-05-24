<script>
export default {
    inject: ['getKnimeService'],
    props: {
        resourceLocation: {
            default: null,
            type: String,
            required: true
        }
    },
    computed: {
        knimeService() {
            return this.getKnimeService();
        }
    },
    mounted() {
        this.knimeService.updateEventListener();
        this.knimeService.setIFrameWindow(this.$refs.iframe.contentWindow);
    },
    beforeDestroy() {
        this.knimeService.destroy();
    }
};
</script>

<template>
  <iframe
    ref="iframe"
    :src="resourceLocation"
    sandbox="allow-downloads allow-scripts allow-same-origin"
  />
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
  min-height: 400px; /* TODO NXT-750 remove this when sizing by layout is supported */
  border: none;
}
</style>
