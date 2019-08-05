export const namespaced = true;

export const state = () => ({
    demo: 'Hello world!'
});

export const mutations = {
    setDemo(state, val) {
        state.demo = val;
    }
};

export const actions = {
    messageFromOutside({ commit }, value) {
        consola.trace('Value set via action: ', value);
        commit('setDemo', value);
    },

    proxyToParent({ dispatch }, value) {
        consola.trace('Proxying message:', value);
        dispatch('outbound/messageToParent', value);
    }
};
