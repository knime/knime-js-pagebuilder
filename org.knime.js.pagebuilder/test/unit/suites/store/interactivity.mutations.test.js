import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/interactivity';

describe('Interactivity store', () => {
    let store, localVue;
    const subscriberId = 'selection-0.0.9';

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        jest.resetAllMocks();
    });


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
