<script>

const heightPollInterval = 200; // ms

/**
 * A single node view iframe
 */
export default {
    props: {
        /**
         * Node configuration as received by API
         */
        nodeConfig: {
            default: () => ({}),
            type: Object
        },
        /**
         * Set height automatically depending on content?
         */
        autoHeight: {
            type: Boolean,
            default: false
        },
        /**
         * Update height automatically when content size changes?
         */
        pollHeight: {
            type: Boolean,
            default: false
        },
        /**
         * Render inner scrollbars?
         */
        scrolling: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            height: 0
        };
    },

    computed: {
        innerStyle() {
            // prevent margin collapsation of body’s children, which causes incorrect height detection
            let style = 'body { display: inline-block; }';
            if (this.scrolling) {
                if (this.pollHeight) {
                    // in case of auto height, a vertical scrollbar can interfere with the height calculation (in
                    // combination with a horizontal scrollbar)
                    style += 'html { overflow-y: hidden; }';
                }
            } else {
                style += 'html { overflow: hidden; }';
            }
            return style;
        }
    },

    watch: {
        height(newHeight) {
            /**
             * Fired when the iframe detects that its content’s height size has changed.
             * Requires the `pollHeight` prop to be set to `true`.
             *
             * @event heightChange
             * @type {number}
             */
            this.$emit('heightChange', newHeight);
        }
    },

    mounted() {
        this.document = this.$el.contentDocument;
        this.injectContent();
        if (this.autoHeight) { // TODO: defer until after init() AP-12648
            if (this.pollHeight) {
                this.initHeightPolling();
            } else {
                this.setHeight();
            }
        }
    },

    beforeDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    },

    methods: {
        injectContent() {

            this.document.write(`<!doctype html><style>${this.innerStyle}</style>` +

              `<pre>${JSON.stringify(this.nodeConfig, null, 2).replace(/</g, '&lt;')}</pre>`);
            /* TODO inject ressources AP-12648
             this.nodeConfig.stylesheets.forEach(stylesheet => {
             const link = doc.createElement('link');
             link.setAttribute('type', 'style/css');
             link.href = `/${restApiURL}/${jobWebResources({ jobId, webResource: stylesheet })[0]}`;
             head.appendChild(link);
             });

             this.nodeConfig.javascriptLibraries.forEach(lib => {
             // TODO: ensure order of execution AP-12648
             const script = doc.createElement('script');
             script.src = `/${restApiURL}/${jobWebResources({ jobId, webResource: lib })[0]}`;
             head.appendChild(script);
             });
             */
        },

        initHeightPolling() {
            consola.trace('Starting height polling');
            this.intervalId = setInterval(this.setHeight, heightPollInterval);
        },

        setHeight() {
            let { document } = this;
            let { defaultView } = document;
            let htmlStyle = defaultView.getComputedStyle(document.documentElement);
            let bodyStyle = defaultView.getComputedStyle(document.body);
            this.height = document.body.scrollHeight +
                parseInt(htmlStyle.paddingTop, 10) + parseInt(htmlStyle.paddingBottom, 10) +
                parseInt(bodyStyle.marginTop, 10) + parseInt(bodyStyle.marginBottom, 10);
        }
    }
};
</script>

<template>
  <iframe />
</template>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 100%;
  background-color: white;
  border: none;
}
</style>
