import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import WebNodeIFrame from '@/components/views/WebNodeIFrame';
import AlertLocal from '@/components/ui/AlertLocal';

import * as storeConfig from '@/../store/pagebuilder';
import * as alertStoreConfig from '@/../store/alert';

// extra mock to simulate a loaded view script
jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
    foo = ['%RESOURCEBASEURL%', '%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
jest.mock('iframe-resizer');

describe('WebNodeIFrame.vue', () => {
    let interactivityConfig, apiConfig, wizardConfig, settingsConfig, store, localVue, context, mockGetPublishedData,
        mockGetUser, mockGetRepository, mockGetDownloadLink, mockGetUploadLink, mockUpload, wrapper;

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
            state: () => ({
                defaultMountId: 'MOUNTIE',
                'knime:access_token': ''
            }),
            mutations: {
                setSettings(state, { settings }) {
                    Object.keys(state).forEach(key => {
                        if (settings.hasOwnProperty(key)) {
                            state[key] = settings[key];
                        }
                    });
                }
            },
            getters: {
                getCustomSketcherPath: jest.fn().mockReturnValue('sample/sketcher/path/sketcher.html')
            }
        };
        store = new Vuex.Store({ modules: {
            pagebuilder: storeConfig,
            'pagebuilder/interactivity': interactivityConfig,
            api: apiConfig,
            settings: settingsConfig,
            wizardExecution: wizardConfig,
            'pagebuilder/alert': alertStoreConfig
        } });
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
        wrapper?.destroy();
        jest.restoreAllMocks();
    });

    it('renders', () => {
        wrapper = shallowMount(WebNodeIFrame, {
            ...context,
            propsData: {
                nodeId: '0:0:7'
            },
            attachToDocument: true
        });
        expect(wrapper.html()).toBeTruthy();
    });

    describe('resource injection', () => {
        it('injects scripts and styles', () => {
            let iframeConfig = {
                attachToDocument: true,
                ...context,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        javascriptLibraries: ['foo/bar.js', 'qux/baz.js'],
                        stylesheets: ['bla.css', 'narf.css'],
                        customCSS: 'body { background: red; }'
                    },
                    nodeId: '0:0:7'
                }
            };
            wrapper = shallowMount(WebNodeIFrame, iframeConfig);

            let html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('messageListener.js mock');
            expect(html).toMatch('scriptLoader.js mock');
            expect(html).toMatch('loadErrorHandler.js mock');
            expect(html).toMatch('viewAlertHandler.js mock');
            expect(html).toMatch(`["http://baseurl.test.example/", "${window.origin}", "knimespace", "0:0:7", 2]`);
            expect(html).toMatch('<script src="http://baseurl.test.example/foo/bar.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch('<script src="http://baseurl.test.example/qux/baz.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch(`knimeService.resourceBaseUrl = 'http://baseurl.test.example/';`);
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/bla.css">');
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/narf.css">');
            expect(html).toMatch('<style>body { background: red; }</style>');

            // check if iframe resizer was also injected
            iframeConfig.propsData.viewConfig.resizeMethod = 'viewLowestElement';
            wrapper = shallowMount(WebNodeIFrame, iframeConfig);
            html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('iframeResizer.js mock');
        });

        it('injects scripts and styles with access token', () => {
            let token = 'Shaken and not stirred';
            let changedSettings = {
                'knime:access_token': token
            };
            store.commit('settings/setSettings', { settings: changedSettings });
            expect(store.state.settings?.['knime:access_token']).toBe(token);
            let iframeConfig = {
                attachToDocument: true,
                ...context,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        javascriptLibraries: ['foo/bar.js', 'qux/baz.js'],
                        stylesheets: ['bla.css', 'narf.css'],
                        customCSS: 'body { background: red; }'
                    },
                    nodeId: '0:0:7'
                }
            };
            wrapper = shallowMount(WebNodeIFrame, iframeConfig);

            let html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('messageListener.js mock');
            expect(html).toMatch('scriptLoader.js mock');
            expect(html).toMatch('loadErrorHandler.js mock');
            expect(html).toMatch('viewAlertHandler.js mock');
            expect(html).toMatch(`["http://baseurl.test.example/", "${window.origin}", "knimespace", "0:0:7", 2]`);
            expect(html).toMatch(`<script src="http://baseurl.test.example/foo/bar.js?knime:access_token=${token}" ` +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch(`<script src="http://baseurl.test.example/qux/baz.js?knime:access_token=${token}" ` +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch(`knimeService.resourceBaseUrl = 'http://baseurl.test.example/';`);
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/bla.css' +
                `?knime:access_token=${token}">`);
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/narf.css' +
                `?knime:access_token=${token}">`);
            expect(html).toMatch('<style>body { background: red; }</style>');
        });

        it('handles resource loading', () => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        initMethodName: 'initMe',
                        viewRepresentation: { dummyRepresentation: true },
                        viewValue: { dummyValue: true }
                    },
                    nodeId: '0:0:7'
                }
            });

            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');

            // fake resource loading
            // hack because jsdom does not implement the `origin` property, see https://github.com/jsdom/jsdom/issues/1260
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'load' }
            });

            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0:0:7',
                namespace: 'knimespace',
                initMethodName: 'initMe',
                viewRepresentation: { dummyRepresentation: true },
                viewValue: { dummyValue: true },
                type: 'init'
            }, window.origin);
        });

        it('sets view loading on store', () => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        initMethodName: 'initMe',
                        viewRepresentation: { dummyRepresentation: true },
                        viewValue: { dummyValue: true }
                    },
                    nodeId: '0:0:7'
                }
            });
            // before resource loading
            let calls = storeConfig.actions.setWebNodeLoading.mock.calls;
            let lastCall = calls[calls.length - 1];
            expect(lastCall[1]).toMatchObject({ nodeId: '0:0:7', loading: true });

            // mock resource loading done
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'load' }
            });

            calls = storeConfig.actions.setWebNodeLoading.mock.calls;
            lastCall = calls[calls.length - 1];
            expect(lastCall[1]).toMatchObject({ nodeId: '0:0:7', loading: false });
        });
    });

    it('passes sizing config to iframe-resizer', async () => {
        let { iframeResizer } = jest.requireMock('iframe-resizer');
        let viewConfig = {
            nodeID: '0:0:7',
            resizeMethod: 'viewLowestElement',
            autoResize: true,
            scrolling: false,
            sizeHeight: true,
            resizeTolerance: 10,
            minWidth: 10,
            maxWidth: 100,
            minHeight: 5,
            maxHeight: 50
        };
        wrapper = shallowMount(WebNodeIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                viewConfig,
                nodeConfig: {
                    namespace: 'knimespace'
                },
                nodeId: '0:0:7'
            },
            mocks: {
                iframeResizer
            }
        });
        // wait for document + iframe creation + 'load' callback
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.autoHeight).toBe(true);
        expect(iframeResizer).toHaveBeenCalledWith(expect.objectContaining({
            autoResize: viewConfig.autoResize,
            scrolling: viewConfig.scrolling,
            heightCalculationMethod: 'lowestElement',
            sizeHeight: viewConfig.sizeHeight,
            tolerance: viewConfig.resizeTolerance,
            minWidth: viewConfig.minWidth,
            maxWidth: viewConfig.maxWidth,
            minHeight: viewConfig.minHeight,
            maxHeight: viewConfig.maxHeight
        }), expect.anything());
    });

    describe('view value retrieval', () => {
        it('handles getValue call', () => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    },
                    nodeId: '0:0:7'
                }
            });
            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');
            wrapper.vm.getValue();
            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0:0:7',
                namespace: 'knimespace',
                getViewValueMethodName: 'value',
                type: 'getValue'
            }, window.origin);
        });

        it('resolves getValue promise', () => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    },
                    nodeId: '0:0:7'
                }
            });
            let valuePromise = wrapper.vm.getValue();

            // fake value returned
            // hack because jsdom does not implement the `origin` property, see https://github.com/jsdom/jsdom/issues/1260
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'getValue', value: { integer: 42 } }
            });

            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', value: { integer: 42 } });
        });

        it('rejects getValue promise on error', () => {
            wrapper = shallowMount(WebNodeIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    },
                    nodeId: '0:0:7'
                }
            });
            let valuePromise = wrapper.vm.getValue();
            let errorMessage = 'some error message';

            // fake error returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'getValue', error: errorMessage }
            });

            expect(wrapper.vm.alert).toStrictEqual({
                level: 'error',
                message: 'some error message',
                nodeInfo: undefined,
                type: 'error'
            });
            return expect(valuePromise).rejects.toStrictEqual(new Error(errorMessage));
        });
    });

    describe('WebNodeIFrame alerts', () => {
        let nodeId = '0:0:7';

        it('manages its own alert state', () => {
            let localWrapper = shallowMount(WebNodeIFrame, {
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
            let alertData = {
                nodeId,
                message: 'test',
                level: 'error'
            };

            expect(localWrapper.vm.alert).toBe(null);
            expect(localWrapper.vm.displayAlert).toBe(false);
            localWrapper.vm.handleAlert(alertData);
            expect(localWrapper.vm.alert).toStrictEqual({
                ...alertData,
                nodeInfo: {},
                type: 'error'
            });
            expect(localWrapper.vm.displayAlert).toBe(true);
            localWrapper.vm.closeAlert(true);
            expect(localWrapper.vm.displayAlert).toBe(false);
            expect(localWrapper.vm.alert).toBe(null);
            localWrapper.destroy();
        });

        it('handles show alert events', () => {
            let showAlertMock = jest.fn();
            let localWrapper = shallowMount(WebNodeIFrame, {
                ...context,
                store: new Vuex.Store({ modules: {
                    pagebuilder: storeConfig,
                    'pagebuilder/interactivity': interactivityConfig,
                    api: apiConfig,
                    settings: settingsConfig,
                    wizardExecution: wizardConfig,
                    'pagebuilder/alert': {
                        ...alertStoreConfig,
                        actions: {
                            ...alertStoreConfig.actions,
                            showAlert: showAlertMock
                        }
                    }
                } }),
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

            let alertData = {
                nodeId,
                message: 'test'
            };

            localWrapper.vm.handleAlert(alertData);
            expect(localWrapper.vm.alert).toStrictEqual({
                ...alertData,
                nodeInfo: {},
                type: 'warn'
            });
            localWrapper.find(AlertLocal).trigger('showAlert');
            expect(showAlertMock).toHaveBeenCalledWith(expect.anything(), {
                ...localWrapper.vm.alert,
                callback: localWrapper.vm.closeAlert
            }, undefined);
            localWrapper.destroy();
        });
    });
});
