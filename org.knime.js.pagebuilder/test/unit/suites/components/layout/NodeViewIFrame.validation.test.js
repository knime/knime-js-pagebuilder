import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';
import * as alertStoreConfig from '@/../store/alert';

// extra mock to simulate a loaded view script
jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%ORIGIN%', '%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%ORIGIN%', '%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
    foo = ['%RESOURCEBASEURL%', '%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
jest.mock('iframe-resizer/js/iframeResizer');

describe('NodeViewIframe.vue', () => {
    let interactivityConfig, apiConfig, wizardConfig, settingsConfig, store, localVue, context, mockGetPublishedData,
        mockGetUser, mockGetRepository, mockGetDownloadLink, mockGetUploadLink, mockUpload;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        storeConfig.actions.setWebNodeLoading = jest.fn();
        mockGetPublishedData = jest.fn();
        interactivityConfig = {
            namespaced: true,
            actions: {
                subscribe: jest.fn(),
                unsubscribe: jest.fn(),
                publish: jest.fn(),
                registerSelectionTranslator: jest.fn(),
                clear: jest.fn()
            },
            getters: {
                getPublishedData: jest.fn().mockReturnValue(mockGetPublishedData)
            }
        };
        mockGetUser = jest.fn();
        mockGetRepository = jest.fn();
        mockGetDownloadLink = jest.fn();
        mockGetUploadLink = jest.fn();
        mockUpload = jest.fn();
        apiConfig = {
            namespaced: true,
            actions: {
                uploadResource: mockUpload
            },
            getters: {
                user: jest.fn().mockReturnValue(mockGetUser),
                repository: jest.fn().mockReturnValue(mockGetRepository),
                downloadResourceLink: jest.fn().mockReturnValue(mockGetDownloadLink),
                uploadResourceLink: jest.fn().mockReturnValue(mockGetUploadLink)
            }
        };
        wizardConfig = {
            namespaced: true,
            getters: {
                workflowPath: jest.fn().mockReturnValue('/some/path')
            }
        };
        settingsConfig = {
            namespaced: true,
            state: () => ({ defaultMountId: 'MOUNTIE' }),
            getters: {
                getCustomSketcherPath: jest.fn().mockReturnValue('sample/sketcher/path/sketcher.html')
            }
        };
        store = new Vuex.Store({
            modules: {
                pagebuilder: storeConfig,
                'pagebuilder/interactivity': interactivityConfig,
                api: apiConfig,
                settings: settingsConfig,
                wizardExecution: wizardConfig,
                'pagebuilder/alert': alertStoreConfig
            }
        });
        store.commit('pagebuilder/setResourceBaseUrl', 'http://baseurl.test.example/');
        store.commit('pagebuilder/setPage', {
            wizardPageContent: {
                webNodes: {
                    '0:0:7': {
                        namespace: 'foo',
                        javascriptLibraries: [],
                        stylesheets: []
                    },
                    '0:0:9': {
                        namespace: 'bar',
                        javascriptLibraries: [],
                        stylesheets: []
                    }
                }
            }
        });

        context = {
            store,
            localVue
        };
        window.origin = window.location.origin;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('view validation', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        validateMethodName: 'validate'
                    }
                }
            });
        });

        it('handles validation', () => {
            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');
            wrapper.vm.validate();
            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0:0:7',
                namespace: 'knimespace',
                validateMethodName: 'validate',
                type: 'validate'
            }, window.origin);
        });

        it('resolves validate promise', () => {
            let validatePromise = wrapper.vm.validate();
            // fake validation returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'validate', isValid: true }
            });
            return expect(validatePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: true });
        });

        it('returns invalid for errors with webnodes', () => {
            let valuePromise = wrapper.vm.validate();
            // fake error
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'validate', error: 'Error', isValid: false }
            });
            expect(wrapper.vm.alert).toStrictEqual({
                level: 'error',
                message: 'View validation failed.',
                nodeInfo: undefined, // eslint-disable-line no-undefined
                type: 'error'
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: false });
        });

        it('returns invalid when views timeout', () => {
            jest.useFakeTimers();
            let valuePromise = wrapper.vm.validate();
            // don't provide a message queue response
            jest.runAllTimers();
            expect(wrapper.vm.alert).toStrictEqual({
                level: 'error',
                message: 'View is not responding.',
                nodeInfo: undefined, // eslint-disable-line no-undefined
                type: 'error'
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: false });
        });
    });


    describe('setting validation error', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: { nodeID: '0:0:7' },
                    nodeConfig: {
                        namespace: 'knimespace',
                        setValidationErrorMethodName: 'setValidationError'
                    }
                }
            });
        });

        it('handles validation', () => {
            const testMsg = 'test value';
            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');
            wrapper.vm.setValidationError(testMsg);
            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0:0:7',
                namespace: 'knimespace',
                setValidationErrorMethodName: 'setValidationError',
                type: 'setValidationError',
                errorMessage: testMsg
            }, window.origin);
        });

        it('resolves validate promise', () => {
            let validatePromise = wrapper.vm.setValidationError('test');
            // fake validation returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'setValidationError', isValid: false }
            });
            return expect(validatePromise).resolves.toStrictEqual(true);
        });

        it('catches errors from within view thrown while setting message', async (done) => {
            let valuePromise = wrapper.vm.setValidationError('test').catch(e => e);
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'setValidationError', error: 'Error', isValid: false }
            });
            expect(wrapper.vm.alert).toStrictEqual({
                level: 'error',
                message: 'Error',
                nodeInfo: undefined, // eslint-disable-line no-undefined
                type: 'error'
            });
            let response = await Promise.resolve(valuePromise);
            expect(response instanceof Error).toBe(true);
            expect(response.message).toBe('Error');
            done();
        });
    });

});
