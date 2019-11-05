import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/pagebuilder';

describe('PageBuilder store', () => {
    let outboundStoreConfig = {
        namespaced: true,
        actions: {
            nextPage: jest.fn(),
            previousPage: jest.fn()
        }
    };

    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        store.registerModule('outbound', outboundStoreConfig);
        jest.resetAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state.viewState).toBe(null);
        expect(store.state.page).toBe(null);
    });

    it('allows setting view state', () => {
        let viewState = 'page';
        store.commit('setViewState', viewState);
        expect(store.state.viewState).toEqual(viewState);
    });

    it('allows setting view state via action', () => {
        let viewState = 'result';
        store.dispatch('setViewState', { viewState });
        expect(store.state.viewState).toEqual(viewState);
    });

    it('allows setting page', () => {
        let page = {
            version: '2.0',
            webNodePageConfiguration: {},
            webNodes: {}
        };
        store.commit('setPage', page);
        expect(store.state.page).toEqual(page);
    });

    it('allows setting page via action', () => {
        let page = {
            version: '2.0',
            webNodePageConfiguration: {},
            webNodes: {}
        };
        store.dispatch('setPage', { page });
        expect(store.state.page).toEqual(page);
    });

    it('allows adding valueGetter via action', () => {
        let nodeId = '0.0.7';
        let valueGetter = function () {
            return Promise.resolve('foo');
        };
        expect(store.state.pageValueGetters[nodeId]).not.toBeDefined();
        store.dispatch('addValueGetter', { nodeId, valueGetter });
        expect(store.state.pageValueGetters[nodeId]).toEqual(valueGetter);
    });

    it('allows removing valueGetter via action', () => {
        let nodeId = '0.0.7';
        let valueGetter = function () {
            return Promise.resolve('bar');
        };
        store.dispatch('addValueGetter', { nodeId, valueGetter });
        expect(store.state.pageValueGetters[nodeId]).toEqual(valueGetter);
        store.dispatch('removeValueGetter', { nodeId });
        expect(store.state.pageValueGetters[nodeId]).not.toBeDefined();
    });

    it('calls nextPage on pageBuilder store', done => {
        store.dispatch('nextPage');

        process.nextTick(() => {
            expect(outboundStoreConfig.actions.nextPage).toHaveBeenCalledWith(
                expect.anything(),
                { viewValues: {} },
                undefined // eslint-disable-line no-undefined
            );
            done();
        });
    });

    it('collects values on nextPage call', done => {
        let nodeId = '0.0.7';
        let sampleVal = { int: 42 };
        store.dispatch('addValueGetter', {
            nodeId,
            valueGetter() {
                return Promise.resolve({ nodeId, value: sampleVal });
            }
        });

        store.dispatch('nextPage');

        process.nextTick(() => {
            expect(outboundStoreConfig.actions.nextPage).toHaveBeenCalledWith(
                expect.anything(),
                { viewValues: { [nodeId]: JSON.stringify(sampleVal) } },
                undefined // eslint-disable-line no-undefined
            );
            done();
        });
    });

    it('does not advance to next page on error', done => {
        let nodeId = '0.0.7';
        store.dispatch('addValueGetter', {
            nodeId,
            valueGetter() {
                return Promise.reject(new Error('something went wrong'));
            }
        });

        store.dispatch('nextPage');

        process.nextTick(() => {
            expect(outboundStoreConfig.actions.nextPage).not.toHaveBeenCalled();
            done();
        });
    });

    it('calls previousPage on pageBuilder store', () => {
        store.dispatch('previousPage');
        expect(outboundStoreConfig.actions.previousPage).toHaveBeenCalled();
    });
});
