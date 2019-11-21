import { setProp } from '../src/util/nestedProperty';

export const namespaced = true;

export const state = () => ({
    page: null,
    resourceBaseUrl: '',
    pageValidity: {},
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

        /* The `pageValidity` object stores the valid state of all webNodes in the page as an key/value pair.
         *
         * Boolean isValid values for each node are stored with a key of the corresponding nodeID.
         *
         * ex: state.pageValidity = {
         *      1:0:1 : false,
         *      ...
         * }
         *
         * In order to make these properties reactive, they have to be initialized once using `this._vm.$set` whenever
         * the page changes.
         */
        let webNodes = page && page.wizardPageContent && page.wizardPageContent.webNodes;
        if (webNodes && typeof webNodes === 'object') {
            state.pageValidity = {};
            state.pageValueGetters = {};
            Object.keys(webNodes).forEach((nodeId) => {
                this._vm.$set(state.pageValidity, nodeId, true);
            });
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
     *
     *      isValid: (Boolean) tells store if value
     *                          should be updated or not.
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
        // update the validity of the node
        state.pageValidity[newWebNode.nodeId] = newWebNode.isValid;

        let currentWebNode = state.page.wizardPageContent.webNodes[newWebNode.nodeId];
        let values = [];
        for (let [key, value] of Object.entries(newWebNode.update)) {
            try {
                values.push(value);
                setProp(currentWebNode, key, value);
            } catch (e) {
                // catch deep Object modification errors
                consola.error(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Value not updated ` +
                `because the provided key was invalid. Key:`, key);
            }
        }
        if (!newWebNode.isValid) {
            consola.error(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Node is now invalid` +
                ` because of its new value(s). Value(s):`, values.join(', '));
        }
    },

    addValueGetter(state, { nodeId, valueGetter }) {
        state.pageValueGetters[nodeId] = valueGetter;
    },

    removeValueGetter(state, nodeId) {
        delete state.pageValueGetters[nodeId];
    }
};

export const actions = {
    setPage({ commit }, { page }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        commit('setPage', page);
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
    }
};
