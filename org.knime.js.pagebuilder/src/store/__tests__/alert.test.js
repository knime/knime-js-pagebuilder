import { expect, describe, beforeAll, beforeEach, afterEach, it, vi } from 'vitest';
import { createLocalVue } from '@vue/test-utils';
import Vuex, { createStore } from 'vuex';

import * as storeConfig from '@/store/alert';

describe('alert store', () => {
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
            alert: null
        });
    });
    
    it('shows (adds) and closes (removes) alert', () => {
        let testAlert = {
            id: '1:2:3:4'
        };
        store.dispatch('showAlert', testAlert);
        expect(store.state.alert).toEqual(testAlert);
        store.dispatch('closeAlert');
        expect(store.state).toEqual({
            alert: null
        });
    });

    it('calls a callback when closing the alert if provided', () => {
        let callbackMock = vi.fn();
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
        let callbackMock = vi.fn();
        let testAlert = {
            id: '1:2:3:4',
            callback: callbackMock
        };
        expect(callbackMock).not.toHaveBeenCalled();
        store.dispatch('showAlert', testAlert);
        store.dispatch('closeAlert', 'test');
        expect(callbackMock).toHaveBeenCalledWith('test');
    });

    describe('alert formatting', () => {
        afterEach(() => {
            if (store.state.alert) {
                store.dispatch('closeAlert');
            }
        });

        it('returns null if there is not an alert', () => {
            expect(store.state.alert).toBe(null);
            expect(store.getters.alertAsMessage).toBe(null);
        });

        it('creates an empty message if alert is empty', () => {
            store.dispatch('showAlert', {});
            expect(store.getters.alertAsMessage.message).toBe('UNKNOWN ');
            expect(store.getters.alertAsMessage.type).toBe('UNKNOWN');
            expect(store.getters.alertAsMessage.details).toBe(
                'No further information available. Please check the workflow configuration.'
            );
        });

        it('formats messages without a type', () => {
            store.dispatch('showAlert', { message: 'Unknown error occurred' });
            expect(store.getters.alertAsMessage.message).toBe('UNKNOWN Unknown error occurred');
            expect(store.getters.alertAsMessage.type).toBe('UNKNOWN');
        });

        it('formats warning messages', () => {
            const message = 'Only the first 2500 rows are shown';
            store.dispatch('showAlert', { type: 'warn', message });
            expect(store.getters.alertAsMessage.message).toBe(`WARNING ${message}`);
        });

        it('formats subtitles and details', () => {
            const subtitle = 'A runtime error occurred while fetching data';
            const message = 'Some stacktrace.';
            store.dispatch('showAlert', { type: 'error', message, subtitle });
            expect(store.getters.alertAsMessage.message).toBe(`ERROR ${subtitle}`);
            expect(store.getters.alertAsMessage.details).toBe(message);
            expect(store.getters.alertAsMessage.showCollapser).toBe(true);
        });
    });
});
