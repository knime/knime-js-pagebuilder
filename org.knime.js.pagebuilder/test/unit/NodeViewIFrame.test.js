import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';

jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => `"scriptLoader.js mock";
  foo = ['%ORIGIN%', '%NAMESPACE%', '%NODEID%', '%LIBCOUNT%'];`, { virtual: true });
jest.mock('raw-loader!./injectedScripts/messageListener.js', () => '"messageListener.js mock";', { virtual: true });

describe('NodeViewIframe.vue', () => {

    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setResourceBaseUrl', 'http://baseurl.test.example/');
        store.commit('pagebuilder/setPage', {
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
        expect(wrapper.vm.$el.contentDocument.documentElement.innerHTML).toContain('html { overflow: hidden; }');

        wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: true,
                pollHeight: true
            }
        });
        expect(wrapper.vm.$el.contentDocument.documentElement.innerHTML).toContain('html { overflow-y: hidden; }');

        wrapper = shallowMount(NodeViewIFrame, {
            ...context,
            attachToDocument: true,
            propsData: {
                scrolling: true,
                pollHeight: false
            }
        });
        expect(wrapper.vm.$el.contentDocument.documentElement.innerHTML).not.toContain('html { overflow: hidden; }');
        expect(wrapper.vm.$el.contentDocument.documentElement.innerHTML).not.toContain('html { overflow-y: hidden; }');

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
            expect(html).toMatch('messageListener.js mock');
            expect(html).toMatch('scriptLoader.js mock');
            expect(html).toMatch(`["${window.origin}", "knimespace", "0.0.7", 2]`);
            expect(html).toMatch('<script src="http://baseurl.test.example/foo/bar.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
            expect(html).toMatch('<script src="http://baseurl.test.example/qux/baz.js" ' +
                'onload="knimeLoader(true)" onerror="knimeLoader(false)"');
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
                namespace: 'knimespace',
                initMethodName: 'initMe',
                viewRepresentation: { dummyRepresentation: true },
                viewValue: { dummyValue: true },
                type: 'init'
            }, window.origin);
        });
    });
});
