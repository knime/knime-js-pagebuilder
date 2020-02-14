export const namespaced = true;

/**
 * This store is actually not used like a Vuex store since it doesn't use the reactivity features.
 * We decided to not use them because subscribers need a changeSet which will already be provided by all code calling
 * the updateData() action. So we simply forward it to the subscribers instead of generating a new changeSet.
 * That means this store is more a pubsub service wrapped in a store to provide a streamlined API.
 */

const addInteractivityId = (state, { id, subscriberOnly }) => {
    if (!state[id]) {
        state[id] = { // we don't need reactivity, so no need to use Vue.set()
            subscribers: [] // subscribers will get notified when data changes
            
        };
    }
    if (!subscriberOnly && !state[id].data) {
        state[id].data = { // keeps the current data to be accessed on demand by getPublishedElement()
            elements: [] // data always consists of at least an elements array
        };
    }
};

const createRelevantElements = (state, { id, filterIds, changedIds }) => {
    let data;
    if (state[id]) {
        data = state[id].data;
    }
    if (!data || !filterIds) {
        return data;
    }
    if (changedIds) {
        if (!filterIds.some((filterId) => changedIds.includes(filterId))) {
            // if nothing relevant changed we don't return anything
            return null;
        }
    }
    let relevantElements = data.elements.filter((value) => filterIds.includes(value.id));
    return { selectionMethod: data.selectionMethod, elements: relevantElements };
};

const removeRows = (state, { id, rowsToRemove }) => {
    let removedRows = [];
    let curData = state[id].data;
    let i = curData.elements.length;
    while (i--) {
        let curRows = curData.elements[i].rows || [];
        // filter rows of current element according to removed rows
        let filteredRows = curRows.filter((row) => !rowsToRemove.includes(row));
        // determine actually removed rows
        removedRows = removedRows.concat(rowsToRemove.filter((row) => curRows.includes(row)));
        if (filteredRows.length < 1) {
            // remove element if it contains no more rows
            curData.elements.splice(i, 1);
        } else {
            curData.elements[i].rows = filteredRows;
        }
    }
    return removedRows;
};

const removePartialRows = (state, { id, rowsToRemove }) => {
    let removedRows = [];
    let curData = state[id].data;
    let filteredPartial = curData.partial.filter((row) => !rowsToRemove.includes(row));
    removedRows = rowsToRemove.filter((row) => curData.partial.includes(row));
    if (filteredPartial.length < 1) {
        // remove element if it contains no more partial rows
        delete curData.partial;
    } else {
        curData.partial = filteredPartial;
    }
    return removedRows;
};

const addRows = (state, { id, rowsToAdd }) => {
    let addedRows = [];
    let curData = state[id].data;
    if (!curData.elements || curData.elements.length < 1) {
        curData.elements = [{ type: 'row', rows: [] }];
    }
    for (let i = 0; i < curData.elements.length; i++) {
        // only consider first unnamed element for added rows
        if (typeof curData.elements[i].id === 'undefined') {
            let curRows = curData.elements[i].rows || [];
            addedRows = rowsToAdd.filter((row) => !curRows.includes(row));
            curData.elements[i].rows = curRows.concat(addedRows);
            break;
        }
    }
    return addedRows;
};

const addPartialRows = (state, { id, rowsToAdd }) => {
    let addedRows = [];
    let curData = state[id].data;
    let curPartial = curData.partial || [];
    addedRows = rowsToAdd.filter((row) => !curPartial.includes(row));
    if (!curData.partial && addedRows.length > 0) {
        curData.partial = [];
    }
    curData.partial = curData.partial.concat(addedRows);
    return addedRows;
};

const assembleChangePayload = ({ data, addedRows, removedRows, partialAddedRows, partialRemovedRows }) => {
    if (removedRows.length + addedRows.length + partialRemovedRows.length + partialAddedRows.length) {
        let toPublish = { selectionMethod: data.selectionMethod, changeSet: {} };
        if (removedRows.length) {
            toPublish.changeSet.removed = removedRows;
        }
        if (addedRows.length) {
            toPublish.changeSet.added = addedRows;
        }
        if (partialRemovedRows.length) {
            toPublish.changeSet.partialRemoved = partialRemovedRows;
        }
        if (partialAddedRows.length) {
            toPublish.changeSet.partialAdded = partialAddedRows;
        }
        if (typeof data.mappedEvent !== 'undefined') {
            toPublish.mappedEvent = data.mappedEvent;
        }
        return toPublish;
    } else {
        return null;
    }
};

const processChangeset = (state, { id, data }) => {
    let added = data.changeSet.added && data.changeSet.added.length;
    let partialAdded = data.changeSet.partialAdded && data.changeSet.partialAdded.length;
    // determine if
    if (!state[id] || !state[id].data) {
        if (added || partialAdded) {
            addInteractivityId(state, { id });
            state[id].data.selectionMethod = data.selectionMethod;
            if (partialAdded) {
                state[id].data.partial = [];
            }
        } else {
            // no element exists and nothing to add
            return null;
        }
    }
    let removed = data.changeSet.removed && data.changeSet.removed.length;
    let partialRemoved = data.changeSet.partialRemoved && data.changeSet.partialRemoved.length;
    let curData = state[id].data;
    
    // handle deleted rows
    let allRemovedRows = [];
    if (curData && curData.elements && removed) {
        allRemovedRows = removeRows(state, { id, rowsToRemove: data.changeSet.removed });
    }
    let allRemovedPartial = [];
    if (curData && curData.partial && partialRemoved) {
        allRemovedPartial = removePartialRows(state, { id, rowsToRemove: data.changeSet.partialRemoved });
    }
    
    // handle added rows
    let allAddedRows = [];
    if (added) {
        allAddedRows = addRows(state, { id, rowsToAdd: data.changeSet.added });
    }
    let allAddedPartial = [];
    if (partialAdded) {
        allAddedPartial = addPartialRows(state, { id, rowsToAdd: data.changeSet.partialAdded });
    }

    // build payload to send to subscribers
    return assembleChangePayload({
        data,
        addedRows: allAddedRows,
        removedRows: allRemovedRows,
        partialAddedRows: allAddedPartial,
        partialRemovedRows: allRemovedPartial
    });
};

const determineChangedIds = (state, { id, data }) => {
    let changedIds = [];
    
    data.elements.forEach((element) => {
        if (typeof element.id !== 'undefined') {
            if (state[id] && state[id].data) {
                // find the existing element with the same id, if exists
                let matched = state[id].data.elements.filter(existingElement => element.id === existingElement.id);
                // if element could not be found or the elements differ add current id to list of changed ids
                if (!matched.length || JSON.stringify(element) !== JSON.stringify(matched[0])) {
                    changedIds.push(element.id);
                }
            } else {
                // nothing published yet
                changedIds.push(element.id);
            }
        }
    });
    
    return changedIds;
};

const notifySubscribers = (state, { id, data, skipCallback, changedIds }) => {
    if (state[id]) {
        state[id].subscribers.forEach((subscriber) => {
            if (!skipCallback || subscriber.callback !== skipCallback) {
                let payload = data;
                if (changedIds) {
                    payload = createRelevantElements(state, {
                        id,
                        filterIds: subscriber.filterIds,
                        changedIds
                    });
                }
                if (payload) {
                    subscriber.callback(id, payload);
                }
            }
        });
    }
};

// eslint-disable-next-line complexity
const mapSelectionEvent = function (data, { mapping, sourceToTarget, curElementSource, curElementTarget }) {

    // FIXME: I am too complex and need refactoring
    
    if (!data || !data.changeSet) {
        return;
    }
    let mappedData = {
        selectionMethod: 'selection',
        changeSet: {}
    };
    let curRowsSource = [];
    if (curElementSource && curElementSource.elements) {
        for (let i = 0; i < curElementSource.elements.length; i++) {
            if (curElementSource.elements[i].rows) {
                curRowsSource = curRowsSource.concat(curElementSource.elements[i].rows);
            }
        }
    }
    let curPartialRowsSource = [];
    if (curElementSource && curElementSource.partial) {
        curPartialRowsSource = curElementSource.partial;
    }
    let curRowsTarget = [];
    if (curElementTarget && curElementTarget.elements) {
        for (let i = 0; i < curElementTarget.elements.length; i++) {
            if (curElementTarget.elements[i].rows) {
                curRowsTarget = curRowsTarget.concat(curElementTarget.elements[i].rows);
            }
        }
    }
    let addedRows = [];
    if (data.changeSet && data.changeSet.added) {
        addedRows = data.changeSet.added;
    }
    let removedRows = [];
    if (data.changeSet && data.changeSet.removed) {
        removedRows = data.changeSet.removed;
    }
    if (data.changeSet && data.changeSet.partialRemoved) {
        for (let i = 0; i < data.changeSet.partialRemoved.length; i++) {
            if (addedRows.indexOf(data.changeSet.partialRemoved[i]) < 0) {
                removedRows.push(data.changeSet.partialRemoved[i]);
            }
        }
    }
    let mappedAdded = []; let mappedRemoved = [];
    let partialAdded = []; let partialRemoved = [];
    if (sourceToTarget) {
        for (let row = 0; row < addedRows.length; row++) {
            if (mapping[addedRows[row]]) {
                let addedNotExisting = mapping[addedRows[row]].filter((row) => curRowsTarget.indexOf(row) < 0);
                mappedAdded = mappedAdded.concat(addedNotExisting);
            }
        }
        for (let row = 0; row < removedRows.length; row++) {
            if (mapping[removedRows[row]]) {
                let removedExisting = mapping[removedRows[row]].filter((row) => curRowsTarget.indexOf(row) > -1);
                mappedRemoved = mappedRemoved.concat(removedExisting);
            }
        }
    } else {
        let mappedPartial = [];
        for (let row in mapping) {
            let include = mapping[row].every((mappedRow) => curRowsTarget.indexOf(mappedRow) > -1);
            let partial = mapping[row].some((mappedRow) => curRowsTarget.indexOf(mappedRow) > -1);
            if (curElementTarget && curElementTarget.partial) {
                partial |= mapping[row].some((mappedRow) => curElementTarget.partial.indexOf(mappedRow) > -1);
            }
            let includeAdded = mapping[row].some((mappedRow) => addedRows.indexOf(mappedRow) > -1);
            let includeRemoved = mapping[row].some((mappedRow) => removedRows.indexOf(mappedRow) > -1);
            /* if (include) {
                mappedRows.push(row);
            } else if (partial) {
                partialRows.push(row);
            } */
            if (include && includeAdded && curRowsSource.indexOf(row) < 0) {
                mappedAdded.push(row);
            }
            if (!include && includeRemoved && curRowsSource.indexOf(row) > -1) {
                mappedRemoved.push(row);
            }
            if (!include && partial) {
                mappedPartial.push(row);
            }
        }
        partialAdded = mappedPartial.filter((row) => curPartialRowsSource.indexOf(row) < 0);
        partialRemoved = curPartialRowsSource.filter((row) => mappedPartial.indexOf(row) < 0);
    }
    let createChangeset = mappedAdded.length + mappedRemoved.length + partialAdded.length + partialRemoved.length;
    if (createChangeset) {
        mappedData.changeSet = {};
        if (mappedAdded.length > 0) {
            mappedData.changeSet.added = mappedAdded;
        }
        if (mappedRemoved.length > 0) {
            mappedData.changeSet.removed = mappedRemoved;
        }
        if (partialAdded.length > 0) {
            mappedData.changeSet.partialAdded = partialAdded;
        }
        if (partialRemoved.length > 0) {
            mappedData.changeSet.partialRemoved = partialRemoved;
        }
    }
    return mappedData;
};

const handleSelectionTranslatorEvent = function ({ dispatch, getters },
    { translatorId, data, translator, targetId, sourceToTarget, skipCallback }) {
    let mappedData = data;
    if (!translator.forward && translator.mapping) {
        let curElementSource = getters.getPublishedData(`selection-${translator.sourceID}`);
        let curElementTarget = getters.getPublishedData(`selection-${targetId}`);
        mappedData = mapSelectionEvent(data,
            { mapping: translator.mapping, sourceToTarget, curElementSource, curElementTarget });
        if (!mappedData) {
            return;
        }
    }
    mappedData.mappedEvent = translatorId;
    let id = sourceToTarget ? `selection-${targetId}` : `selection-${translator.sourceID}`;
    dispatch('publish', { id, data: mappedData, skipCallback });
};

const subscribeSelectionSourceTranslator = function ({ dispatch, getters }, { translatorId, translator }) {
    let translatorCallback = (id, data) => {
        if (!data || data.mappedEvent === translatorId) {
            return;
        }
        for (let i = 0; i < translator.targetIDs.length; i++) {
            handleSelectionTranslatorEvent({ dispatch, getters }, {
                translatorId,
                data,
                translator,
                targetId: translator.targetIDs[i],
                sourceToTarget: true,
                skipCallback: translatorCallback
            });
        }
    };
    dispatch('subscribe', { id: `selection-${translator.sourceID}`, callback: translatorCallback });
};

const subscribeSelectionTargetTranslator = function ({ dispatch, getters }, { translator, translatorId, handlerId }) {
    let translatorCallback = (id, data) => {
        if (!data || data.mappedEvent === translatorId) {
            return;
        }
        handleSelectionTranslatorEvent({ dispatch, getters }, {
            translatorId,
            data,
            translator,
            targetId: handlerId,
            sourceToTarget: false,
            skipCallback: translatorCallback
        });
    };
    dispatch('subscribe', { id: `selection-${handlerId}`, callback: translatorCallback });
};

export const state = () => ({
    // filled at runtime by mutations
});

export const mutations = {
    addSubscriber(state, { id, callback, elementFilter }) {
        addInteractivityId(state, { id, subscriberOnly: true });
        state[id].subscribers.push({ callback, filterIds: elementFilter });
    },
    removeSubscriber(state, { id, callback }) {
        if (state[id]) {
            let index = state[id].subscribers.findIndex((subscriber) => subscriber.callback === callback);
            if (index >= 0) {
                state[id].subscribers.splice(index, 1);
            }
            // remove state if no data and no subscribers
            if (state[id].subscribers.length === 0 && !state[id].data) {
                delete state[id];
            }
        }
    },
    updateData(state, { id, data }) {
        addInteractivityId(state, { id });
        state[id].data = data;
    },
    clear(state) {
        Object.keys(state).forEach(id => {
            delete state[id];
        });
    }
};

export const actions = {
    subscribe({ commit, state }, { id, callback, elementFilter }) {
        // add subscriber to store
        commit('addSubscriber', { id, callback, elementFilter });
        // inform subscriber about current state of channel
        if (state[id].data) {
            let relevantElements = createRelevantElements(state, { id, filterIds: elementFilter });
            if (!relevantElements) {
                relevantElements = {};
            }
            relevantElements.reevaluate = true;
            callback(id, relevantElements);
        }
    },
    unsubscribe({ commit }, { id, callback }) {
        commit('removeSubscriber', { id, callback });
    },
    publish({ commit, state }, { id, data, skipCallback }) {
        if (data.changeSet) {
            // row-based change set handling
            let publish = processChangeset(state, { id, data });
            if (publish) {
                notifySubscribers(state, { id, data: publish, skipCallback });
            }
        } else {
            // non row-based update
            if (!data.elements) {
                throw new Error('Invalid payload for publishing interactivity event');
            }
            let changedIds = determineChangedIds(state, { id, data });
            if (changedIds.length < 1) {
                return;
            }
            if (!state[id] || !state[id].data) {
                addInteractivityId(state, { id });
            }
            commit('updateData', { id, data });
            notifySubscribers(state, { id, data, skipCallback, changedIds });
        }
    },
    registerSelectionTranslator({ dispatch, commit, getters }, { translatorId, translator }) {
        // check non-existing IDs
        if (!translator.sourceID || !translator.targetIDs) {
            return;
        }
        // check if translator is forwarding events or contains mapping
        if (!translator.forward && !translator.mapping) {
            return;
        }
        // subscribe translators in both directions
        subscribeSelectionSourceTranslator({ dispatch, getters }, { translatorId, translator });
        for (let i = 0; i < translator.targetIDs.length; i++) {
            subscribeSelectionTargetTranslator({ dispatch, getters },
                { translator, translatorId, handlerId: translator.targetIDs[i] });
        }
    },
    clear({ commit }) {
        commit('clear');
    }
};

export const getters = {
    getPublishedData: (state) => (id) => {
        if (state[id] && state[id].data) {
            /* since this method is accessed directly from the iframes (without postMessage), we need to clone the
            requested state to avoid views directly modifying it */
            return JSON.parse(JSON.stringify(state[id].data));
        } else {
            return null;
        }
    }
};

