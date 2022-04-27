import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { KnimeService } from 'knime-ui-extension-service';

import { iFrameExtensionConfig } from '../../assets/views/extensionConfig';

import * as storeConfig from '~/store/service';

describe('service store', () => {
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
            services: {},
            dialogApplySettings: null
        });
    });

    describe('service store actions', () => {
        it('registers a service', async () => {
            const service = new KnimeService(iFrameExtensionConfig, jest.fn());
            await store.dispatch('registerService', { service });
            expect(store.state.services[service.serviceId]).toBe(service);
        });
    
        it('dispatches push notifications', async () => {
            const service = new KnimeService(iFrameExtensionConfig, jest.fn());
            await store.dispatch('registerService', { service });
            let onRPCNotificationSpy = jest.spyOn(service, 'onServiceNotification');
            let mockEvent = { payload: 'message' };
            await store.dispatch('pushNotification', { event: mockEvent });
            expect(onRPCNotificationSpy).toHaveBeenCalledWith(mockEvent);
        });

        it('deregisters a service', async () => {
            const service = new KnimeService(iFrameExtensionConfig, jest.fn());
            await store.dispatch('registerService', { service });
            expect(store.state.services[service.serviceId]).toBe(service);
            await store.dispatch('deregisterService', { service });
            expect(store.state.services[service.serviceId]).toBeUndefined();
        });

        it('sets the applySettings method', async () => {
            const dialogApplySettings = jest.fn();
            await store.dispatch('setApplySettings', { dialogApplySettings });
            expect(store.state.dialogApplySettings).toBe(dialogApplySettings);
        });

        it('calls the applySettings method', async () => {
            const dialogApplySettings = jest.fn();
            await store.dispatch('setApplySettings', { dialogApplySettings });
            const dialogApplySettingsSpy = jest.spyOn(store.state, 'dialogApplySettings');
            await store.dispatch('applySettings');
            expect(dialogApplySettingsSpy).toHaveBeenCalled();
        });
    });
});
