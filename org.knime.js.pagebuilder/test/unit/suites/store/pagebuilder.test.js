import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import * as storeConfig from '~/store/pagebuilder';

describe('PageBuilder store', () => {
    let store, localVue;

    let interactivityStoreConfig = {
        namespaced: true,
        actions: {
            registerSelectionTranslator: jest.fn(),
            clear: jest.fn()
        }
    };

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
    });

    beforeEach(() => {
        store = new Vuex.Store(storeConfig);
        store.registerModule('interactivity', interactivityStoreConfig);
        jest.resetAllMocks();
    });

    it('creates an empty store', () => {
        expect(store.state.page).toBe(null);
        expect(store.state.resourceBaseUrl).toBe('');
        expect(store.state.pageValidators).toEqual({});
        expect(store.state.pageValueGetters).toEqual({});
        expect(store.state.webNodesLoading).toEqual([]);
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

    it('sets re-executing nodes', () => {
        let nodesReExecuting = ['1', '2'];
        expect(store.state.nodesReExecuting).toEqual([]);
        store.commit('setNodesReExecuting', nodesReExecuting);
        expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
    });

    it('allows setting page via action', () => {
        let nodesReExecuting = ['1', '2'];
        expect(store.state.nodesReExecuting).toEqual([]);
        store.dispatch('setNodesReExecuting', nodesReExecuting);
        expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
    });

    it('clears interactivity when setting a page', () => {
        expect(interactivityStoreConfig.actions.clear).not.toHaveBeenCalled();
        store.dispatch('setPage', { });
        expect(interactivityStoreConfig.actions.clear).toHaveBeenCalled();
    });

    it('registers selection translators when setting a page', () => {
        expect(interactivityStoreConfig.actions.registerSelectionTranslator).not.toHaveBeenCalled();
        let dummyTranslator = 'foo';
        let page = {
            wizardPageContent: {
                webNodePageConfiguration: {
                    selectionTranslators: [dummyTranslator]
                }
            }
        };
        store.dispatch('setPage', { page });
        expect(interactivityStoreConfig.actions.registerSelectionTranslator).toHaveBeenCalledWith(
            expect.anything(), { translator: dummyTranslator, translatorId: 0 }, undefined
        );
    });

    it('dispatches reactivity events', () => {
        let nodeId = '0.0.7';
        let triggerReExecution = jest.fn();
        let apiStoreConfig = {
            namespaced: true,
            actions: {
                triggerReExecution
            }
        };
        let localStore = new Vuex.Store(storeConfig);
        localStore.registerModule('api', apiStoreConfig);
        localStore.dispatch('triggerReExecution', { nodeId });
        expect(triggerReExecution).toHaveBeenCalledWith(expect.anything(), { nodeId }, expect.undefined);
    });

    it('silently handles missing api store for reactive actions', () => {
        expect(() => store.dispatch('triggerReExecution', { nodeId: '0.0.7' })).not.toThrow();
    });

    it('updates re-execution count when executing node ids are updated', () => {
        expect(store.getters.nodesReExecuting).toStrictEqual([]);
        expect(store.getters.reExecutionUpdates).toBe(0);
        let nodesReExecuting = ['node1'];
        store.dispatch('setNodesReExecuting', nodesReExecuting);
        expect(store.getters.nodesReExecuting).toStrictEqual(nodesReExecuting);
        expect(store.getters.reExecutionUpdates).toBe(1);
        nodesReExecuting.push('node2');
        store.dispatch('setNodesReExecuting', nodesReExecuting);
        expect(store.getters.nodesReExecuting).toStrictEqual(nodesReExecuting);
        expect(store.getters.reExecutionUpdates).toBe(2);
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
            expect(viewValues).toEqual({ [nodeId]: sampleVal });
        });

        it('returns empty object when getting view values fails', async () => {
            let nodeId = '0.0.7';
            store.dispatch('addValueGetter', {
                nodeId,
                valueGetter() {
                    return Promise.reject(new Error('error'));
                }
            });

            await expect(store.dispatch('getViewValues')).resolves.toStrictEqual({});
        });
    });

    it('allows setting loading state for webNodes', () => {
        expect(store.state.webNodesLoading.length).toBe(0);
        let nodeId = '0.0.7';
        store.dispatch('setWebNodeLoading', { nodeId, loading: true });
        expect(store.state.webNodesLoading.length).toBe(1);
        expect(store.state.webNodesLoading[0]).toBe(nodeId);
        store.dispatch('setWebNodeLoading', { nodeId, loading: false });
        expect(store.state.webNodesLoading.length).toBe(0);
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

            store.commit('updateViewConfig', update);
            expect(node).toEqual({ foo: 'bar' });
        });

        it('replaces web node configurations', () => {
            let node = store.state.page.wizardPageContent.webNodes.id1;

            expect(node.foo).toEqual('bar');

            let update = {
                nodeId: 'id1',
                config: {
                    nodeId: 'id2',
                    some: 'text'
                }
            };

            store.commit('updateViewConfig', update);
            expect(store.state.page.wizardPageContent.webNodes.id1).not.toEqual({ foo: 'bar' });
            expect(store.state.page.wizardPageContent.webNodes.id1).toEqual(update.config);
        });

        it('adds web node configurations', () => {
            expect(store.state.page.wizardPageContent.webNodes.id3).not.toBeDefined();

            let update = {
                nodeId: 'id3',
                config: {
                    nodeId: 'id3',
                    some: 'text'
                }
            };

            store.commit('updateViewConfig', update);
            expect(store.state.page.wizardPageContent.webNodes.id3).toEqual(update.config);
        });

        it('removes web node configurations', () => {
            let node = store.state.page.wizardPageContent.webNodes.id1;

            expect(node.foo).toEqual('bar');

            let update = {
                nodeId: 'id1',
                config: undefined
            };

            store.commit('updateViewConfig', update);
            expect(store.state.page.wizardPageContent.webNodes.id1).not.toBeDefined();
        });

        // TODO WEBP-327 Remove if dialog option added.
        it('overrides required when present in web node configurations', () => {
            let node = store.state.page.wizardPageContent.webNodes.id1;

            expect(node.foo).toEqual('bar');

            let update = {
                nodeId: 'id1',
                config: {
                    viewRepresentation: {
                        required: true
                    }
                }
            };

            store.commit('updateViewConfig', update);
            expect(store.state.page.wizardPageContent.webNodes.id1.viewRepresentation.required).toBe(false);
        });

        // as used in re-execution
        describe('multi-node updates', () => {
            const getPage = () => ({
                wizardPageContent: {
                    webNodes: {
                        id1: {
                            foo: 'bar'
                        },
                        id2: {
                            foo: 'baz'
                        }
                    },
                    nodeViews: {
                        id3: {
                            foo: 'qux'
                        },
                        id4: {
                            foo: 'grault'
                        }
                    }
                }
            });

            const checkPage = (page, webNodeValues, nodeViewValues) => {
                let webNodeIds = Object.keys(page.wizardPageContent.webNodes);
                webNodeValues.forEach((checkValue, nodeIdInd) => {
                    expect(page.wizardPageContent.webNodes[webNodeIds[nodeIdInd]].foo).toEqual(checkValue);
                });
                let nodeViewIds = Object.keys(page.wizardPageContent.nodeViews);
                nodeViewValues.forEach((checkValue, nodeIdInd) => {
                    expect(page.wizardPageContent.nodeViews[nodeViewIds[nodeIdInd]].foo).toEqual(checkValue);
                });
            };

            beforeEach(() => {
                store.commit('setPage', getPage());
            });

            it('updates single webNode', () => {
                let newPage = getPage();
                newPage.wizardPageContent.webNodes.id1.foo = 'qux';
                newPage.wizardPageContent.webNodes.id2.foo = 'bar';
                checkPage(store.state.page, ['bar', 'baz'], ['qux', 'grault']);
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id1']
                });
                checkPage(store.state.page, ['qux', 'baz'], ['qux', 'grault']);
            });

            it('dispatches alert when layout nodes differ from nodeIDs of updatePage', () => {
                let alertStoreConfig = {
                    namespaced: true,
                    actions: {
                        showAlert: jest.fn()
                    }
                };
                store.registerModule('alert', alertStoreConfig);
                
                let newPage = getPage();
                newPage.wizardPageContent = {
                    version: '2.0',
                    webNodePageConfiguration: {
                        layout: {
                            rows: []
                        }
                    },
                    webNodes: {}
                };
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id1']
                }).then(() => {
                    expect(alertStoreConfig.actions.showAlert).toHaveBeenCalled();
                });
            });

            it('updates multiple webNodes', () => {
                let newPage = getPage();
                newPage.wizardPageContent.webNodes.id1.foo = 'qux';
                newPage.wizardPageContent.webNodes.id2.foo = 'grault';
                checkPage(store.state.page, ['bar', 'baz'], ['qux', 'grault']);
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id1', 'id2']
                });
                checkPage(store.state.page, ['qux', 'grault'], ['qux', 'grault']);
            });

            it('updates single nodeView', () => {
                let newPage = getPage();
                newPage.wizardPageContent.nodeViews.id3.foo = 'bar';
                newPage.wizardPageContent.nodeViews.id4.foo = 'baz';
                checkPage(store.state.page, ['bar', 'baz'], ['qux', 'grault']);
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id3']
                });
                checkPage(store.state.page, ['bar', 'baz'], ['bar', 'grault']);
            });

            it('updates multiple nodeViews', () => {
                let newPage = getPage();
                newPage.wizardPageContent.nodeViews.id3.foo = 'bar';
                newPage.wizardPageContent.nodeViews.id4.foo = 'baz';
                checkPage(store.state.page, ['bar', 'baz'], ['qux', 'grault']);
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id3', 'id4']
                });
                checkPage(store.state.page, ['bar', 'baz'], ['bar', 'baz']);
            });

            it('updates a combination of webNodes and nodeViews', () => {
                let newPage = getPage();
                newPage.wizardPageContent.webNodes.id1.foo = 'qux';
                newPage.wizardPageContent.webNodes.id2.foo = 'grault';
                newPage.wizardPageContent.nodeViews.id3.foo = 'bar';
                newPage.wizardPageContent.nodeViews.id4.foo = 'baz';
                checkPage(store.state.page, ['bar', 'baz'], ['qux', 'grault']);
                store.dispatch('updatePage', {
                    page: newPage,
                    nodeIds: ['id1', 'id3']
                });
                checkPage(store.state.page, ['qux', 'baz'], ['bar', 'grault']);
            });
        });
    });

    describe('node validators', () => {
        it('allows adding validator via action', () => {
            let nodeId = '1.1.1';
            let validator = function () {
                return Promise.resolve(true);
            };
            expect(store.state.pageValidators[nodeId]).not.toBeDefined();
            store.dispatch('addValidator', { nodeId, validator });
            expect(store.state.pageValidators[nodeId]).toEqual(validator);
        });

        it('allows removing validator via action', () => {
            let nodeId = '1.1.1';
            let validator = function () {
                return Promise.resolve(true);
            };
            store.dispatch('addValidator', { nodeId, validator });
            expect(store.state.pageValidators[nodeId]).toEqual(validator);
            store.dispatch('removeValidator', { nodeId });
            expect(store.state.pageValidators[nodeId]).not.toBeDefined();
        });

        it('allows validating page via action', async () => {
            let nodeId = '1.1.1';
            let validator = function () {
                return Promise.resolve({ nodeId, isValid: true });
            };
            store.dispatch('addValidator', { nodeId, validator });
            let pageValidity = await store.dispatch('getValidity');
            expect(pageValidity).toEqual({ [nodeId]: true });
        });

        it('returns empty object when validation fails', async () => {
            let nodeId = '0.0.7';
            store.dispatch('addValidator', {
                nodeId,
                validator() {
                    return Promise.reject(new Error('error'));
                }
            });

            await expect(store.dispatch('getValidity')).resolves.toStrictEqual({});
        });
    });
});
