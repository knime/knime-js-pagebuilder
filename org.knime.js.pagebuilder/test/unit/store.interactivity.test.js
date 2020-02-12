/* eslint-disable max-nested-callbacks */
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
        let subscriberId = 'selection-0.0.9';

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

        it('remove subscriber with data present', () => {
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

        it('updateData', () => {
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

        it('clearState', () => {
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
            let subscriberId = 'selection-0.0.9';
            let dataId = 'selection-0.0.7';
            let data = { elements: ['dummyData'] };
        
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
            let id = 'selection-12345-12345-12345';
            let payload = { id, callback: jest.fn(), elementFilter: 2 };
            
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
        describe('publish data', () => {

            let publishId = '0.0.7';

            describe('notifies subscribers of changes', () => {
                it('notifies registered subscribers', () => {

                });
                it('notifies with filtered elements', () => {

                });
                it('does not notify on empty filtered elements', () => {

                });
                it('notifies on relevant elements', () => {

                });
                it('does not notify on empty relevant elements', () => {

                });
                it('does not notify skipped callback', () => {

                });
            });
            describe('handles changesets', () => {
                it('creates element for added rows', () => {

                });
                it('does not create element for only removed rows', () => {

                });
                it('keeps removed and added rows', () => {

                });
            });
            describe('handles regular updates', () => {

                let minimalData = { elements: [{ id: '0.0.7', data: 'wibble' }] };

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
                it('does not update on unchanged data', () => {
                    
                });
            });
        });
        describe('handles selection translators', () => {
            it('allows registering a selection translator', () => {
                // TODO with WEBP-73
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
