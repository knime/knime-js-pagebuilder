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
    
    it('allows removing a subscriber', () => {
        let id = 'selection-12345-12345-12345';
        let payload = { id, callback: jest.fn(), elementFilter: 2 };
        store.dispatch('subscribe', payload);
        expect(store.state[payload.id].subscribers.length).toEqual(1);

        store.dispatch('unsubscribe', payload);
        expect(store.state[payload.id]).not.toBeDefined();
    });

    describe('allows updating data', () => {
        it('new id', () => {
            // TODO process changesets, combine filters... WEBP-74
        });
        it('existing id', () => {
            // TODO process changesets, combine filters... WEBP-74
        });
    });

    it('allows clearing the store', () => {
        store.dispatch('clear');
        expect(store.state).toEqual({});
    });


    it('allows publishing', () => {
        let id = 'selection-12345-12345-12345';
        let payload = { id, data: { elements: [] }, callback: jest.fn() };
        store.dispatch('publish', payload);
        
        // TODO test call subscribers WEBP-74
    });

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
