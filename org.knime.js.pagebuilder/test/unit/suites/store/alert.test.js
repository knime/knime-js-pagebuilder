import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/alert';

describe('alert store', () => {
    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state).toEqual({
            activeAlert: null
        });
    });
    
    it('shows (adds) and closes (removes) alert', () => {
        let testAlert = {
            id: '1:2:3:4'
        };
        store.dispatch('showAlert', testAlert);
        expect(store.state.activeAlert).toEqual(testAlert);
        store.dispatch('closeAlert');
        expect(store.state).toEqual({
            activeAlert: null
        });
    });

    it('calls a callback when closing the alert if provided', () => {
        let callbackMock = jest.fn();
        let testAlert = {
            id: '1:2:3:4',
            callback: callbackMock
        };
        expect(callbackMock).not.toHaveBeenCalled();
        store.dispatch('showAlert', testAlert);
        store.dispatch('closeAlert');
        expect(callbackMock).toHaveBeenCalled();
    });

    it('passes a parameter to the callback function on close', () => {
        let callbackMock = jest.fn();
        let testAlert = {
            id: '1:2:3:4',
            callback: callbackMock
        };
        expect(callbackMock).not.toHaveBeenCalled();
        store.dispatch('showAlert', testAlert);
        store.dispatch('closeAlert', 'test');
        expect(callbackMock).toHaveBeenCalledWith('test');
    });
});
