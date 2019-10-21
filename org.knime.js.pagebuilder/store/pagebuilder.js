import { setProp } from '../src/util/nestedProperty';

export const namespaced = true;

export const state = () => ({
    viewState: null,
    page: null,
    pageValidity: {}
});

export const mutations = {
    setViewState(state, viewState) {
        state.viewState = viewState;
    },

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
        if (page &&
            typeof page.webNodes === 'object' &&
            page.webNodes !== null) {
            state.pageValidity = {};
            Object.keys(page.webNodes).forEach((nodeId) => {
                this._vm.$set(state.pageValidity, nodeId, false);
            });
        }
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

        // only update value if the node is valid
        if (newWebNode.isValid) {
            let currentWebNode = state.page.webNodes[newWebNode.nodeId];
            for (let [key, value] of Object.entries(newWebNode.update)) {
                try {
                    setProp(currentWebNode, key, value);
                } catch (e) {
                    // catch deep Object modification errors
                    consola.error(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Value not updated` +
                     `because the provided key was invalid. Key:`, key);
                }
            }
        } else {
            consola.error(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Value not updated because` +
                `the change was invalid. Valid:`, newWebNode.isValid);
        }
    }
};

export const actions = {
    setViewState({ commit }, { viewState }) {
        consola.trace('PageBuilder: Set state via action: ', viewState);
        commit('setViewState', viewState);
    },

    setPage({ commit }, { page }) {
        consola.trace('PageBuilder: Set page via action: ', page);
        commit('setPage', page);
    },

    updateWebNode({ commit }, newWebNode) {
        consola.trace(`WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Updated value via action:`,
            newWebNode);
        commit('updateWebNode', newWebNode);
    },

    // only for PageBuilder-internal usage
    async nextPage({ dispatch }) {
        consola.trace('PageBuilder: Proxying call for next page');
        await dispatch('outbound/nextPage');
    },

    async previousPage({ dispatch }) {
        consola.trace('PageBuilder: Proxying call for previous page');
        await dispatch('outbound/previousPage');
    }
};

export const getters = {
    // Global page validity method (ex: to enable 'Next Page' button)
    isPageValid(state, getters) {
        if (!state.page || !state.page.webNodes || !state.pageValidity) {
            return true;
        }
        return Object.keys(state.page.webNodes).every(key => state.pageValidity[key]);
    }
};
