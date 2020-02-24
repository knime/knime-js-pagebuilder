import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';

// extra mock to simulate a loaded view script
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
  foo = ['%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });

describe('NodeViewIframe.vue', () => {

    let interactivityConfig, store, localVue, context, mockGetPublishedData;

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
        store = new Vuex.Store({ modules: {
            pagebuilder: storeConfig,
            'pagebuilder/interactivity': interactivityConfig
        } });
        store.commit('pagebuilder/setResourceBaseUrl', 'http://baseurl.test.example/');
        store.commit('pagebuilder/setPage', {
            wizardPageContent: {
                webNodes: {
                    '0.0.7': {
                        namespace: 'foo',
                        javascriptLibraries: [],
                        stylesheets: []
                    },
                    '0.0.9': {
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

    it('respects the "scrolling" attribute', () => {
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: false,
                pollHeight: true
            }
        });
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML)
            .toContain('html { overflow: hidden; }');

        wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: true,
                pollHeight: false
            }
        });
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML)
            .not.toContain('html { overflow: hidden; }');
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML)
            .not.toContain('html { overflow-y: hidden; }');

    });

    describe('resource injection', () => {
        it('injects scripts and styles', () => {
            window.origin = window.location.origin;
            let iframeConfig = {
                attachToDocument: true,
                ...context,
                propsData: {
                    nodeId: '0.0.7',
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
            expect(html).toMatch(`["${window.origin}", "knimespace", "0.0.7", 2]`);
            expect(html).toMatch('<script src="http://baseurl.test.example/foo/bar.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch('<script src="http://baseurl.test.example/qux/baz.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch(`knimeService.resourceBaseUrl = 'http://baseurl.test.example/';`);
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/bla.css">');
            expect(html).toMatch('<link type="text/css" rel="stylesheet" href="http://baseurl.test.example/narf.css">');
            expect(html).toMatch('<style>body { background: red; }</style>');

            // check if iframe resizer was also injected
            iframeConfig.propsData.autoHeight = true;
            wrapper = shallowMount(NodeViewIFrame, iframeConfig);
            html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('iframeResizer.js mock');
        });

        it('handles resource loading', () => {
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId: '0.0.7',
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
                data: { nodeId: '0.0.7', type: 'load' }
            });

            expect(wrapper.vm.document.defaultView.postMessage).toHaveBeenCalledWith({
                nodeId: '0.0.7',
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
                    nodeId: '0.0.7',
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
            expect(lastCall[1]).toMatchObject({ nodeId: '0.0.7', loading: true });
            
            // mock resource loading done
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'load' }
            });

            calls = storeConfig.actions.setWebNodeLoading.mock.calls;
            lastCall = calls[calls.length - 1];
            expect(lastCall[1]).toMatchObject({ nodeId: '0.0.7', loading: false });
        });
    });

    describe('view value retrieval', () => {
        it('handles getValue call', () => {
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId: '0.0.7',
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
                nodeId: '0.0.7',
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
                    nodeId: '0.0.7',
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
                data: { nodeId: '0.0.7', type: 'getValue', value: { integer: 42 } }
            });

            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0.0.7', value: { integer: 42 } });
        });

        it('rejects getValue promise on error', () => {
            let wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId: '0.0.7',
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
                data: { nodeId: '0.0.7', type: 'getValue', error: errorMessage }
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
                    nodeId: '0.0.7',
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
                nodeId: '0.0.7',
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
                data: { nodeId: '0.0.7', type: 'validate', isValid: true }
            });
            return expect(validatePromise).resolves.toStrictEqual({ nodeId: '0.0.7', isValid: true });
        });

        it('returns invalid for errors with webnodes', () => {
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.validate();
            // fake error
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'validate', error: true }
            });
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0.0.7', isValid: false });
        });

        it('returns invalid when views timeout', () => {
            jest.useFakeTimers();
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.validate();
            // don't provide a message queue response
            jest.runAllTimers();
            return expect(valuePromise).resolves.toStrictEqual({ nodeId: '0.0.7', isValid: false });
        });
    });

    describe('Interactivity', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId: '0.0.7'
                }
            });
        });

        it('registers & unregisters global PageBuilder API', () => {
            expect(window.KnimePageBuilderAPI).toBeDefined();
            expect(window.KnimePageBuilderAPI.interactivityGetPublishedData).toBeDefined();
            wrapper.destroy();
            expect(window.KnimePageBuilderAPI).not.toBeDefined();
        });

        it('getPublishedData calls interactivity store', () => {
            let id = 'selection-12345';
            window.KnimePageBuilderAPI.interactivityGetPublishedData(id);
            expect(interactivityConfig.getters.getPublishedData).toHaveBeenCalled();
            expect(mockGetPublishedData).toHaveBeenCalledWith(id);
        });

        it('subscribe calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'interactivitySubscribe', id: '123' }
            });
            expect(interactivityConfig.actions.subscribe).toHaveBeenCalled();
        });

        it('unsubscribe calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'interactivityUnsubscribe', id: '123' }
            });
            expect(interactivityConfig.actions.unsubscribe).toHaveBeenCalled();
        });

        it('publish calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'interactivityPublish', id: '123', payload: 'dummy' }
            });
            expect(interactivityConfig.actions.publish).toHaveBeenCalled();
        });

        it('registerSelectionTranslator calls interactivity store', () => {
            // mock postMessage call
            wrapper.vm.messageFromIframe({ origin: window.origin,
                data: {
                    nodeId: '0.0.7',
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
                nodeId: '0.0.7',
                type: 'interactivityEvent',
                id,
                payload
            }, window.origin);
        });
        
    });
});
