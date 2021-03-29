import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/wrapperApi';

describe('wrapper API store', () => {

    let localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    afterAll(() => {
        jest.clearAllMocks();
        delete window.KnimePageLoader;
    });

    it('successfully dispatches re-execute action', () => {
        let testMonitor = { success: true };
        window.KnimePageLoader = {
            reexecutePage: jest.fn().mockReturnValue(Promise.resolve(testMonitor))
        };
        let store = new Vuex.Store();
        store.registerModule('api', storeConfig);
        store.registerModule('pagebuilder', {
            namespaced: true,
            actions: {
                getViewValues: jest.fn().mockReturnValue(Promise.resolve({})),
                getValidity: jest.fn().mockReturnValue(Promise.resolve({}))
            }
        });
        expect(store.dispatch('api/triggerReExecution', { nodeId: 'foo' })).resolves.toBe(testMonitor);
    });

    it('does not trigger re-execution if validation fails', async () => {
        let mockReexecution = jest.fn().mockReturnValue(Promise.resolve({}));
        window.KnimePageLoader = {
            reexecutePage: mockReexecution
        };
        let store = new Vuex.Store();
        store.registerModule('api', storeConfig);
        store.registerModule('pagebuilder', {
            namespaced: true,
            actions: {
                getViewValues: jest.fn().mockReturnValue(Promise.resolve({})),
                getValidity: jest.fn().mockReturnValue(Promise.reject(new Error()))
            }
        });
        await store.dispatch('api/triggerReExecution', { nodeId: 'foo' });
        expect(mockReexecution).not.toHaveBeenCalled();
    });

    it('does not trigger re-execution if value retrieval fails', async () => {
        let mockReexecution = jest.fn().mockReturnValue(Promise.resolve({}));
        window.KnimePageLoader = {
            reexecutePage: mockReexecution
        };
        let store = new Vuex.Store();
        store.registerModule('api', storeConfig);
        store.registerModule('pagebuilder', {
            namespaced: true,
            actions: {
                getViewValues: jest.fn().mockReturnValue(Promise.reject(new Error())),
                getValidity: jest.fn().mockReturnValue(Promise.resolve({}))
            }
        });
        await store.dispatch('api/triggerReExecution', { nodeId: 'foo' });
        expect(mockReexecution).not.toHaveBeenCalled();
    });
});
