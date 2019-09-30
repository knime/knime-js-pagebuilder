<script>

const heightPollInterval = 200; // ms

/**
 * A single node view iframe
 */
export default {
    props: {
        /**
         * Node id
         */
        nodeId: {
            default: () => null,
            type: String
        },
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
        window.addEventListener('message', this.messageFromIframe);

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
        window.removeEventListener('message', this.messageFromIframe);

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    },

    methods: {
        injectContent() {
            const resourceBaseUrl = this.$store.state.pagebuilder.resourceBaseUrl;

            // stylesheets
            let styles = this.nodeConfig.stylesheets.map(
                stylesheet => `<link type="style/css" href="${resourceBaseUrl}${stylesheet}">`
            ).join('');
            // further styles needed for sizing
            styles += `<style>${this.innerStyle}</style>`;
            // custom CSS
            if (this.nodeConfig.customCSS && this.nodeConfig.customCSS.length) {
                styles += `<style>${this.nodeConfig.customCSS}</style>`;
            }
            

            // scripts
            let scriptLoader = `<script>
                window.knimeLoader = function () {
                    var win = window;
                    var parent = win.parent;
                    window.addEventListener('unload', function () {
                        win = null;
                        parent = null;
                    });
                    var origin = win.origin;
                    var namespace = '${this.nodeConfig.namespace}';
                    var nodeId = '${this.nodeId}';
                    var viewRepresentation = ${JSON.stringify(this.nodeConfig.viewRepresentation)};
                    var viewValue = ${JSON.stringify(this.nodeConfig.viewValue)};
                    var initMethodName = '${this.nodeConfig.initMethodName}';

                    var knimeLoaderCount = ${this.nodeConfig.javascriptLibraries.length};
                    return function knimeLoader() {
                        knimeLoaderCount--;
                        console.log(nodeId, knimeLoaderCount);
                        if (knimeLoaderCount === 0) {
                            var view = win[namespace];
                            if (!view) {
                                throw new Error('no view found under namespace ' + namespace);
                            }
                            parent.postMessage({nodeId: nodeId, type: 'load'}, origin);
                            
                            //debugger;
                            view[initMethodName](viewRepresentation, viewValue);
                        }
                    };
                }();
            <\/script>`; // eslint-disable-line no-useless-escape
            let scripts = this.nodeConfig.javascriptLibraries.map(
                // eslint-disable-next-line no-useless-escape
                lib => `<script src="${resourceBaseUrl}${lib}" onload="knimeLoader()"><\/script>`
            ).join('');

            this.document.write(`<!doctype html><head>${styles}${scriptLoader}${scripts}</head><body></body>`);// +
            // `<pre>${JSON.stringify(this.nodeConfig, null, 2).replace(/</g, '&lt;')}</pre></body>`);


            /*
            const head = this.document.head;
            this.nodeConfig.stylesheets.forEach(stylesheet => {
                const script = this.document.createElement('link');
                script.setAttribute('type', 'style/css');
                script.href = `${resourceBaseUrl}${stylesheet}`;
                head.appendChild(script);
            });
            */

                
            /* TODO inject ressources AP-12648
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
        },

        messageFromIframe(event) {
            debugger;
            if (event.origin !== window.origin) {
                return;
            }
            if (!event.data || event.data.nodeId !== this.nodeId) {
                // start resize
            }
            
            // this.initView();
        }

        /*
        initView() {
            this.$el.contentWindow.postMessage({
                type: 'init',
                viewValue: this.nodeConfig.viewValue,
                viewRepresentation: this.nodeConfig.viewRepresentation
            });
        }
        */
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
