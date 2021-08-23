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

    const prefix = 'selection-';
    const sourceID = '0.0.7';
    const targetIDs = ['0.0.9'];
    const multipleTargetIDs = ['0.0.3', '0.0.8', '0.0.9'];
    const translatorId = 42;

    describe('register translators', () => {
        it('does not subscribe invalid selection translators', () => {
            let invalidTranslator = { dummyElement: 'foo' };
            store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
            expect(store.state).toEqual({});
            invalidTranslator = { sourceID };
            store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
            expect(store.state).toEqual({});
            invalidTranslator = { targetIDs };
            store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
            expect(store.state).toEqual({});
            invalidTranslator = { sourceID, targetIDs };
            store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
            expect(store.state).toEqual({});
            invalidTranslator = { sourceID, targetIDs, forward: false };
            store.dispatch('registerSelectionTranslator', { translatorId, translator: invalidTranslator });
            expect(store.state).toEqual({});
        });

        it('allows registering a forwarding selection translator without mapping', () => {
            let translator = { sourceID, targetIDs, forward: true };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            expect(store.state[prefix + sourceID]).toBeDefined();
            expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
            expect(store.state[prefix + targetIDs[0]]).toBeDefined();
            expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
        });

        it('allows registering a selection translator with mapping', () => {
            let dummyMapping = {};
            let translator = { sourceID, targetIDs, mapping: dummyMapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            expect(store.state[prefix + sourceID]).toBeDefined();
            expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
            expect(store.state[prefix + targetIDs[0]]).toBeDefined();
            expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
        });

        it('registers multiple targets of a selection translator', () => {
            let translator = { sourceID, targetIDs: multipleTargetIDs, forward: true };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            expect(store.state[prefix + sourceID]).toBeDefined();
            expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
            multipleTargetIDs.forEach((targetID) => {
                expect(store.state[prefix + targetID]).toBeDefined();
                expect(store.state[prefix + targetID].subscribers[0]).toBeDefined();
            });
        });
    });

    describe('selection event mapping', () => {
        it('forwards selection event to target', () => {
            let translator = { sourceID, targetIDs, forward: true };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
            expect(subscriber).not.toHaveBeenCalled();
            let payload = { changeSet: { added: ['Row42'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining(payload));
        });

        it('forwards selection event to multiple targets', () => {
            let translator = { sourceID, targetIDs: multipleTargetIDs, forward: true };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let callbacks = [];
            multipleTargetIDs.forEach((targetID) => {
                let callback = jest.fn();
                callbacks.push(callback);
                store.dispatch('subscribe', { id: prefix + targetID, callback });
                expect(callback).not.toHaveBeenCalled();
            });
            let payload = { changeSet: { added: ['Row42'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            callbacks.forEach((callback) => {
                expect(callback).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(payload));
            });
        });

        it('forwards selection event to source', () => {
            let translator = { sourceID, targetIDs, forward: true };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
            expect(subscriber).not.toHaveBeenCalled();
            let payload = { changeSet: { added: ['Row42'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining(payload));
        });

        it('does not map selection event without change set', () => {
            let dummyMapping = {};
            let translator = { sourceID, targetIDs, mapping: dummyMapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let payload = {};
            expect(() => store.dispatch('publish', { id: prefix + sourceID, data: payload })).toThrow();
        });

        it('maps selection event with mapping to target', () => {
            let mapping = { wibble: ['wobble'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
            let payload = { changeSet: { added: ['wibble'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining({
                changeSet: { added: mapping.wibble }
            }));
        });

        it('maps selection event with simple mapping to source', () => {
            let mapping = { wibble: ['wobble'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
            let payload = { changeSet: { added: ['wobble'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { added: ['wibble'] }
            }));
        });

        it('does not map selection items not existing in mapping', () => {
            let mapping = { wibble: ['wobble'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
            let payload = { changeSet: { added: ['foo'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            expect(subscriber).not.toHaveBeenCalled();
        });

        it('maps selection event with multiple mapping to target', () => {
            let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + targetIDs[0], callback: subscriber });
            let payload = { changeSet: { added: ['wibble'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + targetIDs[0], expect.objectContaining({
                changeSet: { added: mapping.wibble }
            }));
            payload = { changeSet: { removed: ['wibble'] } };
            store.dispatch('publish', { id: prefix + sourceID, data: payload });
            expect(subscriber).toHaveBeenLastCalledWith(prefix + targetIDs[0], expect.objectContaining({
                changeSet: { removed: mapping.wibble }
            }));
        });

        it('maps selection event with multiple mapping to source', () => {
            let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });
            let payload = { changeSet: { added: mapping.wibble } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { added: ['wibble'] }
            }));
            payload = { changeSet: { removed: mapping.wibble } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { removed: ['wibble'] }
            }));
        });

        it('handles partial mappings to source', () => {
            let mapping = { wibble: ['wobble', 'wubble', 'flob'] };
            let translator = { sourceID, targetIDs, mapping };
            store.dispatch('registerSelectionTranslator', { translatorId, translator });
            let subscriber = jest.fn();
            store.dispatch('subscribe', { id: prefix + sourceID, callback: subscriber });

            let payload = { changeSet: { added: ['wobble'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // adding a single mapped item results in a new partial selection
            expect(subscriber).toHaveBeenCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { partialAdded: ['wibble'] }
            }));

            jest.resetAllMocks();
            payload = { changeSet: { added: ['wubble'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // no change to mapped event, subscriber is not called
            expect(subscriber).not.toHaveBeenCalled();

            payload = { changeSet: { added: ['flob'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // all mapped items added which adds the whole item and removes partial
            expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { added: ['wibble'], partialRemoved: ['wibble'] }
            }));

            payload = { changeSet: { removed: ['wobble'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // removing a single mapped item results in a new partial selection
            expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { removed: ['wibble'], partialAdded: ['wibble'] }
            }));

            jest.resetAllMocks();
            payload = { changeSet: { removed: ['flob'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // no change to mapped event, subscriber is not called
            expect(subscriber).not.toHaveBeenCalled();

            payload = { changeSet: { removed: ['wubble'] } };
            store.dispatch('publish', { id: prefix + targetIDs[0], data: payload });
            // removing the last remaining mapped item removes the partial selection
            expect(subscriber).toHaveBeenLastCalledWith(prefix + sourceID, expect.objectContaining({
                changeSet: { partialRemoved: ['wibble'] }
            }));
        });
    });
});
