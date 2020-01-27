export const namespaced = true;

const addInteractivityId = (state, id) => {
    if (!state[id]) {
        state[id] = { subscribers: [], data: {} };
    }
};

export const state = () => ({
    // only filled at runtime by mutations
});

export const mutations = {
    addSubscriber(state, { id, callback, elementFilter }) {
        addInteractivityId(state, id);
        state[id].subscribers.push({ callback, elementFilter });
    },
    removeSubscriber(state, { id, callback }) {
        if (state[id]) {
            let index = state[id].subscribers.indexOf(callback);
            if (index >= 0) {
                state[id].subscribers.splice(index, 1);
            }
        }
    },
    updateData(state, { id, data }) {
        addInteractivityId(state, id);
        // TODO process changesets, combine filters... WEBP-74
    },
    clear(state) {
        state = {};
    }
};

export const actions = {
    subscribe({ commit }, { id, callback, elementFilter }) {
        commit('addSubscriber', { id, callback, elementFilter });
        // TODO inform subscriber of current state WEBP-74
    },
    unsubscribe({ commit }, { id, callback }) {
        commit('removeSubscriber', { id, callback });
    },
    publish({ commit }, { id, data, callback }) {
        commit('updateData', { id, data });
        // TODO call subscribers WEBP-74
    },
    clear({ commit }) {
        commit('clear');
    }
};

export const getters = {
    getPublishedElement: (state) => (id) => {
        if (state[id]) {
            return state[id].data;
        } else {
            return null;
        }
    }
};

