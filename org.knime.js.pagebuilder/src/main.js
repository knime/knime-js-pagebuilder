/* eslint-disable no-undef, arrow-body-style */
// Standalone build for the KNIME AP Integration
// IE11 SWT Support
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Vue from 'vue';
import consola from 'consola';
import APWrapper from './components/APWrapper.vue';
import Vuex from 'vuex';

const DIV_TARGET = 'knime-pagebuilder';
const CONST_DEBUG_LOG_LEVEL = 4;

if (typeof KnimePageLoader === 'undefined') {
    /**
     * Methods removed 4.2:
     * - getContextRoot: used for old widget registration
     * - reset: tear-down handled globally
     * - getPublishedElement: handled by pagebuilder/interactivity store
     * - getPublishedData: handled by pagebuilder/interactivity store
     * - autoResize: **"stubbed" not removed; handled by NodeViewIFrame*
     *
     */
    window.KnimePageLoader = (function () {
        // PageBuilder Library loading
        let loadPageBuilderLibrary = async () => {
            // initialize VueX
            Vue.config.productionTip = false;
            Vue.use(Vuex);
            window.Vue = Vue;
            // Load and mount PageBuilder component library
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                let url = 'org/knime/core/knime-pagebuilder2.js';
                script.async = true;
                script.addEventListener('load', () => {
                    resolve(script);
                });
                script.addEventListener('error', () => {
                    reject(new Error(`Script loading of "${url}" failed`));
                    document.head.removeChild(script);
                });
                script.src = url;
                document.head.appendChild(script);
            });
            let Component = window['knime-pagebuilder'];
            if (!Component) {
                throw new Error(`PageBuilder component loading failed. Script invalid.`);
            }
            delete window['knime-pagebuilder'];
            return Component;
        };
        // main application mapping
        let pageBuilder = {
            app: null,
            el: null,
            isSingleView: false,
            viewRequests: [],
            isDebug: false,
            isDebugHTML: false
        };
        // application entry
        pageBuilder.init = async (arg1, arg2, arg3, debug) => {
            // set log levels
            window.consola = consola.create({
                level: debug ? CONST_DEBUG_LOG_LEVEL : -1
            });
            // parse page
            let page = {
                wizardPageContent: typeof arg1 === 'string' ? JSON.parse(arg1) : arg1,
                // for now, page will always be "Interaction Required" until we have Wizard Navigation in the AP
                wizardExecutionState: 'INTERACTION_REQUIRED'
            };
            // set application settings
            pageBuilder.isDebug = debug;
            pageBuilder.isDebugHTML = typeof debugHTML !== 'undefined';
            pageBuilder.isSingleView = page.wizardPageContent.isSingleView;
            // create element
            pageBuilder.el = document.createElement('div');
            pageBuilder.el.setAttribute('id', DIV_TARGET);
            document.body.appendChild(pageBuilder.el);
            // Load PageBuilder component library
            let Component = await loadPageBuilderLibrary();
            // initialize Vue
            pageBuilder.app = new Vue({
                created() {
                    // initialize the PageBuilder store as namespaced modules
                    Component.initStore(this.$store);
                    Vue.component('PageBuilder', Component);
                    this.$store.dispatch('pagebuilder/setResourceBaseUrl', { resourceBaseUrl: './' });
                    this.$store.dispatch('pagebuilder/setPage', { page });
                    this.$mount(`#${DIV_TARGET}`);
                },
                render: h => h(APWrapper),
                store: new Vuex.Store({})
            });
            window.isPushSupported = () => true;
        };

        // KAP Public API methods called by selenium-knime-bridge or SWT browser
        pageBuilder.getPageValues = () => {
            return pageBuilder.app.$store.dispatch('pagebuilder/getViewValues', null)
                .then(values => {
                    let parsedValues = pageBuilder.isSingleView ? values[Object.keys(values)[0]] : values;
                    if (typeof retrieveCurrentValueFromView === 'function') {
                        retrieveCurrentValueFromView(JSON.stringify(parsedValues));
                    }
                    return parsedValues;
                })
                .catch(e => {
                    if (typeof retrieveCurrentValueFromView === 'function') {
                        retrieveCurrentValueFromView(JSON.stringify({}));
                    }
                    return {};
                });
        };
        
        pageBuilder.validate = () => {
            return pageBuilder.app.$store.dispatch('pagebuilder/getValidity', null)
                .then(res => {
                    let isValid = !Object.values(res).some(isValid => isValid === false);
                    if (typeof validateCurrentValueInView === 'function') {
                        validateCurrentValueInView(Boolean(isValid));
                    }
                    return isValid;
                })
                .catch(e => {
                    if (typeof validateCurrentValueInView === 'function') {
                        validateCurrentValueInView(Boolean(false));
                    }
                    return false;
                });
        };
        
        pageBuilder.setValidationError = (errorResponse) => {
            pageBuilder.app.$store.dispatch('pagebuilder/setValidationErrors', { page: errorResponse.data });
        };

        // environment detection methods
        pageBuilder.isPushSupported = () => !pageBuilder.isDebugHTML; // window.isDebugHTML set in debug HTML creation only

        pageBuilder.isRunningInWebportal = () => false; // wrapper is only in AP
        
        pageBuilder.isRunningInSeleniumBrowser = () => typeof parent.seleniumKnimeBridge !== 'undefined';

        pageBuilder.autoResize = () => {
            // provide method to prevent errors from child views; we handle resizing differently now
            consola.debug('PageBuilder Wrapper: autoResize');
        };

        // Lazy Loading "private" fields (TODO: remove with WEBP-157)
        let requestSequence = 0;
        // Lazy Loading utility functions (TODO: remove with WEBP-157)
        let getNextRequestSequence = (sequence) => {
            let mod = typeof Number.MAX_SAFE_INTEGER === 'undefined' ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER;
            return ++sequence % mod;
        };
        let getAndSetNextRequestSequence = () => {
            requestSequence = getNextRequestSequence(requestSequence);
            return requestSequence;
        };
        let getNodeIdFromFrameID = frameID => frameID.substring('node'.length).replace(/-/g, ':');
        let buildFrameIDFromNodeId = nodeId => `node${nodeId.replace(/:/g, '-')}`;

        // AP/seleniumKnimeBridge Lazy Loading API (TODO: remove with WEBP-157)
        pageBuilder.requestViewUpdate = (frameID, request, requestSequence) => {
            consola.debug('PageBuilder Wrapper: requestViewUpdate');
            let nodeID = getNodeIdFromFrameID(frameID);
            let requestContainer = {
                sequence: getAndSetNextRequestSequence(),
                nodeID,
                jsonRequest: request
            };
            let resolvable = {
                sequence: requestContainer.sequence,
                nodeID: requestContainer.nodeID,
                requestSequence
            };
            if (pageBuilder.isSingleView) {
                consola.debug('PageBuilder Wrapper: single view request container');
                requestContainer = request;
            } else {
                requestContainer = JSON.stringify(requestContainer);
            }
            pageBuilder.viewRequests.push(resolvable);
            let monitor;
            if (typeof knimeViewRequest === 'function') {
                monitor = knimeViewRequest(requestContainer);
            }
            if (!monitor) {
                monitor = {};
            }
            if (typeof monitor === 'string') {
                monitor = JSON.parse(monitor);
            }
            monitor.requestSequence = requestSequence;
            resolvable.monitor = monitor;
            return monitor;
        };

        // AP/seleniumKnimeBridge Lazy Loading API (TODO: remove with WEBP-157)
        pageBuilder.respondToViewRequest = (responseContainer) => {
            consola.debug('PageBuilder Wrapper: respondToViewRequest');
            let response = pageBuilder.isSingleView ? responseContainer : responseContainer.jsonResponse;
            let frameID = pageBuilder.isSingleView ? 'node-SINGLE' : buildFrameIDFromNodeId(responseContainer.nodeID);
            for (let i = 0; i < pageBuilder.viewRequests.length; i++) {
                if (pageBuilder.viewRequests[i].sequence === responseContainer.sequence) {
                    pageBuilder.viewRequests.splice(i, 1);
                    break;
                }
            }
            let frame = document.getElementById(frameID);
            if (typeof frame !== 'undefined') {
                frame.contentWindow.KnimeInteractivity.respondToViewRequest(response);
            }
        };

        // AP/seleniumKnimeBridge Lazy Loading API (TODO: remove with WEBP-157)
        // eslint-disable-next-line consistent-return
        pageBuilder.updateRequestStatus = (frameID, monitorID) => {
            let resolvable;
            for (let i = 0; i < pageBuilder.viewRequests.length; i++) {
                let res = pageBuilder.viewRequests[i];
                if (res.monitor && monitorID === res.monitor.id) {
                    resolvable = res;
                    break;
                }
            }
            if (resolvable) {
                try {
                    let updatedMonitor;
                    if (typeof knimeUpdateRequestStatus === 'function') {
                        updatedMonitor = knimeUpdateRequestStatus(monitorID);
                    }
                    if (updatedMonitor) {
                        if (typeof updatedMonitor === 'string') {
                            updatedMonitor = JSON.parse(updatedMonitor);
                        }
                        updatedMonitor.requestSequence = resolvable.requestSequence;
                        if (updatedMonitor.executionFinished && updatedMonitor.responseAvailable) {
                            updatedMonitor.response = updatedMonitor.response.jsonResponse;
                        }
                        resolvable.monitor = updatedMonitor;
                        return updatedMonitor;
                    }
                } catch (err) {
                    consola.error(`Could not update view request status: ${err}`);
                }
            }
        };

        // AP/seleniumKnimeBridge Lazy Loading API (TODO: remove with WEBP-157)
        pageBuilder.updateResponseMonitor = (monitor) => {
            consola.debug('PageBuilder Wrapper: updateResponseMonitor');
            if (typeof monitor === 'string') {
                monitor = JSON.parse(monitor);
            }
            let resolvable, index;
            for (let i = 0; i < pageBuilder.viewRequests.length; i++) {
                let res = pageBuilder.viewRequests[i];
                if (res.monitor && monitor.id === res.monitor.id || // eslint-disable-line no-mixed-operators
                    monitor.requestSequence === res.sequence) {
                    resolvable = res;
                    index = i;
                    break;
                }
            }
            if (resolvable) {
                monitor.requestSequence = resolvable.requestSequence;
                if (monitor.executionFinished && monitor.responseAvailable) {
                    monitor.response = monitor.response.jsonResponse;
                }
                resolvable.monitor = monitor;
                let frameID = buildFrameIDFromNodeId(resolvable.nodeID);
                let frame = document.getElementById(frameID);
                if (monitor.executionFailed || monitor.cancelled || // eslint-disable-line no-mixed-operators
                    monitor.executionFinished && monitor.responseAvailable) { // eslint-disable-line no-mixed-operators
                    pageBuilder.viewRequests.splice(index, 1);
                }
                if (typeof frame !== 'undefined') {
                    frame.contentWindow.KnimeInteractivity.updateResponseMonitor(monitor);
                }
            }
        };

        // AP/seleniumKnimeBridge Lazy Loading API (TODO: remove with WEBP-157)
        pageBuilder.cancelViewRequest = (frameID, monitorID, invokeCatch) => {
            consola.debug('PageBuilder Wrapper: cancelViewRequest');
            let nodeID = getNodeIdFromFrameID(frameID);
            let index = -1;
            // in case monitorID is request sequence, map sequence
            for (let i = 0; i < pageBuilder.viewRequests.length; i++) {
                let resolvable = pageBuilder.viewRequests[i];
                if (resolvable.monitor && monitorID === resolvable.monitor.id) {
                    index = i;
                    break;
                } else if (monitorID === resolvable.requestSequence && nodeID === resolvable.nodeID) {
                    index = i;
                    monitorID = resolvable.sequence;
                    break;
                }
            }
            try {
                if (typeof knimeCancelRequest === 'function') {
                    knimeCancelRequest(monitorID);
                }
                if (!invokeCatch && index > -1) {
                    pageBuilder.viewRequests.splice(index, 1);
                }
            } catch (err) {
                consola.error(`Could not cancel view request: ${err}`);
            }
        };

        return pageBuilder;
    })();
}

// TODO: remove with WEBP-157
if (typeof KnimeInteractivity === 'undefined') {
    window.KnimeInteractivity = {
        respondToViewRequest(response) {
            return window.KnimePageLoader.respondToViewRequest(response);
        },
        updateResponseMonitor(monitor) {
            return window.KnimePageLoader.updateResponseMonitor(monitor);
        }
    };
}
