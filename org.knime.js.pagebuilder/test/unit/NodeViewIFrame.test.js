import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';

jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => `"loadErrorHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => `"viewAlertHandler.js mock";
    foo = ['%NODEID%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
  foo = ['%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/messageListener.js', () => '"messageListener.js mock";', { virtual: true });

describe('NodeViewIframe.vue', () => {

    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        storeConfig.actions.setWebNodeLoading = jest.fn();
        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
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
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML).toContain('html { overflow: hidden; }');

        wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: true,
                pollHeight: true
            }
        });
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML).toContain('html { overflow-y: hidden; }');

        wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: true,
                pollHeight: false
            }
        });
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML).not.toContain('html { overflow: hidden; }');
        expect(wrapper.vm.$refs.iframe.contentDocument.documentElement.innerHTML).not.toContain('html { overflow-y: hidden; }');

    });

    it('adjusts height initially', done => {
        const fakeHeight = 5;
        jest.spyOn(NodeViewIFrame.methods, 'messageFromIframe');
        jest.spyOn(NodeViewIFrame.methods, 'setHeight').mockImplementation(function () {
            // eslint-disable-next-line no-invalid-this
            this.height = fakeHeight;
        });
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                autoHeight: true,
                nodeId: '0.0.7'
            }
        });

        // fake script loader callback (scriptLoader.js is mocked)
        window.origin = window.location.origin;
        window.postMessage({ nodeId: '0.0.7', type: 'load' }, window.origin);

        setTimeout(() => { // postMessage mock adds artificial delay
            expect(NodeViewIFrame.methods.messageFromIframe).toHaveBeenCalled();

            // hack because jsdom does not implement the `origin` property, see https://github.com/jsdom/jsdom/issues/1260
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'load' }
            });

            expect(NodeViewIFrame.methods.setHeight).toHaveBeenCalled();
            expect(wrapper.emitted().heightChange).toBeTruthy();
            expect(wrapper.emitted().heightChange[0]).toEqual([fakeHeight]);
            done();
        }, 1);
    });

    it('does not adjust height if autoHeight is false', () => {
        jest.spyOn(NodeViewIFrame.methods, 'setHeight').mockImplementation(() => {});
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                nodeId: '0.0.7',
                autoHeight: false
            }
        });

        window.origin = window.location.origin;

        // see above
        wrapper.vm.messageFromIframe({
            origin: window.origin,
            data: { nodeId: '0.0.7', type: 'load' }
        });

        expect(NodeViewIFrame.methods.setHeight).not.toHaveBeenCalled();
    });

    it('polls on heightChange', () => {
        jest.spyOn(NodeViewIFrame.methods, 'initHeightPolling').mockImplementation(() => {});
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                nodeId: '0.0.7',
                autoHeight: true,
                pollHeight: true
            }
        });

        window.origin = window.location.origin;

        // see above
        wrapper.vm.messageFromIframe({
            origin: window.origin,
            data: { nodeId: '0.0.7', type: 'load' }
        });

        expect(NodeViewIFrame.methods.initHeightPolling).toHaveBeenCalled();
    });

    it('does not poll on heightChange if pollHeight is not true', () => {
        jest.spyOn(NodeViewIFrame.methods, 'initHeightPolling').mockImplementation(() => {});
        let wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                nodeId: '0.0.7',
                autoHeight: true
            }
        });

        window.origin = window.location.origin;

        // see above
        wrapper.vm.messageFromIframe({
            origin: window.origin,
            data: { nodeId: '0.0.7', type: 'load' }
        });

        expect(NodeViewIFrame.methods.initHeightPolling).not.toHaveBeenCalled();
    });

    describe('resource injection', () => {
        it('injects scripts and styles', () => {
            window.origin = window.location.origin;
            let wrapper = shallowMount(NodeViewIFrame, {
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
            });

            let html = wrapper.vm.document.documentElement.innerHTML;
            expect(html).toMatch('loadErrorHandler.js mock');
            expect(html).toMatch('viewAlertHandler.js mock');
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
            }
        } });
        methodsStore.commit('pagebuilder/setResourceBaseUrl', 'http://baseurl.test.example/');
        methodsStore.commit('pagebuilder/setPage', {
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

        let nodeId = '0.0.7';

        wrapper = shallowMount(NodeViewIFrame, {
            store: methodsStore,
            localVue,
            attachToDocument: true,
            propsData: {
                nodeId,
                nodeConfig: {}
            }
        });

        expect(addValidator).toHaveBeenCalledWith(expect.anything(),
            { nodeId, validator: wrapper.vm.validate }, wrapper.undef);
        expect(addValueGetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId, valueGetter: wrapper.vm.getValue }, wrapper.undef);
        expect(addValidationErrorSetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId, errorSetter: wrapper.vm.setValidationError }, wrapper.undef);

        wrapper.destroy();

        expect(removeValidator).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, wrapper.undef);
        expect(removeValueGetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, wrapper.undef);
        expect(removeValidationErrorSetter).toHaveBeenCalledWith(expect.anything(),
            { nodeId }, wrapper.undef);
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
                data: { nodeId: '0.0.7', type: 'validate', error: 'Error', isValid: false }
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

    describe('setting validation error', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId: '0.0.7',
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
                nodeId: '0.0.7',
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
                data: { nodeId: '0.0.7', type: 'setValidationError', isValid: false }
            });
            return expect(validatePromise).resolves.toStrictEqual(true);
        });

        it('catches errors from within view thrown while setting message', () => {
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.setValidationError('test');
            // fake error
            wrapper.vm.messageFromIframe({
                origin: window.origin,
                data: { nodeId: '0.0.7', type: 'setValidationError', error: 'Error', isValid: false }
            });
            return expect(valuePromise).rejects.toThrow('Error');
        });

        it('rejects with error when views timeout', () => {
            jest.useFakeTimers();
            window.origin = window.location.origin;
            let valuePromise = wrapper.vm.setValidationError('test');
            // don't provide a message queue response
            jest.runAllTimers();
            return expect(valuePromise).rejects.toThrow('Validation error message could not be set in the allocated time.');
        });
    });

    describe('handling messages from iFrame', () => {
        let wrapper, validateCallbackMock, getValueCallbackMock, setValidationErrorCallbackMock, nodeId;

        beforeEach(() => {
            nodeId = '0.0.7';

            wrapper = shallowMount(NodeViewIFrame, {
                ...context,
                attachToDocument: true,
                propsData: {
                    nodeId,
                    nodeConfig: {
                        namespace: 'knimespace',
                        initMethodName: 'init',
                        setValidationErrorMethodName: 'setValidationError',
                        viewRepresentation: {},
                        viewValue: {}
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
            const initHeightPollingMock = jest.fn();
            const setHeightMock = jest.fn();
            wrapper.vm.setHeight = setHeightMock;
            wrapper.vm.initHeightPolling = initHeightPollingMock;

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
            expect(initHeightPollingMock).not.toHaveBeenCalled();
            expect(setHeightMock).not.toHaveBeenCalled();
            expect(validateCallbackMock).not.toHaveBeenCalled();
            expect(getValueCallbackMock).not.toHaveBeenCalled();
            expect(setValidationErrorCallbackMock).not.toHaveBeenCalled();
            expect(wrapper.vm.isValid).toBe(true);
            expect(wrapper.vm.errorMessage).toBe(null);
            expect(wrapper.vm.alert).toBe(null);
            // height polling
            wrapper.setProps({ autoHeight: true });
            wrapper.vm.messageFromIframe(messageEvent);
            expect(initHeightPollingMock).not.toHaveBeenCalled();
            expect(setHeightMock).toHaveBeenCalled();
            wrapper.setProps({ pollHeight: true });
            wrapper.vm.messageFromIframe(messageEvent);
            expect(initHeightPollingMock).toHaveBeenCalled();
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

        describe('using alerts via message', () => {
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
                expect(wrapper.vm.alert).toStrictEqual({ nodeId, type: 'warn', message: 'test' });
            });
        });
    });
});
