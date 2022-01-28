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
  <div class="frame-container">
    <iframe
      ref="iframe"
      :src="resourceLocation"
      sandbox="allow-downloads allow-scripts"
    />
  </div>
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
  border: none;
}

div.frame-container {
  width: 100%;
  padding-top: 10px; /* provides default spacing between page content */
  min-height: 0;
  transition: min-height 0.4s ease-in 0.1s;
  height: calc(100vh - 10px);
}
</style>
