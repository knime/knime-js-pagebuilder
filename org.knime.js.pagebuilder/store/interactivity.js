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
            subscribers: [] // they will get notified when data changes
            
        };
    }
    if (!subscriberOnly && !state[id].data) {
        state[id].data = { // keeps the current data to be accessed on demand by getPublishedElement()
            elements: [] // data always consists of at least an elements array
        };
    }
};

const getRelevantElements = (state, { id, filterIds, changedIds }) => {
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

    for (let el of curData.elements) {
        // only consider first unnamed element for added rows
        if (typeof el.id === 'undefined') {
            let curRows = el.rows || [];
            addedRows = rowsToAdd.filter((row) => !curRows.includes(row));
            el.rows = curRows.concat(addedRows);
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
    let modified = Boolean(removedRows.length + addedRows.length + partialRemovedRows.length + partialAddedRows.length);
    if (modified) {
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
    // determine if we need to do something
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
                // find the existing element with the same id, if it exists
                let matched = state[id].data.elements.filter(existingElement => element.id === existingElement.id);
                // if element could not be found or the elements differ, add current id to list of changed ids
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
                    payload = getRelevantElements(state, {
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

const concatenateRowsFromDataElement = function (dataElement) {
    let rows = [];
    if (dataElement && dataElement.elements) {
        dataElement.elements.forEach((sourceElement) => {
            if (sourceElement.rows) {
                rows = rows.concat(sourceElement.rows);
            }
        });
    }
    return rows;
};

const mapSelectionEventSource = function (changeSet, { addedRows, removedRows, mapping, curElementTarget }) {
    let curRowsTarget = concatenateRowsFromDataElement(curElementTarget);
    // determine mapped added rows
    changeSet.added = [];
    addedRows.forEach((addedRow) => {
        if (mapping[addedRow]) {
            let addedNotExisting = mapping[addedRow].filter((row) => !curRowsTarget.includes(row));
            changeSet.added = changeSet.added.concat(addedNotExisting);
        }
    });
    
    // determine mapped removed rows
    changeSet.removed = [];
    removedRows.forEach((removedRow) => {
        if (mapping[removedRow]) {
            let removedExisting = mapping[removedRow].filter((row) => curRowsTarget.includes(row));
            changeSet.removed = changeSet.removed.concat(removedExisting);
        }
    });
};

const mapSelectionEventTarget = function (changeSet,
    { mapping, addedRows, removedRows, curElementSource, curElementTarget }) {
    let curRowsSource = concatenateRowsFromDataElement(curElementSource);
    let curRowsTarget = concatenateRowsFromDataElement(curElementTarget);
    
    let mappedPartial = [];
    changeSet.added = [];
    changeSet.removed = [];
    for (let row in mapping) {
        let include = mapping[row].every((mappedRow) => curRowsTarget.includes(mappedRow));
        let partial = mapping[row].some((mappedRow) => curRowsTarget.includes(mappedRow));
        if (curElementTarget && curElementTarget.partial) {
            partial = partial || mapping[row].some((mappedRow) => curElementTarget.partial.includes(mappedRow));
        }
        let includeAdded = mapping[row].some((mappedRow) => addedRows.includes(mappedRow));
        let includeRemoved = mapping[row].some((mappedRow) => removedRows.includes(mappedRow));
        if (include && includeAdded && !curRowsSource.includes(row)) {
            changeSet.added.push(row);
        }
        if (!include && includeRemoved && curRowsSource.includes(row)) {
            changeSet.removed.push(row);
        }
        if (!include && partial) {
            mappedPartial.push(row);
        }
    }

    let curPartialRowsSource = [];
    if (curElementSource && curElementSource.partial) {
        curPartialRowsSource = curElementSource.partial;
    }
    changeSet.partialAdded = mappedPartial.filter((row) => !curPartialRowsSource.includes(row));
    changeSet.partialRemoved = curPartialRowsSource.filter((row) => !mappedPartial.includes(row));
};

const mapSelectionEvent = function (data, { mapping, sourceToTarget, curElementSource, curElementTarget }) {
    if (!data || !data.changeSet) {
        throw new Error('Selection event could not be mapped because no change set was present.');
    }
    let mappedData = {
        selectionMethod: 'selection',
        changeSet: {}
    };
    let addedRows = [];
    if (data.changeSet && data.changeSet.added) {
        addedRows = data.changeSet.added;
    }
    let removedRows = [];
    if (data.changeSet && data.changeSet.removed) {
        removedRows = data.changeSet.removed;
    }
    if (data.changeSet && data.changeSet.partialRemoved) {
        data.changeSet.partialRemoved.forEach((row) => {
            if (!addedRows.includes(row)) {
                removedRows.push(row);
            }
        });
    }
    if (sourceToTarget) {
        mapSelectionEventSource(mappedData.changeSet, {
            addedRows,
            removedRows,
            mapping,
            curElementTarget
        });
    } else {
        mapSelectionEventTarget(mappedData.changeSet, {
            mapping,
            addedRows,
            removedRows,
            curElementSource,
            curElementTarget
        });
    }

    // sanitize changeSet
    if (mappedData.changeSet.added && mappedData.changeSet.added.length < 1) {
        delete mappedData.changeSet.added;
    }
    if (mappedData.changeSet.removed && mappedData.changeSet.removed.length < 1) {
        delete mappedData.changeSet.removed;
    }
    if (mappedData.changeSet.partialAdded && mappedData.changeSet.partialAdded.length < 1) {
        delete mappedData.changeSet.partialAdded;
    }
    if (mappedData.changeSet.partialRemoved && mappedData.changeSet.partialRemoved.length < 1) {
        delete mappedData.changeSet.partialRemoved;
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
        translator.targetIDs.forEach((targetId) => {
            handleSelectionTranslatorEvent({ dispatch, getters }, {
                translatorId,
                data,
                translator,
                targetId,
                sourceToTarget: true,
                skipCallback: translatorCallback
            });
        });
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
            let relevantElements = getRelevantElements(state, { id, filterIds: elementFilter });
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
        translator.targetIDs.forEach((targetId) => {
            subscribeSelectionTargetTranslator({ dispatch, getters },
                { translator, translatorId, handlerId: targetId });
        });
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
