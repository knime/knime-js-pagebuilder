export const namespaced = true;

export const state = () => ({
    viewState: null,
    page: null
});

export const mutations = {
    setViewState(state, viewState) {
        state.viewState = viewState;
    },

    setPage(state, page) {
        state.page = page;
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

    
    // only for PageBuilder-internal usage
    nextPage({ dispatch }) {
        consola.trace('PageBuilder: Proxying call for next page');
        dispatch('outbound/nextPage');
    },

    previousPage({ dispatch }) {
        consola.trace('PageBuilder: Proxying call for previous page');
        dispatch('outbound/previousPage');
    }
};
