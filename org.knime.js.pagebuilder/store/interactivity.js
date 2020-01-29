/* eslint-disable complexity */
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

const createRelevantElements = (state, { id, filter, changedIds }) => {
    let data;
    if (state[id]) {
        data = state[id].data;
    }
    if (!data || !filter) {
        return data;
    }
    if (changedIds) {
        let relevantChanged = false;
        for (let f = 0; f < filter.length; f++) {
            if (changedIds.indexOf(filter[f] >= 0)) {
                relevantChanged = true;
                break;
            }
        }
        if (!relevantChanged) {
            return null;
        }
    }
    let relevantElements = data.elements.filter((value) => typeof value.id !== 'undefined' &&
        filter.indexOf(value.id) >= 0);
    return { selectionMethod: data.selectionMethod, elements: relevantElements };
};

const notifySubscribers = (state, { id, data, skip, changedIds }) => {
    if (state[id]) {
        for (let i = 0; i < state[id].subscribers.length; i++) {
            let subscriber = state[id].subscribers[i];
            if (skip && subscriber.callback === skip) {
                continue;
            }
            let payload = data;
            if (changedIds) {
                payload = createRelevantElements(state, {
                    id,
                    filter: subscriber.filter,
                    changedIds
                });
            }
            if (payload) {
                subscriber.callback(payload);
            }
        }
    }
};

export const state = () => ({
    // filled at runtime by mutations
});

export const mutations = {
    addSubscriber(state, { id, callback, elementFilter }) {
        addInteractivityId(state, id);
        state[id].subscribers.push({ callback, filter: elementFilter });
    },
    removeSubscriber(state, { id, callback }) {
        if (state[id]) {
            let index = state[id].subscribers.findIndex((subscriber) => subscriber.callback === callback);
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
    subscribe({ commit, state }, { id, callback, elementFilter }) {
        // add subscriber to store
        commit('addSubscriber', { id, callback, elementFilter });

        // inform subscriber about current state of channel
        if (state[id].data) {
            let relevantElements = createRelevantElements(state, { id, filter: elementFilter });
            if (!relevantElements) {
                relevantElements = {};
            }
            relevantElements.reevaluate = true;
            callback(relevantElements);
        }
    },
    unsubscribe({ commit }, { id, callback }) {
        commit('removeSubscriber', { id, callback });
    },
    publish({ commit, state }, { id, data, callback }) {
        let exists = state[id] && state[id].data;
        // row-based changeSet handling
        if (data.changeSet) {
            let added = data.changeSet.added && data.changeSet.added.length > 0;
            let partialAdded = data.changeSet.partialAdded && data.changeSet.partialAdded.length > 0;
            if (!exists) {
                if (added || partialAdded) {
                    addInteractivityId(state, id);
                    state[id].data.selectionMethod = data.selectionMethod;
                    if (partialAdded) {
                        state[id].data.partial = [];
                    }
                } else {
                    // no element exists and nothing to add
                    return;
                }
            }
            let removed = data.changeSet.removed && data.changeSet.removed.length > 0;
            let partialRemoved = data.changeSet.partialRemoved && data.changeSet.partialRemoved.length > 0;
            let curElement = state[id].data;
            let allRemovedRows = [];
            let allAddedRows = [];
            let allRemovedPartial = [];
            let allAddedPartial = [];
            if (curElement && curElement.elements && removed) {
                let i = curElement.elements.length;
                while (i--) {
                    let curRows = curElement.elements[i].rows || [];
                    // filter rows of current element according to removed rows
                    let filteredRows = curRows.filter((row) => data.changeSet.removed.indexOf(row) < 0);
                    // determine actually removed rows
                    allRemovedRows = allRemovedRows.concat(
                        data.changeSet.removed.filter((row) => curRows.indexOf(row) > -1)
                    );
                    if (filteredRows.length < 1) {
                        // remove element if it contains no more rows
                        curElement.elements.splice(i, 1);
                    } else {
                        curElement.elements[i].rows = filteredRows;
                    }
                }
            }
            if (curElement && curElement.partial && partialRemoved) {
                let filteredPartial = curElement.partial.filter(
                    (row) => data.changeSet.partialRemoved.indexOf(row) < 0
                );
                allRemovedPartial = data.changeSet.partialRemoved.filter((row) => curElement.partial.indexOf(row) > -1);
                if (filteredPartial.length < 1) {
                    delete curElement.partial;
                } else {
                    curElement.partial = filteredPartial;
                }
            }
            if (added) {
                if (curElement.elements.length < 1) {
                    curElement.elements = [{ type: 'row', rows: [] }];
                }
                for (let i = 0; i < curElement.elements.length; i++) {
                    // only consider first unnamed element for added rows
                    if (typeof curElement.elements[i].id === 'undefined') {
                        let curRows = curElement.elements[i].rows || [];
                        allAddedRows = data.changeSet.added.filter((row) => curRows.indexOf(row) < 0);
                        curElement.elements[i].rows = curRows.concat(allAddedRows);
                        break;
                    }
                }
            }
            if (partialAdded) {
                let curPartial = curElement.partial || [];
                allAddedPartial = data.changeSet.partialAdded.filter((row) => curPartial.indexOf(row) < 0);
                if (!curElement.partial && allAddedPartial.length > 0) {
                    curElement.partial = [];
                }
                curElement.partial = curElement.partial.concat(allAddedPartial);
            }
            if (allRemovedRows.length + allAddedRows.length + allRemovedPartial.length + allAddedPartial.length) {
                let toPublish = { selectionMethod: data.selectionMethod, changeSet: {} };
                if (allRemovedRows.length) {
                    toPublish.changeSet.removed = allRemovedRows;
                }
                if (allAddedRows.length) {
                    toPublish.changeSet.added = allAddedRows;
                }
                if (allRemovedPartial.length) {
                    toPublish.changeSet.partialRemoved = allRemovedPartial;
                }
                if (allAddedPartial.length) {
                    toPublish.changeSet.partialAdded = allAddedPartial;
                }
                if (typeof data.mappedEvent !== 'undefined') {
                    toPublish.mappedEvent = data.mappedEvent;
                }
                notifySubscribers(state, { id, data: toPublish, skip: callback });
            }
        } else {
            // non row-based update
            let changedIds = [];
            for (let i = 0; i < data.elements.length; i++) {
                if (typeof data.elements[i].id !== 'undefined') {
                    let changed = true;
                    if (exists) {
                        let c = state[id].data;
                        for (let j = 0; j < c.elements.length; j++) {
                            if (data.elements[i].id == c.elements[j].id) {
                                // TODO check this properly
                                changed = data.elements[i] === c.elements[j];
                                break;
                            }
                        }
                    }
                    if (changed) {
                        changedIds.push(data.elements[i].id);
                    }
                }
                if (changedIds.length < 1) {
                    return;
                }
                state[id].data = data;
                notifySubscribers(state, { id, data, skip: callback, changedIds });
            }
        }
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

