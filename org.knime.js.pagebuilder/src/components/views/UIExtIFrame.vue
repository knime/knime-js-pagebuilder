<script>
import { IFrameKnimeServiceAdapter } from 'knime-ui-extension-service';

export default {
    props: {
        knimeService: {
            default: null,
            type: IFrameKnimeServiceAdapter,
            required: true
        }
    },
    computed: {
        resourceLocation() {
            // TODO: NXT-732 handle relative paths for webportal
            return this.knimeService.extensionConfig?.resourceInfo?.url;
        }
    },
    mounted() {
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
    sandbox="allow-downloads allow-scripts"
  />
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
  min-height: 400px; /* TODO NXT-750 remove this when sizing by layout is supported */
}
</style>
