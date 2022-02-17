/**
 * This store controls the global alert behavior for the PageBuilder. The alert provided with the @see showAlert action
 * will be displayed in top-level, @see AlertGlobal component. Local events can be triggered on removal of the global
 * alert from this store by providing a callback function when registering the alert.
 */
export const namespaced = true;

export const state = () => ({
    alert: null
});

export const mutations = {

    showAlert(state, alert) {
        state.alert = alert;
    },

    closeAlert(state) {
        state.alert = null;
    }
};

export const actions = {

    showAlert({ commit }, alert) {
        commit('showAlert', alert);
    },

    closeAlert({ commit, state }, remove) {
        if (state.alert.callback) {
            state.alert.callback(remove);
        }
        commit('closeAlert');
    }
};
