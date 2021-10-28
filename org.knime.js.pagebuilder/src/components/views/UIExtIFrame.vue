<script>
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
        window.addEventListener('message', this.onMessageFromIFrame);
    },
    beforeDestroy() {
        window.removeEventListener('message', this.onMessageFromIFrame);
    },
    methods: {
        onMessageFromIFrame(event) {
            let { contentWindow } = this.$refs.iframe;
            if (event.source !== contentWindow) {
                return;
            }

            if (event.data.type === 'knimeUIExtension:ready') {
                contentWindow.postMessage({
                    type: 'knimeUIExtension:init',
                    extensionConfig: this.extensionConfig
                }, '*'); // TODO security
            } else if (event.data.type === 'knimeUIExtension:jsonrpcRequest') {
                const { request } = event.data;
                const response = window.jsonrpc(request); // TODO this won't work in WebPortal
                contentWindow.postMessage({
                    type: 'knimeUIExtension:jsonrpcResponse',
                    response
                }, '*'); // TODO security
            }
        }
    }
};
</script>

<template>
  <iframe
    ref="iframe"
    :src="resourceLocation"
  />
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
  min-height: 400px; /* TODO NXT-750 remove this when sizing by layout is supported */
}
</style>
