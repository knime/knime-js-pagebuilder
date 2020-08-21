/**
 * This store controls the global alert behavior for the PageBuilder. The alert provided with the @see showAlert action
 * will be displayed in top-level, @see AlertGlobal component. Local events can be triggered on removal of the global
 * alert from this store by providing a callback function when registering the alert.
 */
export const namespaced = true;

export const state = () => ({
    activeAlert: null
});

export const mutations = {

    showAlert(state, alert) {
        state.activeAlert = alert;
    },

    closeAlert(state) {
        state.activeAlert = null;
    }
};

export const actions = {

    showAlert({ commit }, alert) {
        commit('showAlert', alert);
    },

    closeAlert({ commit, state }, remove) {
        if (state.activeAlert.callback) {
            state.activeAlert.callback(remove);
        }
        commit('closeAlert');
    }
};

export const getters = {
    currentAlert: state => state.activeAlert
};
