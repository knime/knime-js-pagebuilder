<script>

const heightPollInterval = 200; // ms

/**
 * A single node view iframe
 */
export default {
    props: {
        nodeConfig: {
            default: () => ({}),
            type: Object
        },
        autoHeight: {
            type: Boolean,
            default: false
        },
        pollHeight: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            height: 0
        };
    },

    watch: {
        height(newHeight) {
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

            // TODO: configurable scrolling? AP-12266

            this.document.write(`<!doctype html><style>html{overflow-y:hidden;}body{display:inline-block;}</style>
              <pre>${JSON.stringify(this.nodeConfig, null, 2).replace(/</g, '&lt;')}</pre>`);
            /* TODO inject ressources AP-12648
             const jobId = this.$route.query.exec; // hack
             const head = doc.head;

             this.webNode.stylesheets.forEach(stylesheet => {
             const link = doc.createElement('link');
             link.setAttribute('type', 'style/css');
             link.href = `/${restApiURL}/${jobWebResources({ jobId, webResource: stylesheet })[0]}`;
             head.appendChild(link);
             });

             this.webNode.javascriptLibraries.forEach(lib => {
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
