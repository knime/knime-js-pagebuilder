<script>
import scriptLoaderSrc from 'raw-loader!./injectedScripts/scriptLoader.js';
import messageListenerSrc from 'raw-loader!./injectedScripts/messageListener.js';

const heightPollInterval = 200; // ms
const valueGetterTimeout = 10000; // ms

/**
 * A single node view iframe
 */
export default {
    props: {
        /**
         * Node id
         */
        nodeId: {
            default: null,
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
        nodeJsLibs() {
            return this.nodeConfig.javascriptLibraries || [];
        },
        nodeStylesheets() {
            return this.nodeConfig.stylesheets || [];
        },
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
        this.$store.dispatch('pagebuilder/addValueGetter', { nodeId: this.nodeId, valueGetter: this.getValue });
    },

    beforeDestroy() {
        window.removeEventListener('message', this.messageFromIframe);
        this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    },

    methods: {
        /**
         * Inject all the scripts and stylesheet associated with the node, as well as additional scripts that we use
         * for cross-frame communication
         * @return {undefined}
         */
        injectContent() {
            const resourceBaseUrl = this.$store.state.pagebuilder.resourceBaseUrl;

            // stylesheets from the node view itself
            let styles = this.nodeStylesheets.map(
                style => `<link type="text/css" rel="stylesheet" href="${resourceBaseUrl}${encodeURI(style)}">`
            ).join('');

            // furthernode styles needed for sizing
            styles += `<style>${this.innerStyle}</style>`;

            // custom CSS from node configuration
            if (this.nodeConfig.customCSS && this.nodeConfig.customCSS.length) {
                styles += `<style>${this.nodeConfig.customCSS.replace(/<(\/style)\b/gi, '\\00003c$1')}</style>`;
            }

            // script loader
            let scriptLoader = `<script>${scriptLoaderSrc
                .replace("'%ORIGIN%'", JSON.stringify(window.origin))
                .replace("'%NAMESPACE%'", JSON.stringify(this.nodeConfig.namespace))
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
                .replace("'%LIBCOUNT%'", this.nodeJsLibs.length)
            }<\/script>`; // eslint-disable-line no-useless-escape

            // postMessage receiver
            let messageListener = `<script>${messageListenerSrc}<\/script>`; // eslint-disable-line no-useless-escape

            // scripts from the node itself
            let scripts = this.nodeJsLibs.map(
                lib => `<script
                    src="${resourceBaseUrl}${lib}"
                    onload="knimeLoader(true)"
                    onerror="knimeLoader(false)">
                <\/script>` // eslint-disable-line no-useless-escape
            ).join('');

            this.document.write(`<!doctype html>
                <html lang="en-US">
                <meta charset="utf-8">
                <head>
                  ${styles}
                  ${messageListener}
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
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    initMethodName: this.nodeConfig.initMethodName,
                    viewRepresentation: this.nodeConfig.viewRepresentation,
                    viewValue: this.nodeConfig.viewValue,
                    type: 'init'
                }, window.origin);
                if (this.autoHeight) {
                    if (this.pollHeight) {
                        this.initHeightPolling();
                    } else {
                        this.setHeight();
                    }
                }
            } else if (event.data.type === 'getValue') {
                // call callback
                if (typeof event.data.value === 'undefined') {
                    this.getValueCallback({ error: new Error(event.data.error) });
                } else {
                    this.getValueCallback({ value: event.data.value });
                }
            }
        },

        getValue() {
            return new Promise((resolve, reject) => {
                this.getValueCallback = ({ error, value }) => {
                    window.clearTimeout(this.cancelValueGetter);
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ nodeId: this.nodeId, value });
                    }
                };
                this.document.defaultView.postMessage({
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    getViewValueMethodName: this.nodeConfig.getViewValueMethodName,
                    type: 'getValue'
                }, window.origin);
                this.cancelValueGetter = window.setTimeout(() => {
                    reject(new Error('Value could not be retrieved in the allocated time.'));
                }, valueGetterTimeout);
            });
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
