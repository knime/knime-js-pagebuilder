export const namespaced = true;

export const state = () => ({
    viewState: null,
    page: null,
    resourceBaseUrl: ''
});

export const mutations = {
    setViewState(state, viewState) {
        state.viewState = viewState;
    },

    setPage(state, page) {
        state.page = page;
    },

    setResourceBaseUrl(state, resourceBaseUrl) {
        state.resourceBaseUrl = resourceBaseUrl;
    }
};

export const actions = {
    setViewState({ commit }, { viewState }) {
        consola.trace('PageBuilder: Set state via action:', viewState);
        commit('setViewState', viewState);
    },

    setPage({ commit }, { page }) {
        consola.trace('PageBuilder: Set page via action:', page);
        commit('setPage', page);
    },

    setResourceBaseUrl({ commit }, { resourceBaseUrl }) {
        consola.trace('PageBuilder: Set resourceBaseUrl via action:', resourceBaseUrl);
        commit('setResourceBaseUrl', resourceBaseUrl);
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
