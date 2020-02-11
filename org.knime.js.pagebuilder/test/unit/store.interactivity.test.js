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
        expect(store.state[payload.id].subscribers.length).toEqual(0);
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
