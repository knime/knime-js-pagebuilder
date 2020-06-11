<script>
import ErrorMessage from '../widgets/baseElements/text/ErrorMessage';
import ViewAlert from './ViewAlert';
import iframeResizer from 'iframe-resizer/js/iframeResizer';

import scriptLoaderSrc from 'raw-loader!./injectedScripts/scriptLoader.js';
import messageListenerSrc from 'raw-loader!./injectedScripts/messageListener.js';
import iframeResizerContentSrc from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.js';
import loadingErrorHandlerSrc from 'raw-loader!./injectedScripts/loadErrorHandler.js';
import viewAlertHandlerSrc from 'raw-loader!./injectedScripts/viewAlertHandler.js';

const valueGetterTimeout = 10000; // ms
const validatorTimeout = 5000; // ms
const setValidationErrorTimeout = 1000; // ms

// TODO WEBP-227 split into multiple files

/**
 * A single node view iframe
 */
export default {
    components: {
        ErrorMessage,
        ViewAlert
    },
    props: {
        /**
         * View configuration, mainly layout and sizing options
         */
        viewConfig: {
            default: () => ({}),
            type: Object
        },
        /**
         * Node configuration as received by API
         */
        nodeConfig: {
            default: () => ({}),
            type: Object
        }
    },
    data() {
        return {
            isValid: true,
            errorMessage: null,
            alert: null
        };
    },

    computed: {
        nodeId() {
            return this.viewConfig && this.viewConfig.nodeID;
        },
        iframeId() {
            // provide a sensible id for the iframe, otherwise iframe-resizer sets it to a generic name
            return this.nodeId && `node-${this.nodeId.replace(/(:)/g, '-')}`;
        },
        webNode() {
            let page = this.$store.state.pagebuilder.page;
            if (page && page.webNodes) {
                return page.webNodes.filter(node => this.nodeId === node.nodeId)[0];
            }
            return null;
        },
        nodeJsLibs() {
            return this.nodeConfig.javascriptLibraries || [];
        },
        nodeStylesheets() {
            return this.nodeConfig.stylesheets || [];
        },
        autoHeight() {
            return this.viewConfig.resizeMethod && this.viewConfig.resizeMethod.startsWith('view');
        },
        classes() {
            let classes = [];
            if (!this.isValid) {
                classes.push('error');
            }
            if (!this.autoHeight) {
                classes.push('full-height');
            }
            return classes;
        }
    },

    mounted() {
        this.$store.dispatch('pagebuilder/setWebNodeLoading', { nodeId: this.nodeId, loading: true });
        window.addEventListener('message', this.messageFromIframe);

        this.document = this.$refs.iframe.contentDocument;
        this.injectContent();
        this.$store.dispatch('pagebuilder/addValidator', { nodeId: this.nodeId, validator: this.validate });
        this.$store.dispatch('pagebuilder/addValueGetter', { nodeId: this.nodeId, valueGetter: this.getValue });
        this.$store.dispatch('pagebuilder/addValidationErrorSetter', {
            nodeId: this.nodeId,
            errorSetter: this.setValidationError
        });

        // create global API which is accessed by knimeService running inside the iframe.
        // This global API should only be used/extended for cases where window.postMessage can't be used
        // due to the need of an immediate return value.
        let getPublishedDataFunc = this.$store.getters['pagebuilder/interactivity/getPublishedData'];
        let getDownloadLinkFunc = this.$store.getters['wizardExecution/downloadResourceLink'];
        if (!window.KnimePageBuilderAPI) {
            let nodeId = this.nodeId;
            window.KnimePageBuilderAPI = {
                interactivityGetPublishedData(id) {
                    return getPublishedDataFunc(id);
                },
                getDownloadLink(resourceId) {
                    return getDownloadLinkFunc({ resourceId, nodeId });
                }
            };
        }
    },

    beforeDestroy() {
        window.removeEventListener('message', this.messageFromIframe);
        this.$store.dispatch('pagebuilder/removeValidator', { nodeId: this.nodeId });
        this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
        this.$store.dispatch('pagebuilder/removeValidationErrorSetter', { nodeId: this.nodeId });

        // remove global API
        delete window.KnimePageBuilderAPI;
    },

    methods: {
        /**
         * Inject all the scripts and stylesheet associated with the node, as well as additional scripts that we use
         * for cross-frame communication
         * @return {undefined}
         */
        injectContent() {
            const resourceBaseUrl = this.$store.state.pagebuilder.resourceBaseUrl;

            let styles = this.computeStyles(resourceBaseUrl);
            let scripts = this.computeScripts(resourceBaseUrl);

            // runtime/script injection error handling
            let loadingErrorHandler = `<script>${loadingErrorHandlerSrc
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
            }<\/script>`; // eslint-disable-line no-useless-escape

            // view alert override
            let viewAlertHandler = `<script>${viewAlertHandlerSrc
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
            }<\/script>`; // eslint-disable-line no-useless-escape

            // script loader
            let scriptLoader = `<script>${scriptLoaderSrc
                .replace("'%RESOURCEBASEURL%'", JSON.stringify(resourceBaseUrl))
                .replace("'%ORIGIN%'", JSON.stringify(window.origin))
                .replace("'%NAMESPACE%'", JSON.stringify(this.nodeConfig.namespace))
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
                .replace("'%LIBCOUNT%'", this.nodeJsLibs.length)
            }<\/script>`; // eslint-disable-line no-useless-escape

            // postMessage receiver
            let messageListener = `<script>${messageListenerSrc}<\/script>`; // eslint-disable-line no-useless-escape
            // iframe resizer content window script
            let iframeResizer = this.autoHeight ? `<script>${iframeResizerContentSrc}<\/script>` : ''; // eslint-disable-line no-useless-escape

            this.document.write(`<!doctype html>
                <html lang="en-US">
                <meta charset="utf-8">
                <head>
                  ${styles}
                  ${messageListener}
                  ${scriptLoader}
                  ${viewAlertHandler}
                  ${loadingErrorHandler}
                  ${iframeResizer}
                  <title></title>
                </head>
                <body></body>
                ${scripts}
                </html>`);

            this.document.close();
        },

        /**
         * Helper method that computes the required `<style>` elements that should be injected into the iframe
         * @param {String} resourceBaseUrl Base URL from store
         * @returns {String}
         */
        computeStyles(resourceBaseUrl) {
            // stylesheets from the node view itself
            let styles = this.nodeStylesheets.map(
                style => `<link type="text/css" rel="stylesheet" href="${resourceBaseUrl}${encodeURI(style)}">`
            );

            // custom CSS from node configuration
            if (this.nodeConfig.customCSS && this.nodeConfig.customCSS.length) {
                styles.push(`<style>${this.nodeConfig.customCSS.replace(/<(\/style)\b/gi, '\\00003c$1')}</style>`);
            }

            return styles.join('');
        },

        /**
         * Helper method that computes the required `<script>` elements that should be injected into the iframe
         * @param {String} resourceBaseUrl Base URL from store
         * @returns {String}
         */
        computeScripts(resourceBaseUrl) {
            // scripts from the node itself
            let scripts = this.nodeJsLibs.map(
                lib => `<script
                    src="${resourceBaseUrl}${lib}"
                    onload="knimeLoader(true)"
                    onerror="knimeLoader(false)">
                <\/script>` // eslint-disable-line no-useless-escape
            );

            // inject resource base URL so that it can be read by dynamic JS nodes and generic JS view
            scripts.push(`<script>
                if (typeof knimeService !== 'undefined') {
                    knimeService.resourceBaseUrl = '${resourceBaseUrl}';
                    knimeService.pageBuilderPresent = true;
                    knimeService.nodeId = '${this.nodeId}';
                }
            <\/script>`); // eslint-disable-line no-useless-escape

            return scripts.join('');
        },

        initIFrameResize() {
            if (this.autoHeight) {
                // apply a default tolerance of 5px to avoid unnecessary screen flicker
                const defaultResizeTolerance = 5;
                const defaultResizeMethod = 'lowestElement';
                let conf = this.viewConfig;

                // strip prefix from resize method to determine heightCalculationMethod
                let prefix = 'view'.length;
                let method = defaultResizeMethod;
                if (conf.resizeMethod) {
                    method = conf.resizeMethod.substring(prefix, prefix + 1).toLowerCase() +
                        conf.resizeMethod.substring(prefix + 1);
                }
                // special case, this used a different resize method for IE, but is not supported anymore
                if (method === 'lowestElementIEMax') {
                    method = defaultResizeMethod;
                }

                // populate settings object
                let resizeSettings = {
                    log: false,
                    checkOrigin: [window.origin],
                    resizeFrom: 'child',
                    warningTimeout: 0, // suppress warning

                    autoResize: conf.autoResize,
                    scrolling: conf.scrolling,
                    heightCalculationMethod: method,
                    sizeHeight: conf.sizeHeight,
                    tolerance: conf.resizeTolerance || defaultResizeTolerance
                };
                if (conf.minWidth) {
                    resizeSettings.minWidth = conf.minWidth;
                }
                if (conf.maxWidth) {
                    resizeSettings.maxWidth = conf.maxWidth;
                }
                if (conf.minHeight) {
                    resizeSettings.minHeight = conf.minHeight;
                }
                if (conf.maxHeight) {
                    resizeSettings.maxHeight = conf.maxHeight;
                }
               
                iframeResizer(resizeSettings, this.$refs.iframe);
            }
        },

        messageFromIframe(event) {
            const data = event.data;
            if (event.origin !== window.origin || !data || !data.type || data.nodeId !== this.nodeId) {
                return;
            }
            if (data.error) {
                // errors can occur on any event type, further handling of the event might still be necessary
                this.errorMessage = data.error;
                this.isValid = false;
            }
            if (data.type === 'load') {
                consola.debug(`View resource loading for ${this.nodeId} completed`);
                this.document.defaultView.postMessage({
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    initMethodName: this.nodeConfig.initMethodName,
                    viewRepresentation: this.nodeConfig.viewRepresentation,
                    viewValue: this.nodeConfig.viewValue,
                    type: 'init'
                }, window.origin);
                this.$store.dispatch('pagebuilder/setWebNodeLoading', { nodeId: this.nodeId, loading: false });
            } else if (data.type === 'validate') {
                this.validateCallback(data);
            } else if (data.type === 'getValue') {
                this.getValueCallback(data);
            } else if (data.type === 'setValidationError') {
                this.setValidationErrorCallback(data);
            } else if (data.type === 'alert') {
                this.alert = {
                    ...data,
                    type: data.level === 'error' ? 'error' : 'warn'
                };
            } else if (data.type.startsWith('interactivity')) {
                this.handleInteractivity(event);
            }
        },

        validate() {
            return new Promise((resolve, reject) => {
                this.validateCallback = ({ isValid }) => {
                    if (!isValid) {
                        this.errorMessage = 'View validation failed.';
                    }
                    this.isValid = isValid;
                    window.clearTimeout(this.cancelValidate);
                    resolve({ nodeId: this.nodeId, isValid });
                };
                this.document.defaultView.postMessage({
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    validateMethodName: this.nodeConfig.validateMethodName,
                    type: 'validate'
                }, window.origin);
                this.cancelValidate = window.setTimeout(() => {
                    this.isValid = false;
                    this.errorMessage = 'View is not responding.';
                    resolve({ nodeId: this.nodeId, isValid: this.isValid });
                }, validatorTimeout);
            });
        },

        getValue() {
            return new Promise((resolve, reject) => {
                this.getValueCallback = ({ error, value }) => {
                    window.clearTimeout(this.cancelValueGetter);
                    if (error) {
                        reject(new Error(error));
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
        },

        setValidationError(errorMessage) {
            return new Promise((resolve, reject) => {
                this.setValidationErrorCallback = ({ error }) => {
                    window.clearTimeout(this.cancelSetValidatorError);
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve(true);
                    }
                };
                this.document.defaultView.postMessage({
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    setValidationErrorMethodName: this.nodeConfig.setValidationErrorMethodName,
                    type: 'setValidationError',
                    errorMessage
                }, window.origin);
                this.cancelSetValidatorError = window.setTimeout(() => {
                    reject(new Error('Validation error message could not be set in the allocated time.'));
                }, setValidationErrorTimeout);
            });
        },
        /* Event handler for closing an alert */
        onCloseAlert() {
            consola.trace('Closing view alert (NodeViewIFrame).');
            // if there was an error, check to see if the view is responding (will update styles if not)
            if (this.alert.type === 'error') {
                this.validate();
            }
            // delete the alert data to close the alert
            this.alert = null;
        },
        
        handleInteractivity(event) {
            let interactivityType = event.data.type;
            switch (interactivityType) {
            case 'interactivitySubscribe':
                consola.trace(`subscribe to event`, this.nodeId, event.data);
                this.$store.dispatch('pagebuilder/interactivity/subscribe', {
                    id: event.data.id,
                    callback: this.interactivityInformIframe,
                    elementFilter: event.data.elementFilter
                });
                break;
            case 'interactivityUnsubscribe':
                consola.trace(`unsubscribe from event`, this.nodeId, event.data);
                this.$store.dispatch('pagebuilder/interactivity/unsubscribe', {
                    id: event.data.id,
                    callback: this.interactivityInformIframe
                });
                break;
            case 'interactivityPublish':
                consola.trace(`publish event called`, this.nodeId, event.data);
                this.$store.dispatch('pagebuilder/interactivity/publish', {
                    id: event.data.id,
                    data: event.data.payload,
                    skipCallback: this.interactivityInformIframe
                });
                break;
            case 'interactivityRegisterSelectionTranslator':
                consola.trace(`interactivityRegisterSelectionTranslator`);
                this.$store.dispatch('pagebuilder/interactivity/registerSelectionTranslator', {
                    translatorId: event.data.id,
                    translator: event.data.translator
                });
                break;
            default:
                break;
            }
        },

        interactivityInformIframe(id, payload) {
            let data = {
                nodeId: this.nodeId,
                type: 'interactivityEvent',
                id,
                payload
            };
            this.document.defaultView.postMessage(data, window.origin);
        }
    }
};
</script>

<template>
  <div class="frame-container">
    <iframe
      :id="iframeId"
      ref="iframe"
      :class="classes"
      @load="initIFrameResize"
    />
    <ViewAlert
      :type="alert && alert.type"
      :message="alert && alert.message"
      :active="Boolean(alert)"
      :node-id="nodeId"
      :node-info="nodeConfig.nodeInfo"
      @closeAlert="onCloseAlert"
    />
    <ErrorMessage
      v-if="errorMessage && !isValid"
      :error="errorMessage"
      class="error-message"
    />
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

div.frame-container {
  width: 100%;
}

iframe {
  display: block;
  background-color: white;
  border: none;
  width: 100%;

  &.full-height {
    height: 100%;
  }

  &.error {
    outline: 2px solid var(--theme-color-error);
  }
}

.error-message {
  position: absolute !important;
  top: 0;
  margin: 2px 0 0 2px;
  padding: 5px;
  background-color: white;
}
</style>
