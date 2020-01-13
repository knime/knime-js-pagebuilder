import { setProp } from '../src/util/nestedProperty';

export const namespaced = true;

export const state = () => ({
    page: null,
    resourceBaseUrl: '',
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

        /* The `pageValidity` object stores the valid state of all webNodes in the page as an key/value pair.
         *
         * Boolean isValid values for each node are stored with a key of the corresponding nodeID.
         *
         * ex: state.pageValidity = {
         *      1:0:1 : false,
         *      ...
         * }
         *
         * In order to make these properties reactive, they have to be initialized once using `Vue.set` whenever
         * the page changes.
         */
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
        const validatingMessageId = 'validatingMessage';
        let notification = {
            message: 'Validating views...',
            type: 'info',
            id: validatingMessageId,
            autoRemove: false
        };
        dispatch('notification/show', { notification }, { root: true });

        let validityPromises = Object.values(state.pageValidators)
            .map(getter => getter());

        let validity = await Promise.all(validityPromises).then((validities) => {
            let invalidViews = [];
            let viewValidities = validities.reduce((obj, nodeResp) => {
                if (!(obj[nodeResp.nodeId] = nodeResp.isValid)) {
                    invalidViews.push(nodeResp.nodeId);
                }
                return obj;
            }, {});
            if (invalidViews.length > 0) {
                throw new Error(`${invalidViews.length} views invalid (${invalidViews.join(', ')})`);
            }
            return viewValidities;
        }).catch((e) => {
            dispatch('notification/remove', { id: validatingMessageId }, { root: true });
            consola.error(`Page validation failed: ${e}`);
            throw new Error(`Page validation failed.`);
        });
        return validity;
    }
};
