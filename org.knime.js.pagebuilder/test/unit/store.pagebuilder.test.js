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
        jest.restoreAllMocks();
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

    it('calls nextPage on pageBuilder store', () => {
        store.dispatch('nextPage');
        expect(outboundStoreConfig.actions.nextPage).toHaveBeenCalled();
    });

    it('calls previousPage on pageBuilder store', () => {
        store.dispatch('previousPage');
        expect(outboundStoreConfig.actions.previousPage).toHaveBeenCalled();
    });
});
