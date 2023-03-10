import { expect, describe, beforeAll, beforeEach, afterEach, it, vi } from 'vitest';
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';

import WebNodeIFrame from '@/components/views/WebNodeIFrame.vue';

import * as storeConfig from '@/store/pagebuilder';
import * as alertStoreConfig from '@/store/alert';

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
        store = createStore({
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
            global: {
                mocks: {
                    $store: store
                }
            }
        };
        window.origin = window.location.origin;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Interactivity', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachTo: document.body,
                props: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeId: '0:0:7'
                }
            });
        });

        it('subscribe calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'interactivitySubscribe', id: '123' }
            });
            expect(interactivityConfig.actions.subscribe).toHaveBeenCalled();
        });

        it('unsubscribe calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'interactivityUnsubscribe', id: '123' }
            });
            expect(interactivityConfig.actions.unsubscribe).toHaveBeenCalled();
        });

        it('publish calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'interactivityPublish', id: '123', payload: 'dummy' }
            });
            expect(interactivityConfig.actions.publish).toHaveBeenCalled();
        });

        it('registerSelectionTranslator calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: {
                    nodeId: '0:0:7',
                    type: 'interactivityRegisterSelectionTranslator',
                    id: '123',
                    translator: 'dummy'
                }
            });
            expect(interactivityConfig.actions.registerSelectionTranslator).toHaveBeenCalled();
        });

        it('informs iframe of interactivity events', () => {
            vi.spyOn(wrapper.vm.document.defaultView, 'postMessage');
            let id = '123';
            let payload = 'dummyData';
            wrapper.vm.interactivityInformIframe(id, payload);
            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0:0:7',
                type: 'interactivityEvent',
                id,
                payload
            }, window.origin);
        });
    });
});
