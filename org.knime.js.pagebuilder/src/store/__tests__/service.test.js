import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import { createStore } from 'vuex';
import { KnimeService } from '@knime/ui-extension-service';

import { iFrameExtensionConfig } from '../../../test/unit/assets/views/extensionConfig';

import * as storeConfig from '@/store/service';

describe('service store', () => {
    let store;

    beforeEach(() => {
        store = createStore(storeConfig);
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state).toEqual({
            services: {}
        });
    });

    describe('service store actions', () => {
        it('registers a service', async () => {
            const service = new KnimeService(iFrameExtensionConfig, vi.fn());
            await store.dispatch('registerService', { service });
            expect(store.state.services[service.serviceId]).toStrictEqual(service);
        });
    
        it('dispatches push notifications', async () => {
            const service = new KnimeService(iFrameExtensionConfig, vi.fn());
            await store.dispatch('registerService', { service });
            let onRPCNotificationSpy = vi.spyOn(service, 'onServiceNotification');
            let mockEvent = { payload: 'message' };
            await store.dispatch('pushNotification', { event: mockEvent });
            expect(onRPCNotificationSpy).toHaveBeenCalledWith(mockEvent);
        });

        it('deregisters a service', async () => {
            const service = new KnimeService(iFrameExtensionConfig, vi.fn());
            await store.dispatch('registerService', { service });
            expect(store.state.services[service.serviceId]).toStrictEqual(service);
            await store.dispatch('deregisterService', { service });
            expect(store.state.services[service.serviceId]).toBeUndefined();
        });
    });
});