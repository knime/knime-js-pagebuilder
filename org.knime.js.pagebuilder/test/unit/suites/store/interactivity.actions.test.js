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

            it('removes outdated subscriber', () => {
                let invalidPayload = { id: publishId, callback: () => { throw new Error('No iframe found.'); } };
                store.commit('addSubscriber', invalidPayload);
                // eslint-disable-next-line no-magic-numbers
                expect(store.state[publishId].subscribers.length).toBe(3);
                let payload = { id: publishId, data: minimalData };
                store.dispatch('publish', payload);
                expect(store.state[publishId].subscribers.length).toBe(2);
            });
        });

        describe('handles changesets', () => {
            const universalRow = 'row42';
            let britishRows;

            beforeEach(() => {
                britishRows = ['wibble', 'wobble', 'wubble', 'flob'];
            });

            it('creates element for added rows', () => {
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: [universalRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                expect(store.state[publishId]).toBeDefined();
                expect(store.state[publishId].data).toEqual({
                    elements: [{ rows: [universalRow], type: 'row' }]
                });
            });

            it('does not create element for only removed rows', () => {
                let removedRow = 'row42';
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            removed: [removedRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                expect(store.state[publishId]).not.toBeDefined();
            });

            it('adds rows', () => {
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: [universalRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                payload.data.changeSet.added = britishRows;
                store.dispatch('publish', payload);
                let allRows = [universalRow].concat(britishRows);
                expect(store.state[publishId].data).toEqual({
                    elements: [{ rows: allRows, type: 'row' }]
                });
            });

            it('removes rows', () => {
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: britishRows
                        }
                    }
                };
                store.dispatch('publish', payload);
                let removeRow = 'wobble';
                payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            removed: [removeRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                britishRows.splice(britishRows.indexOf(removeRow), 1);
                expect(store.state[publishId].data).toEqual({
                    elements: [{ rows: britishRows, type: 'row' }]
                });
            });

            it('adds and removes rows', () => {
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: britishRows
                        }
                    }
                };
                store.dispatch('publish', payload);
                let removeRow = 'wobble';
                payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: [universalRow],
                            removed: [removeRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                britishRows.splice(britishRows.indexOf(removeRow), 1);
                let allRows = britishRows.concat([universalRow]);
                expect(store.state[publishId].data).toEqual({
                    elements: [{ rows: allRows, type: 'row' }]
                });
            });

            it('keeps removed and added rows', () => {
                let addedRow = 'row42';
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: [addedRow],
                            removed: [addedRow]
                        }
                    }
                };
                store.dispatch('publish', payload);
                expect(store.state[publishId]).toBeDefined();
                expect(store.state[publishId].data).toEqual({
                    elements: [{ rows: [addedRow], type: 'row' }]
                });
            });

            it('removes element on empty rows', () => {
                let payload = {
                    id: publishId,
                    data: {
                        changeSet: {
                            added: [universalRow]
                        }
                    }
                };
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
                let dispatcher = () => {
                    store.dispatch('publish', invalidPayload);
                };
                expect(dispatcher).toThrowError(/^.*invalid payload.*$/i);
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
