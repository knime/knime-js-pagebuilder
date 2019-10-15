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

    setPage(state, page) {
        state.page = page;
    },

    /**
     * Store the valid state of all
     * webNodes in the page as an key/value pair
     * on the state.pageValidity property.
     *
     * Boolean isValid values for each node are
     * stored with a key of the corresponding nodeID.
     *
     * ex: state.pageValidity = {
     *      1:0:1 : false,
     *      ...
     * }
     *
     * This mutation is called everytime there is a
     * new page set.
     *
     * @param {*} state automatically supplied by vuex
     * @param {*} page not needed, but provided by action
     */
    setNodeValidity(state, page) {
        if (state.page &&
            typeof state.page.webNodes === Object &&
            state.page.webNodes !== null) {
            state.pageValidity = {}; // must reset the page validity each time page changes
            Object.keys(state.page.webNodes).forEach((nodeId) => {
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
     */
    updateWebNode(state, newWebNode) {
        // update the validity of the node
        this._vm.$set(state.pageValidity, newWebNode.nodeId, newWebNode.isValid);

        // may need to update to accommodate arrays; other types
        const deepModify = (obj, key, val) => {
            if (typeof key === 'string') {
                key = key.split('.');
            }
            if (key.length > 1) {
                let newKey = key.shift();
                obj[newKey] = typeof obj[newKey] === 'object' ? obj[newKey] : {};
                deepModify(obj[newKey], key, val);
            } else {
                obj[key[0]] = val;
            }
        };
        
        // only update value if the node is valid
        if (newWebNode.isValid) {
            let currentWebNode = state.page.webNodes[newWebNode.nodeId];
            for (let [key, value] of Object.entries(newWebNode.update)) {
                try {
                    deepModify(currentWebNode, key, value);
                } catch (e) {
                    // catch deep Object modification errors
                    consola.error(`WebNode[type: ${newWebNode.type}, id: ${
                        newWebNode.nodeId}]: Value not updated because the ` +
                        `provided key was invalid. Key: `, key);
                }
            }
        } else {
            consola.error(`WebNode[type: ${newWebNode.type}, id: ${
                newWebNode.nodeId}]: Value not updated because the ` +
                `change was invalid. Valid: `, newWebNode.isValid);
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
        commit('setNodeValidity', page);
    },

    updateWebNode({ commit }, newWebNode) {
        consola.trace(`WebNode[type: ${newWebNode.type}, id: ${
            newWebNode.nodeId}]: Updated value via action: `, newWebNode);
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

// Largely unused. Can be removed after Prototype.
export const getters = {

    // Check individual node validity; *returns function*
    isNodeValid(state, getters) {
        return (nodeId) => 
            // avoid undefined
            state.pageValidity[nodeId] ? true : false
        ;
    },

    // Global page validity method (ex: to enable 'Next Page' button)
    isPageValid(state, getters) {
        if (!state.page) {return false;}
        if (getters.numValidatedNodes !== getters.numWebNodes) {return false;}
        Object.keys(getters.getWebNodes).forEach((key) => {
            if (!state.pageValidity[key]) {return false;}
        });
        return true;
    }
};
