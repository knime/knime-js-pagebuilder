import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';
import AlertLocal from '@/components/layout/AlertLocal';

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

describe('NodeViewIframe.vue', () => {
    let interactivityConfig, apiConfig, wizardConfig, settingsConfig, store, localVue, context, mockGetPublishedData,
        mockGetRepository, mockGetDownloadLink, mockGetUploadLink, mockUpload;

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
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders', () => {
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true
        });
        expect(wrapper.html()).toBeTruthy();
    });

    describe('resource injection', () => {
        it('injects scripts and styles', () => {
            window.origin = window.location.origin;
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
                    }
                }
            };
            let wrapper = shallowMount(NodeViewIFrame, iframeConfig);

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
            wrapper = shallowMount(NodeViewIFrame, iframeConfig);
            html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('iframeResizer.js mock');
        });

        it('handles resource loading', () => {
            let wrapper = shallowMount(NodeViewIFrame, {
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
                    }
                }
            });

            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');

            window.origin = window.location.origin;

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
            let wrapper = shallowMount(NodeViewIFrame, {
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
                    }
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

    it('passes sizing config to iframe-resizer', () => {
        let iframeResizerMock = require('iframe-resizer/js/iframeResizer');
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
        shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                viewConfig,
                nodeConfig: {
                    namespace: 'knimespace'
                }
            }
        });
        expect(iframeResizerMock).toHaveBeenCalledWith(expect.objectContaining({
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

    it('registers/de-registers methods with store', () => {
        let addValidator, addValueGetter, addValidationErrorSetter,
            removeValidator, removeValueGetter, removeValidationErrorSetter,
            methodsStore, wrapper;

        addValidator = jest.fn();
        addValueGetter = jest.fn();
        addValidationErrorSetter = jest.fn();
        removeValidator = jest.fn();
        removeValueGetter = jest.fn();
        removeValidationErrorSetter = jest.fn();

        methodsStore = new Vuex.Store({ modules: {
            pagebuilder: {
                namespaced: true,
                ...storeConfig,
                actions: {
                    ...storeConfig.actions,
                    setWebNodeLoading: jest.fn(),
                    addValidator,
                    addValueGetter,
                    addValidationErrorSetter,
                    removeValidator,
                    removeValueGetter,
                    removeValidationErrorSetter
                }
            },
            settings: settingsConfig,
            'pagebuilder/alert': alertStoreConfig
        } });
        methodsStore.commit('pagebuilder/setResourceBaseUrl', 'http://baseurl.test.example/');
        methodsStore.commit('pagebuilder/setPage', {
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

        let nodeId = '0:0:7';

        wrapper = shallowMount(NodeViewIFrame, {
            store: methodsStore,
            localVue,
            attachToDocument: true,
            propsData: {
                viewConfig: { nodeID: nodeId },
                nodeConfig: {}
            }
        });

        expect(addValidator).toHaveBeenCalledWith(expect.anything(),
            { nodeId, validator: wrapper.vm.validate }, undefined); // eslint-disable-line no-undefined
        expect(addValueGetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId, valueGetter: wrapper.vm.getValue }, undefined); // eslint-disable-line no-undefined
        expect(addValidationErrorSetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId, errorSetter: wrapper.vm.setValidationError }, undefined); // eslint-disable-line no-undefined

        wrapper.destroy();

        expect(removeValidator).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, undefined); // eslint-disable-line no-undefined
        expect(removeValueGetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, undefined); // eslint-disable-line no-undefined
        expect(removeValidationErrorSetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, undefined); // eslint-disable-line no-undefined
    });

    describe('view value retrieval', () => {
        it('handles getValue call', () => {
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    }
                }
            });
            window.origin = window.location.origin;
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
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    }
                }
            });
            window.origin = window.location.origin;
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
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    },
                    nodeConfig: {
                        namespace: 'knimespace',
                        getViewValueMethodName: 'value'
                    }
                }
            });
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.getValue();
            let errorMessage = 'some error message';

            // fake error returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'getValue', error: errorMessage }
            });

            return expect(valuePromise).rejects.toStrictEqual(new Error(errorMessage));
        });
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
            window.origin = window.location.origin;
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
            window.origin = window.location.origin;
            let validatePromise = wrapper.vm.validate();
            // fake validation returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'validate', isValid: true }
            });
            return expect(validatePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: true });
        });

        it('returns invalid for errors with webnodes', () => {
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.validate();
            // fake error
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'validate', error: 'Error', isValid: false }
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0:0:7', isValid: false });
        });

        it('returns invalid when views timeout', () => {
            jest.useFakeTimers();
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.validate();
            // don't provide a message queue response
            jest.runAllTimers();
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
            window.origin = window.location.origin;
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
            window.origin = window.location.origin;
            let validatePromise = wrapper.vm.setValidationError('test');
            // fake validation returned
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'setValidationError', isValid: false }
            });
            return expect(validatePromise).resolves.toStrictEqual(true);
        });

        it('catches errors from within view thrown while setting message', async (done) => {
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.setValidationError('test').catch(e => e);
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0:0:7', type: 'setValidationError', error: 'Error', isValid: false }
            });
            let response = await Promise.resolve(valuePromise);
            expect(response instanceof Error).toBe(true);
            expect(response.message).toBe('Error');
            done();
        });
    });

    describe('handling messages from iFrame', () => {
        let wrapper, validateCallbackMock, getValueCallbackMock, setValidationErrorCallbackMock, nodeId;

        beforeEach(() => {
            nodeId = '0:0:7';

            wrapper = shallowMount(NodeViewIFrame, {
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
                    }
                }
            });

            validateCallbackMock = jest.fn();
            getValueCallbackMock = jest.fn();
            setValidationErrorCallbackMock = jest.fn();

            wrapper.vm.validateCallback = validateCallbackMock;
            wrapper.vm.getValueCallback = getValueCallbackMock;
            wrapper.vm.setValidationErrorCallback = setValidationErrorCallbackMock;

            window.origin = window.location.origin;
            jest.spyOn(wrapper.vm.document.defaultView, 'postMessage');
        });

        it('ignores missing event data', () => {
            // empty event
            let messageEvent = {};
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
            expect(wrapper.vm.alert).toBe(null);
            // missing origin
            messageEvent = { data: { nodeId } };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
            expect(wrapper.vm.alert).toBe(null);
            // mismatched nodeId
            messageEvent = { data: { nodeId: 'other:node' } };
            wrapper.vm.messageFromIframe(messageEvent);
            expect(wrapper.vm.document.defaultView.postMessage).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
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
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
            expect(wrapper.vm.alert).toStrictEqual({
                nodeId, nodeInfo: {}, type: 'error', message: 'Something went wrong', error: 'Something went wrong'
            });
        });
    });

    describe('NodeViewIFrame alerts', () => {
        let nodeId = '0:0:7';

        it('manages its own alert state', () => {
            let localWrapper = shallowMount(NodeViewIFrame, {
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
                    }
                }
            });
            let alertData = {
                nodeId,
                message: 'test',
                level: 'error'
            };

            expect(localWrapper.vm.alert).toBe(null);
            expect(localWrapper.vm.displayAlert).toBe(null);
            localWrapper.vm.handleAlert(alertData);
            expect(localWrapper.vm.alert).toStrictEqual({
                ...alertData,
                nodeInfo: {},
                type: 'error'
            });
            expect(localWrapper.vm.displayAlert).toBe(true);
            localWrapper.vm.closeAlert(true);
            expect(localWrapper.vm.displayAlert).toBe(null);
            expect(localWrapper.vm.alert).toBe(null);
        });

        it('handles show alert events', () => {
            let showAlertMock = jest.fn();
            let localWrapper = shallowMount(NodeViewIFrame, {
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
                    }
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
            }, undefined); // eslint-disable-line no-undefined
        });
    });

    describe('PageBuilder API', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    }
                }
            });
        });

        it('registers & unregisters global PageBuilder API', () => {
            expect(window.KnimePageBuilderAPI).toBeDefined();
            expect(window.KnimePageBuilderAPI.interactivityGetPublishedData).toBeDefined();
            expect(window.KnimePageBuilderAPI.getDefaultMountId).toBeDefined();
            expect(window.KnimePageBuilderAPI.getWorkflow).toBeDefined();
            expect(window.KnimePageBuilderAPI.getDownloadLink).toBeDefined();
            expect(window.KnimePageBuilderAPI.getUploadLink).toBeDefined();
            expect(window.KnimePageBuilderAPI.getCustomSketcherPath).toBeDefined();
            wrapper.destroy();
            expect(window.KnimePageBuilderAPI).not.toBeDefined();
        });

        it('getPublishedData calls interactivity store', () => {
            let id = 'selection-12345';
            window.KnimePageBuilderAPI.interactivityGetPublishedData(id);
            expect(interactivityConfig.getters.getPublishedData).toHaveBeenCalled();
            expect(mockGetPublishedData).toHaveBeenCalledWith(id);
        });

        it('getDefaultMountId calls settings store', () => {
            let id = window.KnimePageBuilderAPI.getDefaultMountId();
            expect(id).toEqual('MOUNTIE');
        });

        it('getWorkflow calls wizardExecution store', () => {
            let workflow =  window.KnimePageBuilderAPI.getWorkflow();
            expect(workflow).toEqual('/some/path');
        });

        it('getRepository calls api store', () => {
            let config = { path: '/', filter: null };
            window.KnimePageBuilderAPI.getRepository(config);
            expect(apiConfig.getters.repository).toHaveBeenCalled();
            expect(mockGetRepository).toHaveBeenCalledWith(config);
        });

        it('getDownloadLink calls api store', () => {
            let resourceId = 'file-donwload';
            let nodeId = '0:0:7';
            window.KnimePageBuilderAPI.getDownloadLink({ resourceId, nodeId });
            expect(apiConfig.getters.downloadResourceLink).toHaveBeenCalled();
            expect(mockGetDownloadLink).toHaveBeenCalledWith({ nodeId: '0:0:7', resourceId });
        });

        it('getUploadLink calls api store', () => {
            let resourceId = 'sample.txt';
            let nodeId = '0:0:7';
            window.KnimePageBuilderAPI.getUploadLink({ resourceId, nodeId });
            expect(apiConfig.getters.uploadResourceLink).toHaveBeenCalled();
            expect(mockGetUploadLink).toHaveBeenCalledWith({ nodeId: '0:0:7', resourceId });
        });

        it('getCustomSketcherPath calls settings store', () => {
            let path = window.KnimePageBuilderAPI.getCustomSketcherPath();
            expect(path).toEqual('sample/sketcher/path/sketcher.html');
        });

    });

    describe('Interactivity', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    viewConfig: {
                        nodeID: '0:0:7'
                    }
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
            wrapper.vm.messageFromIframe({ origin: window.origin,
                data: {
                    nodeId: '0:0:7',
                    type: 'interactivityRegisterSelectionTranslator',
                    id: '123',
                    translator: 'dummy'
                } });
            expect(interactivityConfig.actions.registerSelectionTranslator).toHaveBeenCalled();
        });

        it('informs iframe of interactivity events', () => {
            window.origin = window.location.origin;
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
