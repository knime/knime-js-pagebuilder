import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it, vi } from 'vitest';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import WebNodeIFrame from '@/components/views/WebNodeIFrame.vue';

import * as storeConfig from '@/../store/pagebuilder';
import * as alertStoreConfig from '@/../store/alert';

// extra mock to simulate a loaded view script
vi.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%ORIGIN%', '%NODEID%'];`, { virtual: true });
vi.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%ORIGIN%', '%NODEID%'];`, { virtual: true });
vi.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
    foo = ['%RESOURCEBASEURL%', '%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
vi.mock('iframe-resizer/js/iframeResizer');

describe('WebNodeIFrame.vue', () => {
    let interactivityConfig, apiConfig, wizardConfig, settingsConfig, store, localVue, context, mockGetPublishedData,
        mockGetUser, mockGetRepository, mockGetDownloadLink, mockGetUploadLink, mockUpload;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        storeConfig.actions.setWebNodeLoading = vi.fn();
        mockGetPublishedData = vi.fn();
        interactivityConfig = {
            namespaced: true,
            actions: {
                subscribe: vi.fn(),
                unsubscribe: vi.fn(),
                publish: vi.fn(),
                registerSelectionTranslator: vi.fn(),
                clear: vi.fn()
            },
            getters: {
                getPublishedData: vi.fn().mockReturnValue(mockGetPublishedData)
            }
        };
        mockGetUser = vi.fn();
        mockGetRepository = vi.fn();
        mockGetDownloadLink = vi.fn();
        mockGetUploadLink = vi.fn();
        mockUpload = vi.fn();
        apiConfig = {
            namespaced: true,
            actions: {
                uploadResource: mockUpload
            },
            getters: {
                user: vi.fn().mockReturnValue(mockGetUser),
                repository: vi.fn().mockReturnValue(mockGetRepository),
                downloadResourceLink: vi.fn().mockReturnValue(mockGetDownloadLink),
                uploadResourceLink: vi.fn().mockReturnValue(mockGetUploadLink)
            }
        };
        wizardConfig = {
            namespaced: true,
            getters: {
                workflowPath: vi.fn().mockReturnValue('/some/path'),
                currentJobId: vi.fn().mockReturnValue(1)
            }
        };
        settingsConfig = {
            namespaced: true,
            state: () => ({ defaultMountId: 'MOUNTIE' }),
            getters: {
                getCustomSketcherPath: vi.fn().mockReturnValue('sample/sketcher/path/sketcher.html')
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
                    '1:0:1:0:0:7': {
                        namespace: 'foo',
                        javascriptLibraries: [],
                        stylesheets: []
                    },
                    '1:0:1:0:0:9': {
                        namespace: 'bar',
                        javascriptLibraries: [],
                        stylesheets: []
                    }
                },
                webNodePageConfiguration: {
                    projectRelativePageIDSuffix: '1:0:1'
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
        vi.restoreAllMocks();
    });

    describe('view validation', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                props: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        validateMethodName: 'validate'
                    },
                    nodeId: '0:0:7'
                }
            });
        });

        it('handles validation', () => {
            vi.spyOn(wrapper.vm.document.defaultView, 'postMessage');
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
                nodeInfo: undefined,
                type: 'error'
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: false });
        });

        it('returns invalid when views timeout', () => {
            vi.useFakeTimers();
            let valuePromise = wrapper.vm.validate();
            // don't provide a message queue response
            vi.runAllTimers();
            expect(wrapper.vm.alert).toStrictEqual({
                level: 'error',
                message: 'View is not responding.',
                nodeInfo: undefined,
                type: 'error'
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: false });
        });
    });


    describe('setting validation error', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                props: {
                    viewConfig: { nodeID: '0:0:7' },
                    nodeConfig: {
                        namespace: 'knimespace',
                        setValidationErrorMethodName: 'setValidationError'
                    },
                    nodeId: '0:0:7'
                }
            });
        });

        it('handles validation', () => {
            const testMsg = 'test value';
            vi.spyOn(wrapper.vm.document.defaultView, 'postMessage');
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
                nodeInfo: undefined,
                type: 'error'
            });
            let response = await Promise.resolve(valuePromise);
            expect(response instanceof Error).toBe(true);
            expect(response.message).toBe('Error');
            done();
        });
    });
});
