import Vue from 'vue';
import { setProp } from '@/util/nestedProperty';

export const namespaced = true;

export const state = () => ({
    page: null,
    resourceBaseUrl: '',
    webNodesLoading: [],
    pageValueGetters: {},
    pageValidators: {},
    pageValidationErrorSetters: {},
    nodesReExecuting: []
});

export const getters = {
    nodesReExecuting: state => state.nodesReExecuting
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
        let webNodes = page && page.wizardPageContent && page.wizardPageContent.webNodes;
        if (webNodes && typeof webNodes === 'object') {
            state.pageValidators = {};
            state.pageValueGetters = {};
        }
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
     * When a webNode updates its value,
     * it triggers a mutation via the
     * 'pagebuilder/updateWebNode' action.
     *
     * The expected newWebNode object should
     * have keys/values for:
     *      nodeId: (String) the nodeID from the workflow
     *              which is used to serialize the node
     *              in the store.
     *      update: (Object) with computed properties *key*
     *              that are the direct access index of the
     *              value to be modified in the original
     *              webNodeConfiguration as provided by the
     *              page and a new *value* (the update).
     *              All keys and values will be mapped into
     *              the corresponding webNode stored in
     *              state.page.
     *
     * @param {*} state
     * @param {*} newWebNode
     * @return {undefined}
     */
    updateWebNode(state, newWebNode) {
        // Update viewValues and other nested properties.
        if (newWebNode?.update) {
            let currentWebNode = state.page.wizardPageContent.webNodes[newWebNode.nodeId];
            for (let [key, value] of Object.entries(newWebNode.update)) {
                try {
                    setProp(currentWebNode, key, value);
                } catch (e) {
                    // catch deep Object modification errors
                    consola.error(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Value not updated ` +
                    `because the provided key was invalid. Key:`, key);
                }
            }
            return;
        }
        // Otherwise, replace webNodes entirely (reactivity).
        consola.debug('pagebuilder/updateWebNode replacing web node content.');
        Vue.set(state.page.wizardPageContent.webNodes, newWebNode.nodeId, newWebNode.config);
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
        state.nodesReExecuting = nodesReExecuting;
    }
};

export const actions = {
    setPage({ commit, dispatch }, { page }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        commit('setPage', page);

        // clear any potential previous interactivity states
        dispatch('interactivity/clear');

        // register all defined selection translators from the page configuration
        if (page && page.wizardPageContent) {
            let pageConfig = page.wizardPageContent.webNodePageConfiguration;
            if (pageConfig && pageConfig.selectionTranslators && pageConfig.selectionTranslators.length > 0) {
                pageConfig.selectionTranslators.forEach((translator, i) => {
                    dispatch('interactivity/registerSelectionTranslator', { translatorId: i, translator });
                });
            }
        }
    },

    updatePage({ commit }, { page, nodeIds }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        nodeIds.forEach(nodeId => {
            commit('updateWebNode', { nodeId, config: page?.wizardPageContent?.webNodes?.[nodeId] });
        });
    },

    setResourceBaseUrl({ commit }, { resourceBaseUrl }) {
        consola.trace('PageBuilder: Set resourceBaseUrl via action:', resourceBaseUrl);
        commit('setResourceBaseUrl', resourceBaseUrl);
    },

    updateWebNode({ commit }, newWebNode) {
        consola.trace(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Updated value via action:`,
            newWebNode);
        commit('updateWebNode', newWebNode);
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
        commit('setNodesReExecuting', nodesReExecuting);
    }
};
