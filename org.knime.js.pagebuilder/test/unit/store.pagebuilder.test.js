import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/pagebuilder';

describe('PageBuilder store', () => {

    let store, localVue;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        jest.resetAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state.page).toBe(null);
        expect(store.state.resourceBaseUrl).toBe('');
        expect(store.state.pageValidity).toEqual({});
        expect(store.state.pageValueGetters).toEqual({});
        expect(store.state.viewsLoading).toEqual([]);
    });

    it('allows setting page', () => {
        let page = {
            wizardExecutionState: 'INTERACTION_REQUIRED',
            wizardPageContent: {
                version: '2.0',
                webNodePageConfiguration: {},
                webNodes: {}
            }
        };
        store.commit('setPage', page);
        expect(store.state.page).toEqual(page);
    });

    it('allows setting page via action', () => {
        let page = {
            wizardExecutionState: 'INTERACTION_REQUIRED',
            wizardPageContent: {
                version: '2.0',
                webNodePageConfiguration: {},
                webNodes: {}
            }
        };
        store.dispatch('setPage', { page });
        expect(store.state.page).toEqual(page);
    });

    it('allows setting resourceBaseUrl', () => {
        let resourceBaseUrl = 'https://test-url.com/path';
        store.commit('setResourceBaseUrl', resourceBaseUrl);
        expect(store.state.resourceBaseUrl).toEqual(resourceBaseUrl);
    });

    it('allows setting resourceBaseUrl via action', () => {
        let resourceBaseUrl = 'https://test-url.com/path';
        store.dispatch('setResourceBaseUrl', { resourceBaseUrl });
        expect(store.state.resourceBaseUrl).toEqual(resourceBaseUrl);
    });

    describe('node value getters', () => {
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

        it('allows getting view values via action', async () => {
            let nodeId = '0.0.7';
            let sampleVal = { int: 42 };
            store.dispatch('addValueGetter', {
                nodeId,
                valueGetter() {
                    return Promise.resolve({ nodeId, value: sampleVal });
                }
            });

            let viewValues = await store.dispatch('getViewValues');
            expect(viewValues).toEqual({ [nodeId]: JSON.stringify(sampleVal) });
        });

        it('throws error when getting view values failed', async () => {
            let nodeId = '0.0.7';
            store.dispatch('addValueGetter', {
                nodeId,
                valueGetter() {
                    return Promise.reject(new Error('error'));
                }
            });

            await expect(store.dispatch('getViewValues')).rejects.toThrow();
        });
    });

    it('allows setting loading state for views', () => {
        expect(store.state.viewsLoading.length).toBe(0);
        let nodeId = '0.0.7';
        store.dispatch('setWebNodeLoading', { nodeId, loading: true });
        expect(store.state.viewsLoading.length).toBe(1);
        expect(store.state.viewsLoading[0]).toBe(nodeId);
        store.dispatch('setWebNodeLoading', { nodeId, loading: false });
        expect(store.state.viewsLoading.length).toBe(0);
    });

    describe('node value updates', () => {
        beforeEach(() => {
            let page = {
                wizardPageContent: {
                    webNodes: {
                        id1: {
                            foo: 'bar'
                        }
                    }
                }
            };
            store.commit('setPage', page);
        });

        it('prevents value modification with invalid keys', () => {
            let node = store.state.page.wizardPageContent.webNodes.id1;

            expect(node.foo).toEqual('bar');

            let update = {
                nodeId: 'id1',
                isValid: true,
                update: {
                    fooBar: 'rod' // wrong key
                }
            };

            store.commit('updateWebNode', update);
            expect(node).toEqual({ foo: 'bar' });
        });
    });

});
