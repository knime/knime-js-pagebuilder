/* eslint-disable max-lines, max-nested-callbacks */
import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/interactivity';

describe('Interactivity store', () => {
    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        jest.resetAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state).toEqual({});
    });

    describe('mutations', () => {
        const subscriberId = 'selection-0.0.9';

        it('add subscriber', () => {
            expect(store.state).toEqual({});
            let payload = { id: subscriberId, callback: jest.fn() };
            store.commit('addSubscriber', payload);
            expect(store.state[payload.id].subscribers.length).toEqual(1);
            expect(store.state[payload.id].subscribers[0]).toEqual({
                callback: payload.callback
            });
            // callback should only be stored
            expect(payload.callback).not.toHaveBeenCalled();

            // subscriber with same id added
            let payload2 = { id: subscriberId, callback: jest.fn(), elementFilter: ['dummy'] };
            store.commit('addSubscriber', payload2);
            expect(store.state[payload2.id].subscribers.length).toEqual(2);
            expect(store.state[payload2.id].subscribers[1]).toEqual({
                callback: payload2.callback,
                filterIds: payload2.elementFilter
            });
            // callback should only be stored
            expect(payload.callback).not.toHaveBeenCalled();
        });

        it('remove subscriber', () => {
            expect(store.state).toEqual({});
            let payload = { id: subscriberId, callback: jest.fn() };
            store.commit('addSubscriber', payload);
            expect(store.state[payload.id].subscribers.length).toEqual(1);
            expect(store.state[payload.id].subscribers[0]).toEqual({
                callback: payload.callback
            });
            store.commit('addSubscriber', payload);
            expect(store.state[payload.id].subscribers.length).toEqual(2);
            expect(store.state[payload.id].subscribers[1]).toEqual({
                callback: payload.callback
            });
            store.commit('removeSubscriber', payload);
            expect(store.state[payload.id].subscribers.length).toEqual(1);
            expect(store.state[payload.id].subscribers[0]).toEqual({
                callback: payload.callback
            });
            store.commit('removeSubscriber', payload);
            expect(store.state).toEqual({});
        });

        it('add and remove subscriber with data present', () => {
            expect(store.state).toEqual({});
            let dataPayload = { id: subscriberId, data: 'dummyData' };
            store.commit('updateData', dataPayload);
            expect(store.state[dataPayload.id].subscribers.length).toEqual(0);
            
            let payload = { id: subscriberId, callback: jest.fn() };
            store.commit('addSubscriber', payload);
            expect(store.state[payload.id].subscribers.length).toEqual(1);
            expect(store.state[payload.id].subscribers[0]).toEqual({
                callback: payload.callback
            });
            store.commit('removeSubscriber', payload);
            expect(store.state[payload.id].subscribers).toBeDefined();
            expect(store.state[payload.id].subscribers.length).toEqual(0);
        });

        it('update data', () => {
            expect(store.state).toEqual({});
            let dataPayload = { id: subscriberId, data: 'wibble' };
            store.commit('updateData', dataPayload);
            expect(store.state[dataPayload.id]).toBeDefined();
            expect(store.state[dataPayload.id].data).toEqual(dataPayload.data);

            // overwrite data
            let dataPayload2 = { id: subscriberId, data: 'wobble' };
            store.commit('updateData', dataPayload2);
            expect(store.state[dataPayload2.id]).toBeDefined();
            expect(store.state[dataPayload2.id].data).toEqual(dataPayload2.data);
        });

        it('clear state', () => {
            expect(store.state).toEqual({});
            let dataPayload = { id: subscriberId, data: 'dummyData' };
            store.commit('updateData', dataPayload);
            expect(store.state[dataPayload.id]).toBeDefined();
            store.commit('clear');
            expect(store.state).toEqual({});
        });
    });

    describe('actions', () => {
        describe('adding subscribers', () => {
            const subscriberId = 'selection-0.0.9';
            const dataId = 'selection-0.0.7';
            const data = { elements: ['dummyData'] };
        
            beforeEach(() => {
                store.commit('updateData', { id: dataId, data });
            });

            it('allows adding a subscriber without elementFilter', () => {
                let payload = { id: subscriberId, callback: jest.fn() };
                store.dispatch('subscribe', payload);
                expect(store.state[payload.id].subscribers.length).toEqual(1);
                expect(store.state[payload.id].subscribers[0]).toEqual({
                    callback: payload.callback,
                    filterIds: payload.elementFilter
                });
                // no data, callback is supposed to not be informed
                expect(payload.callback).not.toHaveBeenCalled();
            });

            it('allows adding a subscriber with elementFilter', () => {
                let payload = { id: subscriberId, callback: jest.fn(), elementFilter: [2] };
                store.dispatch('subscribe', payload);
                expect(store.state[payload.id].subscribers.length).toEqual(1);
                expect(store.state[payload.id].subscribers[0]).toEqual({
                    callback: payload.callback,
                    filterIds: payload.elementFilter
                });
                // no data, callback is supposed to not be informed
                expect(payload.callback).not.toHaveBeenCalled();
            });

            it('informs callback of current state when subscribing', () => {
                let payload = { id: dataId, callback: jest.fn() };
                store.dispatch('subscribe', payload);
                expect(store.state[payload.id].subscribers.length).toEqual(1);
                expect(store.state[payload.id].subscribers[0]).toEqual({
                    callback: payload.callback,
                    filterIds: payload.elementFilter
                });
                // data present, callback is supposed to be informed
                let reData = data;
                reData.reevaluate = true;
                expect(payload.callback).toHaveBeenCalledWith(dataId, reData);
            });
        });

        describe('removing subscribers', () => {
            const id = 'selection-12345-12345-12345';
            const payload = { id, callback: jest.fn(), elementFilter: 2 };
            
            it('allows removing a subscriber', () => {
                store.commit('addSubscriber', payload);
                expect(store.state[payload.id].subscribers.length).toEqual(1);

                store.dispatch('unsubscribe', payload);
                expect(store.state[payload.id]).not.toBeDefined();
            });
            it('allows removing non-existing subscriber', () => {
                store.dispatch('unsubscribe', payload);
                expect(store.state[payload.id]).not.toBeDefined();
            });
        });

        describe('updating filters', () => {
            const id = 'filter-12345-12345-12345';
            const filterId = '0.0.9 Spectre';
            const payload = { id, data: { id: filterId, data: 42 }, callback: jest.fn() };
            
            it('adds a filter if it hasn\'t been added', () => {
                expect(store.state[payload.id]).not.toBeDefined();
                store.dispatch('updateFilter', payload);
                expect(store.state[payload.id].data).toStrictEqual({
                    elements: [{
                        data: 42,
                        id: filterId
                    }]
                });
            });

            it('updates existing filters', () => {
                store.dispatch('updateFilter', payload);
                expect(store.state[payload.id].data).toStrictEqual({
                    elements: [{
                        data: 42,
                        id: filterId
                    }]
                });
                payload.data.data = 13;
                store.dispatch('updateFilter', payload);
                expect(store.state[payload.id].data).toStrictEqual({
                    elements: [{
                        data: 13,
                        id: filterId
                    }]
                });
            });
        });

        describe('publishing data', () => {
            const publishId = '0.0.7 Bond';

            describe('notifies subscribers of changes', () => {
                const filterId = '0.0.8 Bill';
                const filterId2 = '0.0.9 Spectre';
                const minimalData = { elements: [{ id: filterId, data: 42 }] };
                let subscriberCallback = jest.fn();
                let filteredCallback = jest.fn();
                
                beforeEach(() => {
                    let subscriber = { id: publishId, callback: subscriberCallback };
                    store.commit('addSubscriber', subscriber);
                    let filteredSubscriber = { id: publishId, callback: filteredCallback, elementFilter: [filterId] };
                    store.commit('addSubscriber', filteredSubscriber);
                });

                it('notifies registered subscribers', () => {
                    let payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    expect(subscriberCallback).toHaveBeenCalledWith(publishId, minimalData);
                });

                it('notifies with filtered elements', () => {
                    let payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    expect(subscriberCallback).toHaveBeenCalledWith(publishId, minimalData);
                    expect(filteredCallback).toHaveBeenCalledWith(publishId, minimalData);
                });

                it('does not notify on empty filtered elements', () => {
                    let filteredData = JSON.parse(JSON.stringify(minimalData));
                    filteredData.elements[0].id = filterId2;
                    let payload = { id: publishId, data: filteredData };
                    store.dispatch('publish', payload);
                    expect(subscriberCallback).toHaveBeenCalledWith(publishId, filteredData);
                    expect(filteredCallback).not.toHaveBeenCalled();
                });

                it('notifies only relevant elements', () => {
                    // setup
                    let doubleData = JSON.parse(JSON.stringify(minimalData));
                    let secondElement = { id: filterId2, data: 'wibble' };
                    doubleData.elements.push(secondElement);
                    let payload = { id: publishId, data: doubleData };
                    store.dispatch('publish', payload);
                    jest.resetAllMocks();
                    
                    // relevant element changed
                    let filteredData = JSON.parse(JSON.stringify(minimalData));
                    filteredData.elements[0].data = 'wobble';
                    let payload2 = { id: publishId, data: filteredData };
                    store.dispatch('publish', payload2);
                    expect(subscriberCallback).toHaveBeenCalledWith(publishId, filteredData);
                    expect(filteredCallback).toHaveBeenCalledWith(publishId, filteredData);

                    // not relevant element changed
                    let filteredData2 = JSON.parse(JSON.stringify(minimalData));
                    filteredData2.elements[0].id = filterId2;
                    filteredData2.elements[0].data = 'wubble';
                    let payload3 = { id: publishId, data: filteredData2 };
                    store.dispatch('publish', payload3);
                    expect(subscriberCallback).toHaveBeenCalledWith(publishId, filteredData2);
                    expect(filteredCallback).not.toHaveBeenCalledWith();
                });

                it('does not notify on unchanged data', () => {
                    let payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    jest.resetAllMocks();
                    store.dispatch('publish', payload);
                    expect(subscriberCallback).not.toHaveBeenCalled();
                    expect(filteredCallback).not.toHaveBeenCalled();
                });

                it('does not notify skipped callback', () => {
                    let skipCallback = jest.fn();
                    let skipPayload = { id: publishId, callback: skipCallback };
                    store.commit('addSubscriber', skipPayload);
                    let payload = { id: publishId, data: minimalData, skipCallback };
                    store.dispatch('publish', payload);
                    expect(skipCallback).not.toHaveBeenCalled();
                });
            });

            describe('handles changesets', () => {
                const universalRow = 'row42';
                let britishRows;

                beforeEach(() => {
                    britishRows = ['wibble', 'wobble', 'wubble', 'flob'];
                });

                it('creates element for added rows', () => {
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: [universalRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).toBeDefined();
                    expect(store.state[publishId].data).toEqual({
                        elements: [{ rows: [universalRow], type: 'row' }]
                    });
                });

                it('does not create element for only removed rows', () => {
                    let removedRow = 'row42';
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                removed: [removedRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).not.toBeDefined();
                });

                it('adds rows', () => {
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: [universalRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    payload.data.changeSet.added = britishRows;
                    store.dispatch('publish', payload);
                    let allRows = [universalRow].concat(britishRows);
                    expect(store.state[publishId].data).toEqual({
                        elements: [{ rows: allRows, type: 'row' }]
                    });
                });

                it('removes rows', () => {
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: britishRows
                            }
                        } };
                    store.dispatch('publish', payload);
                    let removeRow = 'wobble';
                    payload = { id: publishId,
                        data: {
                            changeSet: {
                                removed: [removeRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    britishRows.splice(britishRows.indexOf(removeRow), 1);
                    expect(store.state[publishId].data).toEqual({
                        elements: [{ rows: britishRows, type: 'row' }]
                    });
                });

                it('adds and removes rows', () => {
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: britishRows
                            }
                        } };
                    store.dispatch('publish', payload);
                    let removeRow = 'wobble';
                    payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: [universalRow],
                                removed: [removeRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    britishRows.splice(britishRows.indexOf(removeRow), 1);
                    let allRows = britishRows.concat([universalRow]);
                    expect(store.state[publishId].data).toEqual({
                        elements: [{ rows: allRows, type: 'row' }]
                    });
                });

                it('keeps removed and added rows', () => {
                    let addedRow = 'row42';
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: [addedRow],
                                removed: [addedRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).toBeDefined();
                    expect(store.state[publishId].data).toEqual({
                        elements: [{ rows: [addedRow], type: 'row' }]
                    });
                });

                it('removes element on empty rows', () => {
                    let payload = { id: publishId,
                        data: {
                            changeSet: {
                                added: [universalRow]
                            }
                        } };
                    store.dispatch('publish', payload);
                    payload.data.changeSet = { removed: [universalRow] };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId].data).toEqual({
                        elements: []
                    });
                });
            });

            describe('handles regular updates', () => {
                const minimalData = { elements: [{ id: '0.0.7', data: 'wibble' }] };

                it('throws error on invalid payload', () => {
                    let invalidPayload = { id: publishId, data: { wibble: 'foo', wobble: 'bar' } };
                    expect(() => {
                        store.dispatch('publish', invalidPayload);
                    }).toThrowError(/^.*invalid payload.*$/i);
                });

                it('creates element on new id', () => {
                    expect(store.state[publishId]).not.toBeDefined();
                    let payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).toBeDefined();
                    expect(store.state[publishId].data).toEqual(minimalData);
                });
                
                it('updates existing id', () => {
                    let payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).toBeDefined();
                    expect(store.state[publishId].data).toEqual(minimalData);
                    let changedData = JSON.parse(JSON.stringify(minimalData));
                    changedData.elements[0].data = 'wobble';
                    let payload2 = { id: publishId, data: changedData };
                    store.dispatch('publish', payload2);
                    expect(store.state[publishId].data).toEqual(changedData);
                });

                it('does not update on unchanged data element', () => {
                    let multipleElementData = JSON.parse(JSON.stringify(minimalData));
                    multipleElementData.elements.push({ id: '0.0.9', data: 'wubble' });
                    let payload = { id: publishId, data: multipleElementData };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId]).toBeDefined();
                    expect(store.state[publishId].data).toEqual(multipleElementData);
                    payload = { id: publishId, data: minimalData };
                    store.dispatch('publish', payload);
                    expect(store.state[publishId].data).toEqual(multipleElementData);
                });
            });
        });

        describe('selection translators', () => {
            const prefix = 'selection-';
            const sourceID = '0.0.7';
            const targetIDs = ['0.0.9'];
            const multipleTargetIDs = ['0.0.3', '0.0.8', '0.0.9'];
            const translatorId = 42;

            describe('register translators', () => {
                it('does not subscribe invalid selection translators', () => {
                    let invalidTranslator = { dummyElement: 'foo' };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
                    expect(store.state).toEqual({});
                    invalidTranslator = { sourceID };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
                    expect(store.state).toEqual({});
                    invalidTranslator = { targetIDs };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
                    expect(store.state).toEqual({});
                    invalidTranslator = { sourceID, targetIDs };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
                    expect(store.state).toEqual({});
                    invalidTranslator = { sourceID, targetIDs, forward: false };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
                    expect(store.state).toEqual({});
                });

                it('allows registering a forwarding selection translator without mapping', () => {
                    let translator = { sourceID, targetIDs, forward: true };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    expect(store.state[prefix + sourceID]).toBeDefined();
                    expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
                    expect(store.state[prefix + targetIDs[0]]).toBeDefined();
                    expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
                });

                it('allows registering a selection translator with mapping', () => {
                    let dummyMapping = {};
                    let translator = { sourceID, targetIDs, mapping: dummyMapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    expect(store.state[prefix + sourceID]).toBeDefined();
                    expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
                    expect(store.state[prefix + targetIDs[0]]).toBeDefined();
                    expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
                });

                it('registers multiple targets of a selection translator', () => {
                    let translator = { sourceID, targetIDs: multipleTargetIDs, forward: true };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    expect(store.state[prefix + sourceID]).toBeDefined();
                    expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
                    multipleTargetIDs.forEach((targetID) => {
                        expect(store.state[prefix + targetID]).toBeDefined();
                        expect(store.state[prefix + targetID].subscribers[0]).toBeDefined();
                    });
                });
            });

            describe('selection event mapping', () => {
                it('forwards selection event to target', () => {
                    let translator = { sourceID, targetIDs, forward: true };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
                    expect(subscriber).not.toHaveBeenCalled();
                    let payload = { changeSet: { added: ['Row42'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining(payload));
                });

                it('forwards selection event to multiple targets', () => {
                    let translator = { sourceID, targetIDs: multipleTargetIDs, forward: true };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let callbacks = [];
                    multipleTargetIDs.forEach((targetID) => {
                        let callback = jest.fn();
                        callbacks.push(callback);
                        store.dispatch('subscribe', { id: prefix + targetID, callback });
                        expect(callback).not.toHaveBeenCalled();
                    });
                    let payload = { changeSet: { added: ['Row42'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    callbacks.forEach((callback) => {
                        expect(callback).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(payload));
                    });
                });

                it('forwards selection event to source', () => {
                    let translator = { sourceID, targetIDs, forward: true };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
                    expect(subscriber).not.toHaveBeenCalled();
                    let payload = { changeSet: { added: ['Row42'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining(payload));
                });

                it('does not map selection event without change set', () => {
                    let dummyMapping = {};
                    let translator = { sourceID, targetIDs, mapping: dummyMapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let payload = { elements: [{ id: 'foo', wibble: 'wobble' }] };
                    expect(() => store.dispatch('publish', { id: prefix + sourceID, data: payload })).toThrow();
                });

                it('maps selection event with mapping to target', () => {
                    let mapping = { wibble: ['wobble'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
                    let payload = { changeSet: { added: ['wibble'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining({
                        changeSet: { added: mapping.wibble }
                    }));
                });

                it('maps selection event with simple mapping to source', () => {
                    let mapping = { wibble: ['wobble'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
                    let payload = { changeSet: { added: ['wobble'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { added: ['wibble'] }
                    }));
                });

                it('does not map selection items not existing in mapping', () => {
                    let mapping = { wibble: ['wobble'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
                    let payload = { changeSet: { added: ['foo'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    expect(subscriber).not.toHaveBeenCalled();
                });

                it('maps selection event with multiple mapping to target', () => {
                    let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
                    let payload = { changeSet: { added: ['wibble'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining({
                        changeSet: { added: mapping.wibble }
                    }));
                    payload = { changeSet: { removed: ['wibble'] } };
                    store.dispatch('publish', { id: prefix + sourceID, data: payload });
                    expect(subscriber).toHaveBeenLastCalledWith(prefix + targetIDs[0], expect.objectContaining({
                        changeSet: { removed: mapping.wibble }
                    }));
                });

                it('maps selection event with multiple mapping to source', () => {
                    let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
                    let payload = { changeSet: { added: mapping.wibble } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { added: ['wibble'] }
                    }));
                    payload = { changeSet: { removed: mapping.wibble } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { removed: ['wibble'] }
                    }));
                });

                it('handles partial mappings to source', () => {
                    let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
                    let translator = { sourceID, targetIDs, mapping };
                    store.dispatch('registerSelectionTranslator', { translatorId, translator });
                    let subscriber = jest.fn();
                    store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
                    
                    let payload = { changeSet: { added: ['wobble'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // adding a single mapped item results in a new partial selection
                    expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { partialAdded: ['wibble'] }
                    }));
                    
                    jest.resetAllMocks();
                    payload = { changeSet: { added: ['wubble'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // no change to mapped event, subscriber is not called
                    expect(subscriber).not.toHaveBeenCalled();
                    
                    payload = { changeSet: { added: ['flob'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // all mapped items added which adds the whole item and removes partial
                    expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { added: ['wibble'], partialRemoved: ['wibble'] }
                    }));

                    payload = { changeSet: { removed: ['wobble'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // removing a single mapped item results in a new partial selection
                    expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { removed: ['wibble'], partialAdded: ['wibble'] }
                    }));

                    jest.resetAllMocks();
                    payload = { changeSet: { removed: ['flob'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // no change to mapped event, subscriber is not called
                    expect(subscriber).not.toHaveBeenCalled();

                    payload = { changeSet: { removed: ['wubble'] } };
                    store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
                    // removing the last remaining mapped item removes the partial selection
                    expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                        changeSet: { partialRemoved: ['wibble'] }
                    }));
                });
            });
        });

        describe('clear store', () => {
            it('allows clearing the store', () => {
                expect(store.state).toEqual({});
                let dataPayload = { id: '0.0.7', data: 'dummyData' };
                store.commit('updateData', dataPayload);
                expect(store.state[dataPayload.id]).toBeDefined();
                store.dispatch('clear');
                expect(store.state).toEqual({});
            });

            it('allows clearing the store without data', () => {
                expect(store.state).toEqual({});
                let payload = { id: '0.0.7', callback: jest.fn() };
                store.commit('addSubscriber', payload);
                expect(store.state[payload.id]).toBeDefined();
                store.dispatch('clear');
                expect(store.state).toEqual({});
            });

            it('allows clearing an empty store', () => {
                expect(store.state).toEqual({});
                store.dispatch('clear');
                expect(store.state).toEqual({});
            });
        });
    });

    describe('getters', () => {
        describe('allows getting the published data', () => {
            it('returns the data', () => {
                let id = 'selection-12345-12345-12345';
                let minimalDummyData = { elements: [{ id: 1, testData: 1 }] };
                let payload = { id, data: minimalDummyData, callback: jest.fn() };
                store.dispatch('publish', payload);

                expect(store.getters.getPublishedData(id)).toEqual(payload.data);
            });

            it('returns null if nothing published', () => {
                expect(store.getters.getPublishedData('doesntexist-12345')).toBeNull();
            });
        });
    });
});
