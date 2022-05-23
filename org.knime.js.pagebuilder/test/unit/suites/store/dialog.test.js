import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';

import * as storeConfig from '~/store/dialog';

describe('dialog store', () => {
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
            applySettings: null,
            dirtySettings: false,
            dirtyModelSettings: false
        });
    });

    describe('dialog store actions', () => {
        it('dirties non-model settings', async () => {
            await store.dispatch('dirtySettings');
            expect(store.state.dirtySettings).toBe(true);
            expect(store.state.dirtyModelSettings).toBe(false);
        });

        it('dirties model settings', async () => {
            await store.dispatch('dirtySettings', true);
            expect(store.state.dirtySettings).toBe(true);
            expect(store.state.dirtyModelSettings).toBe(true);
            // without diff mechanism, settings should stay dirty
            await store.dispatch('dirtySettings', false);
            expect(store.state.dirtySettings).toBe(true);
            expect(store.state.dirtyModelSettings).toBe(true);
        });

        it('sets the applySettings method', async () => {
            const applySettings = jest.fn();
            await store.dispatch('setApplySettings', { applySettings });
            expect(store.state.applySettings).toBe(applySettings);
        });

        it('calls the applySettings method', async () => {
            const applySettings = jest.fn();
            await store.dispatch('setApplySettings', { applySettings });
            const applySettingsSpy = jest.spyOn(store.state, 'applySettings');
            await store.dispatch('callApplySettings');
            expect(applySettingsSpy).toHaveBeenCalled();
        });
    });
});
