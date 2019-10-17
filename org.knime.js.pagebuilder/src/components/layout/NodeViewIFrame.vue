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
            let styles = '';
            if (this.nodeConfig.stylesheets && this.nodeConfig.stylesheets.length) {
                styles = this.nodeConfig.stylesheets.map(
                    style => `<link type="text/css" rel="stylesheet" href="${resourceBaseUrl}${style}"></link>`
                ).join('');
            }
            // further styles needed for sizing
            styles += `<style>${this.innerStyle}</style>`;
            // custom CSS
            if (this.nodeConfig.customCSS && this.nodeConfig.customCSS.length) {
                styles += `<style>${this.nodeConfig.customCSS.replace(/<(\/style)\b/gi, '\\00003c$1')}</style>`;
            }

            // scripts
            let scriptLoader = `<script>
                window.knimeLoader = (function () {
                    var win = window;
                    var parent = win.parent;
                    var messageFromParent = function (event) {
                        if (event.origin !== window.origin || !event.data) {
                            return;
                        }
                        var data = event.data;
                        if (data.type === 'init') {
                            var namespace = data.namespace;
                            var initMethodName = data.initMethodName;
                            var viewRepresentation = data.viewRepresentation;
                            var viewValue = data.viewValue;
                            window[namespace][initMethodName](viewRepresentation, viewValue);
                        }
                    }
                    window.addEventListener('message', messageFromParent);
                    window.addEventListener('unload', function () {
                        win = null;
                        parent = null;
                    });
                    var origin = win.origin;
                    var namespace = ${JSON.stringify(this.nodeConfig.namespace)};
                    var nodeId = ${JSON.stringify(this.nodeId)};
                    var knimeLoaderCount = 
                        ${this.nodeConfig.javascriptLibraries ? this.nodeConfig.javascriptLibraries.length : 0};

                    return function knimeLoader(success) {
                        knimeLoaderCount--;
                        if (!success) {
                            parent.postMessage({ nodeId: nodeId, type: 'error' }, origin);
                            throw new Error('Script could not be loaded');
                        }
                        if (knimeLoaderCount === 0) {
                            var view = win[namespace];
                            if (!view) {
                                parent.postMessage({ nodeId: nodeId, type: 'error' }, origin);
                                throw new Error('no view found under namespace ' + namespace);
                            }
                            parent.postMessage({ nodeId: nodeId, type: 'load' }, origin);
                        }
                    };
                })();
            <\/script>`; // eslint-disable-line no-useless-escape

            let scripts = '';
            if (this.nodeConfig.javascriptLibraries && this.nodeConfig.javascriptLibraries.length) {
                scripts = this.nodeConfig.javascriptLibraries.map(
                    lib => `<script
                    src="${resourceBaseUrl}${lib}"
                    onload="knimeLoader(true)"
                    onerror="knimeLoader(false)">
                    <\/script>` // eslint-disable-line no-useless-escape
                ).join('');
            }

            this.document.write(`<!doctype html>
                <html>
                <meta charset="utf-8">
                <head>
                  ${styles}
                  ${scriptLoader}
                  <title></title>
                </head>
                <body></body>
                ${scripts}
                </html>`);

            this.document.close();
        },

        initHeightPolling() {
            consola.trace('Starting height polling');
            this.intervalId = setInterval(this.setHeight, heightPollInterval);
        },

        setHeight() {
            let { document } = this;
            if (!document || !document.body) {
                return;
            }
            let { defaultView } = document;
            let htmlStyle = defaultView.getComputedStyle(document.documentElement);
            let bodyStyle = defaultView.getComputedStyle(document.body);
            this.height = document.body.scrollHeight +
                parseInt(htmlStyle.paddingTop, 10) + parseInt(htmlStyle.paddingBottom, 10) +
                parseInt(bodyStyle.marginTop, 10) + parseInt(bodyStyle.marginBottom, 10);
        },

        messageFromIframe(event) {
            if (event.origin !== window.origin) {
                return;
            }
            if (!event.data || event.data.nodeId !== this.nodeId) {
                return;
            }
            if (event.data.type === 'load') {
                consola.debug(`View resource loading for ${this.nodeId} completed`);
                this.document.defaultView.postMessage({
                    namespace: this.nodeConfig.namespace,
                    initMethodName: this.nodeConfig.initMethodName,
                    viewRepresentation: this.nodeConfig.viewRepresentation,
                    viewValue: this.nodeConfig.viewValue,
                    type: 'init'
                }, window.origin);
            }
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
