import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import WebNodeIFrame from '@/components/views/WebNodeIFrame';

import * as storeConfig from '@/../store/pagebuilder';
import * as alertStoreConfig from '@/../store/alert';

// extra mock to simulate a loaded view script
jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
    foo = ['%RESOURCEBASEURL%', '%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
jest.mock('iframe-resizer/js/iframeResizer');

describe('WebNodeIFrame.vue', () => {
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
        jest.restoreAllMocks();
    });

    describe('Interactivity', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
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
            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');
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
