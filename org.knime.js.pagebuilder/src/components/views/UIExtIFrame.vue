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
        onMessageFromIFrame(message) {
            // TODO: AP-17633 Implement I-Frame support (with KnimeService)
            // let { contentWindow } = this.$refs.iframe;
            // if (message.source !== contentWindow) {
            //     return;
            // }

            // if (message.data.type === 'knime-ready') {
            //     contentWindow.postMessage({
            //         type: 'knime-init',
            //         data: {
            //             projectId: this.projectId,
            //             workflowId: this.workflowId,
            //             nodeId: this.nodeId,
            //             initData: this.initData
            //         }
            //     }, '*');
            // }
        }
    }
};
</script>

<template>
  <div>
    <iframe
      ref="iframe"
      :src="resourceLocation"
    />
  </div>
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
}
</style>
