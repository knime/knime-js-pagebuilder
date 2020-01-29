import { setProp } from '../src/util/nestedProperty';

export const namespaced = true;

export const state = () => ({
    page: null,
    resourceBaseUrl: '',
    webNodesLoading: [],
    pageValidators: {},
    pageValueGetters: {}
});

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
    }
};

export const actions = {
    setPage({ commit, dispatch }, { page }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        commit('setPage', page);

        dispatch('interactivity/clear');
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

        let values = await Promise.all(valuePromises).then((values) => {
            let viewValues = {};
            values.forEach(element => {
                viewValues[element.nodeId] = JSON.stringify(element.value);
            });
            return viewValues;
        }).catch((e) => {
            consola.error(`Could not retrieve all view values: ${e}`);
            throw new Error(`Could not retrieve all view values`);
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
                let errMsg = `Page validation failed: ${e}`;
                consola.error(errMsg);
                throw new Error(errMsg);
            });
        return validity;
    }
};
