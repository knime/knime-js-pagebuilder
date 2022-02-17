<script>
import { mapState, mapGetters } from 'vuex';
import AlertLocal from '~/src/components/ui/AlertLocal';
import { iframeResizer } from 'iframe-resizer';

import scriptLoaderSrc from 'raw-loader!./injectedScripts/scriptLoader.js';
import messageListenerSrc from 'raw-loader!./injectedScripts/messageListener.js';
import iframeResizerContentSrc from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.js';
import loadingErrorHandlerSrc from 'raw-loader!./injectedScripts/loadErrorHandler.js';
import viewAlertHandlerSrc from 'raw-loader!./injectedScripts/viewAlertHandler.js';

const valueGetterTimeout = 30000; // ms
const validatorTimeout = 5000; // ms
const setValidationErrorTimeout = 5000; // ms

// TODO WEBP-227 split into multiple files

/**
 * A single node view iframe
 */
export default {
    components: {
        AlertLocal
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
        },
        /**
         * The unique string node ID as it exists
         * in the store webNodes
         */
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        }
    },
    data() {
        return {
            alert: null
        };
    },
    computed: {
        ...mapState('pagebuilder', ['page']),
        ...mapGetters('wizardExecution', ['currentJobId']), // Expected values include null (no job) or undefined (AP execution).
        iframeId() {
            // provide a sensible id for the iframe, otherwise iframe-resizer sets it to a generic name
            return this.nodeId && `node-${this.nodeId.replace(/(:)/g, '-')}`;
        },
        nodeJsLibs() {
            return this.nodeConfig.javascriptLibraries || [];
        },
        nodeStylesheets() {
            return this.nodeConfig.stylesheets || [];
        },
        autoHeight() {
            return !this.isSingleView && this.viewConfig.resizeMethod?.startsWith('view');
        },
        classes() {
            let classes = [];
            if (!this.autoHeight) {
                classes.push('full-height');
            }
            return classes;
        },
        origin() { // react to current browser environment
            let postMessageOrigin = window.origin;
            if (!postMessageOrigin || postMessageOrigin === 'null') {
                postMessageOrigin = window.location.origin;
            }
            if (postMessageOrigin.includes('file:')) {
                postMessageOrigin = '*';
            }
            return postMessageOrigin;
        },
        isSingleView() {
            return this.page?.wizardPageContent?.isSingleView;
        },
        displayAlert() {
            return this.alert?.type === 'error';
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
        // TODO: AP-18040 update the settings store with deafaultMoundId getters
        let storeSettings = this.$store.state.settings;
        let workflowPath = this.$store.getters['wizardExecution/workflowPath'];
        let getRepositoryFunc = this.$store.getters['api/repository'];
        let getUserFunc = this.$store.getters['api/user'];
        let getDownloadLinkFunc = this.$store.getters['api/downloadResourceLink'];
        let getUploadLinkFunc = this.$store.getters['api/uploadResourceLink'];
        let sketcherPath = this.$store.getters['settings/getCustomSketcherPath'];
        if (!window.KnimePageBuilderAPI || window.KnimePageBuilderAPI.teardown(this.currentJobId)) {
            window.KnimePageBuilderAPI = {
                interactivityGetPublishedData(id) {
                    return getPublishedDataFunc(id);
                },
                getDefaultMountId() {
                    if (typeof storeSettings === 'undefined') {
                        return null;
                    } else {
                        return storeSettings.defaultMountId;
                    }
                },
                getWorkflow() {
                    if (typeof workflowPath === 'string') {
                        return workflowPath;
                    } else {
                        return null;
                    }
                },
                getRepository({ path, filter }) {
                    if (typeof getRepositoryFunc === 'function') {
                        return getRepositoryFunc({ path, filter });
                    } else {
                        return null;
                    }
                },
                getUser() {
                    if (typeof getUserFunc === 'function') {
                        return getUserFunc();
                    } else {
                        return Promise.resolve(null);
                    }
                },
                getDownloadLink({ resourceId, nodeId }) {
                    if (typeof getDownloadLinkFunc === 'function') {
                        return getDownloadLinkFunc({ resourceId, nodeId });
                    } else {
                        return null;
                    }
                },
                getUploadLink({ resourceId, nodeId }) {
                    if (typeof getUploadLinkFunc === 'function') {
                        return getUploadLinkFunc({ resourceId, nodeId });
                    } else {
                        return null;
                    }
                },
                getCustomSketcherPath() {
                    if (typeof sketcherPath === 'string') {
                        return sketcherPath;
                    } else {
                        return null;
                    }
                },
                /**
                 * Utility check method to prevent concurrent/unnecessary initialization of the global
                 * KnimePageBuilderAPI. Vue can create race conditions during create and destroy hooks depending on the
                 * layout of the Page, so global API initialization and destruction should only occur when necessary
                 * (i.e. when a new job is loaded or the pagebuilder is being destroyed).
                 *
                 * @param {String} [jobId] - the optional jobId of the current NodeViewIFrame (expected to be null if the
                 *  NVIF is being destroyed or undefined if the NVIF is running in the AP).
                 * @returns {Boolean} - if the global API was created with a different JobID and should be either deleted
                 *      or reinitialized.
                 */
                teardown(jobId) {
                    return jobId !== this.currentJobId;
                },
                currentJobId: this.currentJobId
            };
        }
    },

    beforeDestroy() {
        window.removeEventListener('message', this.messageFromIframe);
        this.$store.dispatch('pagebuilder/removeValidator', { nodeId: this.nodeId });
        this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
        this.$store.dispatch('pagebuilder/removeValidationErrorSetter', { nodeId: this.nodeId });
        if (window.KnimePageBuilderAPI?.teardown(this.currentJobId)) {
            delete window.KnimePageBuilderAPI;
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
            const accessToken = this.$store.state.settings?.['knime:access_token'];

            let styles = this.computeStyles(resourceBaseUrl, accessToken);
            let scripts = this.computeScripts(resourceBaseUrl, accessToken);

            // runtime/script injection error handling
            let loadingErrorHandler = `<script>${loadingErrorHandlerSrc
                .replace("'%ORIGIN%'", JSON.stringify(this.origin))
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
            }<\/script>`; // eslint-disable-line no-useless-escape

            // view alert override
            let viewAlertHandler = `<script>${viewAlertHandlerSrc
                .replace("'%ORIGIN%'", JSON.stringify(this.origin))
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
            }<\/script>`; // eslint-disable-line no-useless-escape

            // script loader
            let scriptLoader = `<script>${scriptLoaderSrc
                .replace("'%RESOURCEBASEURL%'", JSON.stringify(resourceBaseUrl))
                .replace("'%ORIGIN%'", JSON.stringify(this.origin))
                .replace("'%NAMESPACE%'", JSON.stringify(this.nodeConfig.namespace))
                .replace("'%NODEID%'", JSON.stringify(this.nodeId))
                .replace("'%LIBCOUNT%'", this.nodeJsLibs.length)
            }<\/script>`; // eslint-disable-line no-useless-escape

            // postMessage receiver
            let messageListener = `<script>${messageListenerSrc
                .replace("'%ORIGIN%'", JSON.stringify(this.origin))
            }<\/script>`; // eslint-disable-line no-useless-escape

            // iframe resizer content window script
            let iframeResizerContent = this.autoHeight ? `<script>${iframeResizerContentSrc}<\/script>` : ''; // eslint-disable-line no-useless-escape

            this.document.write(`<!doctype html>
                <html lang="en-US">
                <meta charset="utf-8">
                <head>
                  ${styles}
                  ${messageListener}
                  ${scriptLoader}
                  ${viewAlertHandler}
                  ${loadingErrorHandler}
                  ${iframeResizerContent}
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
         * @param {String} [accessToken] An optional JWT access token used to authenticate resource requests
         * @returns {String}
         */
        computeStyles(resourceBaseUrl, accessToken) {
            // stylesheets from the node view itself
            let styles = this.nodeStylesheets.map(
                style => {
                    let href = `${resourceBaseUrl}${encodeURI(style)}`;
                    if (accessToken) {
                        href += `?knime:access_token=${accessToken}`;
                    }
                    return `<link type="text/css" rel="stylesheet" href="${href}">`;
                }
            );

            // custom CSS from node configuration
            if (this.nodeConfig.customCSS?.length) {
                // replace '</style' with CSS-escaped '\00003c/style'
                styles.push(`<style>${this.nodeConfig.customCSS.replace(/<(\/style)\b/gi, '\\00003c$1')}</style>`);
            }

            return styles.join('');
        },

        /**
         * Helper method that computes the required `<script>` elements that should be injected into the iframe
         * @param {String} resourceBaseUrl Base URL from store
         * @param {String} [accessToken] An optional JWT access token used to authenticate resource requests
         * @returns {String}
         */
        computeScripts(resourceBaseUrl, accessToken) {
            // scripts from the node itself
            let scripts = this.nodeJsLibs.map(
                lib => {
                    let src = `${resourceBaseUrl}${lib}`;
                    if (accessToken) {
                        src += `?knime:access_token=${accessToken}`;
                    }
                    return `<script src="${src}" 
                        onload="knimeLoader(true)" 
                        onerror="knimeLoader(false)">
                        <\/script>`; // eslint-disable-line no-useless-escape
                }
            );

            // inject resource base URL so that it can be read by dynamic JS nodes and generic JS view
            scripts.push(`<script>
                if (typeof knimeService !== 'undefined') {
                    knimeService.resourceBaseUrl = '${resourceBaseUrl}';
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
            if (!event || !event.origin) {
                return;
            }
            const data = event.data;
            let originMatch = event.origin === this.origin || event.origin === '*' || event.origin.includes('file:');
            if (!originMatch || !data || !data.type || data.nodeId !== this.nodeId) {
                return;
            }
            // Important: allow processing of the message to continue even if there was an error.
            if (data.error) {
                this.handleAlert(data);
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
                }, this.origin);
                this.$store.dispatch('pagebuilder/setWebNodeLoading', { nodeId: this.nodeId, loading: false });
            } else if (data.type === 'validate') {
                this.validateCallback(data);
            } else if (data.type === 'getValue') {
                this.getValueCallback(data);
            } else if (data.type === 'setValidationError') {
                this.setValidationErrorCallback(data);
            } else if (data.type === 'alert') {
                this.handleAlert(data);
            } else if (data.type.startsWith('interactivity')) {
                this.handleInteractivity(event);
            }
        },

        validate() {
            return new Promise((resolve, reject) => {
                this.validateCallback = ({ isValid }) => {
                    if (!isValid) {
                        this.setLocalError('View validation failed.');
                    }
                    window.clearTimeout(this.cancelValidate);
                    resolve({ nodeId: this.nodeId, isValid });
                };
                this.document.defaultView.postMessage({
                    nodeId: this.nodeId,
                    namespace: this.nodeConfig.namespace,
                    validateMethodName: this.nodeConfig.validateMethodName,
                    type: 'validate'
                }, this.origin);
                this.cancelValidate = window.setTimeout(() => {
                    this.setLocalError('View is not responding.');
                    resolve({ nodeId: this.nodeId, isValid: false });
                }, validatorTimeout);
            });
        },

        getValue() {
            return new Promise((resolve, reject) => {
                this.getValueCallback = ({ error, value }) => {
                    window.clearTimeout(this.cancelValueGetter);
                    if (error) {
                        this.setLocalError(error);
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
                }, this.origin);
                this.cancelValueGetter = window.setTimeout(() => {
                    let errorMessage = 'Value could not be retrieved in the allocated time.';
                    this.setLocalError(errorMessage);
                    reject(new Error(errorMessage));
                }, valueGetterTimeout);
            });
        },

        setValidationError(errorMessage) {
            return new Promise((resolve, reject) => {
                this.setValidationErrorCallback = ({ error }) => {
                    window.clearTimeout(this.cancelSetValidatorError);
                    if (error) {
                        this.setLocalError(error);
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
                }, this.origin);
                this.cancelSetValidatorError = window.setTimeout(() => {
                    let errorMessage = 'Validation error message could not be set in the allocated time.';
                    this.setLocalError(errorMessage);
                    reject(new Error(errorMessage));
                }, setValidationErrorTimeout);
            });
        },

        /**
         * The local helper function to create an error alert to display node specific information.
         *s
         * @param {String} message - the message to set on the global alert when details are shown.
         * @returns {undefined}
         */
        setLocalError(message) {
            this.handleAlert({
                message,
                level: 'error'
            });
        },

        handleAlert(data) {
            // allow further processing of the original message data by copying before modification
            let alert = JSON.parse(JSON.stringify(data));
            this.alert = {
                ...alert,
                type: alert.level === 'error' || alert.error ? 'error' : 'warn',
                nodeInfo: this.nodeConfig.nodeInfo,
                message: alert.message || alert.error
            };
            if (this.alert.type === 'warn') {
                this.showAlert();
            }
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
            this.document.defaultView.postMessage(data, this.origin);
        },

        /**
         * Dispatches an event to show the local alert details with the global alert via store action.
         *
         * @returns {undefined}
         */
        showAlert() {
            this.$store.dispatch('pagebuilder/alert/showAlert', {
                ...this.alert,
                callback: this.closeAlert
            });
        },

        /**
         * Callback function passed to the alert store to close the local alert when a global alert action is
         * triggered. Can be used locally if needed.
         *
         * @param {Boolean} [remove] - optionally if the local alert should be cleared.
         * @returns {undefined}
         */
        closeAlert(remove) {
            if (remove) {
                this.alert = null;
            }
        }
    }
};
</script>

<template>
  <div :class="['frame-container', { 'single-view': isSingleView }, { 'with-alert': displayAlert }]">
    <iframe
      :id="iframeId"
      ref="iframe"
      :class="classes"
      @load="initIFrameResize"
    />
    <AlertLocal
      :active="displayAlert"
      @showAlert="showAlert"
    />
  </div>
</template>

<style lang="postcss" scoped>
div.frame-container {
  width: 100%;
  padding-top: 10px; /* provides default spacing between page content */
  min-height: 0;
  transition: min-height 0.4s ease-in 0.1s;

  &.single-view {
    height: calc(100vh - 10px);
  }

  &.with-alert {
    min-height: 60px; /* min height of 50px (alert icon) + top padding */
    min-width: 50px; /* min width of (alert icon) */
    transition: min-height 0.2s ease-out;
  }
}

iframe {
  display: block;
  background-color: white;
  border: none;
  width: 100%;

  &.full-height {
    height: 100%;
  }
}
</style>
