export const namespaced = true;

/**
 * This store is actually not used like a Vuex store since it doesn't use the reactivity features.
 * We decided to not use them because subscribers need a changeSet which will already be provided by all code calling
 * the updateData() action. So we simply forward it to the subscribers instead of generating a new changeSet.
 * That means this store is more a pubsub service wrapped in a store to provide a streamlined API.
 */

// adding and initializing a new id (pub/sub topic or channel id) to the store
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

/*
 * Some views can only be notified about parts (elements) of an event, these need to be extracted prior to sending.
 * Also it is possible that only parts of an event payload have changed, that a particular view doesn't care about,
 * in this case, the view does not need to be notified about changes at all.
*/
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

// notifying subscribers with respect to only inform about changed and relevant elements of published data
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

/*
 * Returns an array of element ids, which contain changes compared to the current published data belonging to the same
 * pub/sub channel. Returns an empty array for no changes.
 */
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

/*
 * The next section is for changeset handling in interactivity events. Changesets only apply to selection events.
 * A changeset basically contains of an array of added rows and an array for removed rows.
 * Changesets are used to enhance performance and limit the payload size for selection events.
*/

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
/*
 * END selection changeset handling section
 */

/*
 * The next section of methods is concerned with selection translator handling and selection mapping.
 *
 * Selection translators always contain one source id and 1 to n target ids. To facilitate the mapping a subscriber
 * is added to all source and target ids respectively and events can flow in both directions.
 * There is two types of selection translators, a basic one which only forwards selection events from one
 * channel to another one (1:1 row mapping) and selection translators which contain a mapping.
 *
 * A mapping consists of a number of (source) row ids which are each mapped to 1 to n (target) row ids. In the case of
 * a mapping with more than 1 target ids it is possible (if there is an event on a target), that only part of a source
 * row id are selected or unselected. For this case 'partialAdded' and 'partialRemoved' arrays are added to the
 * resulting changeset. There can't be partial selection on a target, unless the target is itself connected as a source
 * of another selection translator mapping.
 */

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

// creating a mapping for a changeset for an event that flows source to target
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

// creating a mapping for a changeset for an event that flows target to source, which can lead to partial selection
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

// create a mapping for a selection event with a changeSet
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

/*
 * Generic callback method which is used to subscribe a selection translator. Determines a mapped changeset and
 * publishes those changes to the other side of the translator.
 */
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

// Callback method for the source side of a selection translator, forwards selection events to all targets
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

// Callback method for one target of a selection translator. Forwards selection events to the source.
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
/*
 * END selection translation handling section
 */

/*
 * Following is the Vuex store (and interactivity interface) exports. state, mutations, actions and getters
 */
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
    /**
     * This method is used by interactive filter publishers which have been implemented in Vue (as opposed
     * to legacy implementations which are loaded in iFrames). This method can be used to register a filter
     * with the global interactivity store if it doesn't yet exist, or can update an existing filter with
     * a matching filter id.
     *
     * @param {Object} store_context - provided by Vuex.
     * @param {Object} param
     * @param {String} param.id - the table ID for the provided filter; should be prefixed by "filter-".
     * @param {Object} param.data - the filter data from the calling view.
     * @param {String} param.data.id - the filter id; unique to the calling view.
     * @param {String} [param.callback] - the optional callback to skip when publishing to subscribers.
     * @returns {undefined}
     * @emits 'publish' - Vuex action to publish updated filters to any subscribers.
     */
    updateFilter({ getters, state, dispatch }, { id, data, callback }) {
        let elements = [];
        let foundAndUpdated = false;
        if (state[id] && state[id].data) {
            elements = getters.getPublishedData(id).elements.map(filter => {
                if (data.id === filter.id) {
                    foundAndUpdated = true;
                    return JSON.parse(JSON.stringify(data));
                }
                return filter;
            });
        }
        if (!foundAndUpdated) {
            elements.push(JSON.parse(JSON.stringify(data)));
        }
        dispatch('publish', { id, data: { elements }, callback });
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
