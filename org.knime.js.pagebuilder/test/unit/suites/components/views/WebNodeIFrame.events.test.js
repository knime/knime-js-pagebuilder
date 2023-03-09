import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import WebNodeIFrame from '@/components/views/WebNodeIFrame.vue';

import * as storeConfig from '@/../store/pagebuilder';
import * as alertStoreConfig from '@/../store/alert';

// extra mock to simulate a loaded view script
vi.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
vi.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
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

    describe('handling messages from iFrame', () => {
        let wrapper, validateCallbackMock, getValueCallbackMock, setValidationErrorCallbackMock, nodeId;

        beforeEach(() => {
            nodeId = '0:0:7';

            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: { nodeID: nodeId },
                    nodeConfig: {
                        namespace: 'knimespace',
                        initMethodName: 'init',
                        setValidationErrorMethodName: 'setValidationError',
                        viewRepresentation: {},
                        viewValue: {},
                        nodeInfo: {}
                    },
                    nodeId
                }
            });

            validateCallbackMock = vi.fn();
            getValueCallbackMock = vi.fn();
            setValidationErrorCallbackMock = vi.fn();

            wrapper.vm.validateCallback = validateCallbackMock;
            wrapper.vm.getValueCallback = getValueCallbackMock;
            wrapper.vm.setValidationErrorCallback = setValidationErrorCallbackMock;

            vi.spyOn(wrapper.vm.document.defaultView, 'postMessage');
        });

        it('ignores missing event data', () => {
            // empty event
            let messageEvent = {};
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
            // missing origin
            messageEvent = { data: { nodeId } };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
            // mismatched nodeId
            messageEvent = { data: { nodeId: 'other:node' } };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
        });

        it('handles load events', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'load'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId,
                namespace: 'knimespace',
                initMethodName: 'init',
                type: 'init',
                viewRepresentation: {},
                viewValue: {}
            }, window.origin);
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
        });

        it('handles validate events', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'validate'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).toHaveBeenCalledWith({ nodeId, type: 'validate' });
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
        });

        it('handles getValue events', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'getValue'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).toHaveBeenCalledWith({ nodeId, type: 'getValue' });
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toBe(null);
        });

        it('handles setValidationError events', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'setValidationError'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).toHaveBeenCalledWith({ nodeId, type: 'setValidationError' });
            expect(wrapper.vm.alert).toBe(null);
        });

        it('handles alert events', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'alert',
                    message: 'test'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toStrictEqual({ nodeId, nodeInfo: {}, type: 'warn', message: 'test' });
        });

        it('handles other messages with errors (failed validation, etc.) as alerts', () => {
            let messageEvent = {
                origin: window.location.origin,
                data: {
                    nodeId,
                    type: 'validate',
                    error: 'Something went wrong'
                }
            };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toStrictEqual({
                nodeId, nodeInfo: {}, type: 'error', message: 'Something went wrong', error: 'Something went wrong'
            });
        });
    });
});
