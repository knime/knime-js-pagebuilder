import Vue from 'vue';
import { setProp } from '@/util/nestedProperty';
import overrideRequired from '@/util/overrideRequired';
import getLayoutNodeIds from '@/util/getLayoutNodeIds';

export const namespaced = true;

export const state = () => ({
    page: null,
    isDialogLayout: false,
    isWebNode: false,
    resourceBaseUrl: '',
    webNodesLoading: [],
    pageValueGetters: {},
    pageValidators: {},
    pageValidationErrorSetters: {},
    nodesReExecuting: [],
    reExecutionUpdates: 0
});

// TODO: WEBP-791 remove single-property getters
export const getters = {
    nodesReExecuting: state => state.nodesReExecuting,
    reExecutionUpdates: state => state.reExecutionUpdates
};

export const mutations = {
    /**
     * Set page.
     *
     * @param {*} state automatically supplied by vuex
     * @param {*} page new page object
     * @return {undefined}
     */
    setPage(state, page) {
        state.page = page;
        const webNodes = page?.wizardPageContent?.webNodes;
        if (typeof webNodes === 'object') {
            state.pageValidators = {};
            state.pageValueGetters = {};
        }
        state.isDialogLayout = Boolean(page?.wizardPageContent?.nodeViews?.DIALOG);
        state.isWebNode = Boolean(webNodes && Object.keys(webNodes).length);
    },
    /**
     * Set base URL for any external libraries or resources served to the views.
     *
     * @param {*} storeState automatically supplied by vuex
     * @param {String} resourceBaseUrl the base URL from which resources are served
     * @return {undefined}
     */
    setResourceBaseUrl(storeState, resourceBaseUrl) {
        storeState.resourceBaseUrl = resourceBaseUrl;
    },

    /**
     * @typedef UpdateValuePath - the period-separated, stringified key path to the value in the page configuration
     *      for which an Update should be applied.
     * @type {String}
     *
     *      @example: 'path.to.value' refers to the 'value' property of the following object, 'page':
     *      let page = {
     *          path: {
     *              to: {
     *                  value: ...
     *              }
     *          }
     *      };
     */
    /**
     * An update event dispatched by an individual {@see NodeView }. The update event can either provide a new value
     * (i.e. the resulting updated state of a form component from user interaction) or indicated a request for a forced
     * update (i.e. from a reactive event).
     *
     * @param {*} state - Vuex state.
     * @param {Object} param - update event object.
     * @param {String} param.nodeId - the nodeID from the workflow which is used to serialize the node
     *      in the store.
     * @type {UpdateValuePath}
     * @param {Object.<UpdateValuePath, Object>} [param.update] - the optional update to apply to the page state.
     *      The property referenced by the provided {@type UpdateValuePath} will be set to the provided value
     *      {@type Object}. If no update is provided, the event is considered reactive and the existing configuration
     *      will used to force a Vuex reactive update(via {@method Vue.set}).
     * @param {String} param.viewType - 'webNodes' for wizardNodeViews (default) or 'nodeViews' for ui-extensions.
     * @return {undefined}
     */
    updateViewConfig(state, { nodeId, update, config, type, viewType = 'webNodes' } = {}) {
        // Update viewValues and other nested properties.
        if (update) {
            let currentWebNode = state.page.wizardPageContent[viewType][nodeId];
            for (let [key, value] of Object.entries(update)) {
                try {
                    setProp(currentWebNode, key, value);
                } catch (e) {
                    // catch deep Object modification errors
                    consola.error(`WebNode[type: ${type}, id: ${nodeId}]: Value not updated ` +
                    `because the provided key was invalid. Key:`, key);
                }
            }
            return;
        }
        // Otherwise, replace webNodes entirely (reactivity).
        consola.debug('pagebuilder/updateWebNode replacing web node content.');
        // TODO WEBP-327 Remove `overrideRequired` if dialog option added.
        Vue.set(state.page.wizardPageContent[viewType], nodeId, overrideRequired(config));
    },

    setWebNodeLoading(state, { nodeId, loading }) {
        let index = state.webNodesLoading.indexOf(nodeId);
        if (index === -1 && loading) {
            // add nodeId to list of loading views if not already present
            state.webNodesLoading.push(nodeId);
        } else if (index >= 0 && !loading) {
            // remove nodeId from list of loading views if present
            state.webNodesLoading.splice(index, 1);
        }
    },

    addValueGetter(state, { nodeId, valueGetter }) {
        state.pageValueGetters[nodeId] = valueGetter;
    },

    removeValueGetter(state, nodeId) {
        delete state.pageValueGetters[nodeId];
    },

    addValidator(state, { nodeId, validator }) {
        state.pageValidators[nodeId] = validator;
    },

    removeValidator(state, nodeId) {
        delete state.pageValidators[nodeId];
    },

    addValidationErrorSetter(state, { nodeId, errorSetter }) {
        state.pageValidationErrorSetters[nodeId] = errorSetter;
    },

    removeValidationErrorSetter(state, nodeId) {
        delete state.pageValidationErrorSetters[nodeId];
    },
    
    setNodesReExecuting(state, nodesReExecuting) {
        let lenInEq = nodesReExecuting.length !== state.nodesReExecuting.length;
        let contentInEq = nodesReExecuting.some(nodeId => state.nodesReExecuting.indexOf(nodeId) < 0);
        // Prevent unnecessary updates
        if (lenInEq || contentInEq) {
            state.nodesReExecuting = nodesReExecuting;
        }
        state.reExecutionUpdates = nodesReExecuting?.length ? state.reExecutionUpdates + 1 : 0;
    }
};

export const actions = {
    setPage({ commit, dispatch }, { page }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        commit('setPage', page);

        // clear any potential previous interactivity states
        dispatch('interactivity/clear');

        // register all defined selection translators from the page configuration
        if (page?.wizardPageContent) {
            let pageConfig = page.wizardPageContent.webNodePageConfiguration;
            pageConfig?.selectionTranslators?.forEach(translator => {
                dispatch('interactivity/registerSelectionTranslator', { translator });
            });
        }
    },

    updatePage({ commit, dispatch, state }, { page = {}, nodeIds }) {
        consola.trace('PageBuilder: Update page via action: ', page);
        let { webNodes, nodeViews, webNodePageConfiguration } = page?.wizardPageContent || page;
        nodeIds.forEach(nodeId => {
            // default webNode update
            let updateConfig = { nodeId, config: webNodes?.[nodeId] };
            // modify update if nodeId references or used to reference a nodeView;
            // replaces or removes the nodeView, respectively
            if (nodeViews?.[nodeId] || state.page.wizardPageContent.nodeViews?.[nodeId]) {
                updateConfig.config = nodeViews?.[nodeId];
                updateConfig.viewType = 'nodeViews';
            }
            commit('updateViewConfig', updateConfig);
        });
        // update translators with the interactivity store
        let { selectionTranslators: translators } = webNodePageConfiguration || {};
        if (translators) {
            dispatch('interactivity/updateSelectionTranslators', { translators });
        }
        let currentLayoutNodeIds = getLayoutNodeIds(state.page);
        // need to use node ids from new layout (and not provided nodeIds) because layout node ids are absolute.
        let newLayoutNodeIds = getLayoutNodeIds(page);
        if (newLayoutNodeIds.some((nodeId) => !currentLayoutNodeIds.includes(nodeId))) {
            dispatch('alert/showAlert', {
                type: 'warn',
                message: 'Currently, nodes are missing from the composite view layout. ' +
                    'That could interfere with reactive nodes.'
            });
        }
    },

    updateNodeViewConfig({ commit, dispatch }, { nodeView }) {
        const newViewConfig = {
            viewType: 'nodeViews',
            update: nodeView,
            nodeId: 'VIEW'
        };
        commit('updateViewConfig', newViewConfig);
        dispatch('pagebuilder/dialog/cleanSettings', null, { root: true });
    },

    setResourceBaseUrl({ commit }, { resourceBaseUrl }) {
        consola.trace('PageBuilder: Set resourceBaseUrl via action:', resourceBaseUrl);
        commit('setResourceBaseUrl', resourceBaseUrl);
    },

    updateWebNode({ commit }, newWebNode) {
        consola.trace(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Updated value via action:`,
            newWebNode);
        commit('updateViewConfig', newWebNode);
    },

    setWebNodeLoading({ commit }, { nodeId, loading }) {
        consola.trace(`PageBuilder: setting loading state of ${nodeId} via action: `, loading);
        commit('setWebNodeLoading', { nodeId, loading });
    },

    addValueGetter({ commit }, { nodeId, valueGetter }) {
        consola.trace('PageBuilder: add value getter via action: ', nodeId);
        commit('addValueGetter', { nodeId, valueGetter });
    },

    removeValueGetter({ commit }, { nodeId }) {
        consola.trace('PageBuilder: remove value getter via action: ', nodeId);
        commit('removeValueGetter', nodeId);
    },

    async getViewValues({ state }) {
        let valuePromises = Object.values(state.pageValueGetters)
            .map(getter => getter());

        // eslint-disable-next-line arrow-body-style
        let values = await Promise.all(valuePromises).then((values) => {
            return values.reduce((agg, element) => {
                agg[element.nodeId] = element.value;
                return agg;
            }, {});
        }).catch((e) => {
            consola.error(`Could not retrieve all view values: ${e}`);
            return {};
        });

        return values;
    },

    addValidator({ commit }, { nodeId, validator }) {
        consola.trace('PageBuilder: add validator via action: ', nodeId);
        commit('addValidator', { nodeId, validator });
    },

    removeValidator({ commit }, { nodeId }) {
        consola.trace('PageBuilder: remove validator via action: ', nodeId);
        commit('removeValidator', nodeId);
    },

    async getValidity({ state, dispatch }) {
        let validityPromises = Object.values(state.pageValidators)
            .map(validator => validator());
        let validity = await Promise.all(validityPromises)
            .then(validityArray => validityArray.reduce((obj, nodeResp) => {
                obj[nodeResp.nodeId] = nodeResp.isValid;
                return obj;
            }, {}))
            .catch((e) => {
                consola.error(`Page validation failed: ${e}`);
                return {};
            });
        return validity;
    },

    addValidationErrorSetter({ commit }, { nodeId, errorSetter }) {
        consola.trace('PageBuilder: add validation error setter via action: ', nodeId);
        commit('addValidationErrorSetter', { nodeId, errorSetter });
    },

    removeValidationErrorSetter({ commit }, { nodeId }) {
        consola.trace('PageBuilder: remove validation error setter via action: ', nodeId);
        commit('removeValidationErrorSetter', nodeId);
    },

    setValidationErrors({ state }, { page }) {
        const setValidationErrorPromises = [];
        for (const nodeId in page) {
            // Server responses for WebPortal Component errors may have the error attr.
            let errorMessage = page[nodeId].error || page[nodeId];
            if (typeof state.pageValidationErrorSetters[nodeId] === 'function') {
                setValidationErrorPromises.push(state.pageValidationErrorSetters[nodeId](errorMessage));
            }
        }
        return Promise.all(setValidationErrorPromises).then(res => true).catch(e => false);
    },

    triggerReExecution({ dispatch }, { nodeId }) {
        try {
            consola.debug(`Pagebuilder: re-execution triggered by node ${nodeId}`);
            dispatch('api/triggerReExecution', { nodeId }, { root: true });
        } catch (e) {
            consola.debug(`Pagebuilder: re-execution failed.`);
        }
    },

    setNodesReExecuting({ commit }, nodesReExecuting) {
        consola.debug('PageBuilder: setting re-executing nodes via action: ', nodesReExecuting);
        commit('setNodesReExecuting', nodesReExecuting);
    }
};
