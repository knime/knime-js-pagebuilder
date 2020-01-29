export const namespaced = true;

/**
 * This store is actually not used like a Vuex store since it doesn't use the reactivity features.
 * We decided to not use them because subscribers need a changeSet which will already be provided by all code calling
 * the updateData() action. So we simply forward it to the subscribers instead of generating a new changeSet.
 * That means this store is more a pubsub service wrapped in a store to provide a streamlined API.
 */

const addInteractivityId = (state, id) => {
    if (!state[id]) {
        state[id] = { // we don't need reactivity, so no need to use Vue.set()
            subscribers: [], // subscribers will get notified when data changes
            data: {} // keeps the current data to be accessed on demand by getPublishedElement()
        };
    }
};

export const state = () => ({
    // filled at runtime by mutations
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

