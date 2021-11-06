<script>
import { IFrameKnimeServiceAdapter } from 'knime-ui-extension-service';

export default {
    props: {
        extensionConfig: {
            default: () => ({}),
            type: Object,
            validate(extensionConfig) {
                if (typeof extensionConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['nodeId', 'workflowId', 'projectId', 'info'];
                return requiredProperties.every(key => extensionConfig.hasOwnProperty(key));
            }
        }
    },
    computed: {
        resourceLocation() {
            // TODO: NXT-732 handle relative paths for webportal
            return this.extensionConfig?.resourceInfo?.url;
        }
    },
    mounted() {
        this.iframeAdapter = new IFrameKnimeServiceAdapter({
            childIframe: this.$refs.iframe.contentWindow,
            extensionConfig: this.extensionConfig
        });
    },
    beforeDestroy() {
        this.iframeAdapter.destroy();
    }
};
</script>

<template>
  <iframe
    ref="iframe"
    :src="resourceLocation"
    sandbox="allow-downloads allow-forms allow-scripts"
  />
</template>

<style lang="postcss" scoped>
iframe {
    width: 100%;
    height: 100%;
    min-height: 400px; /* TODO NXT-750 remove this when sizing by layout is supported */
}
</style>
