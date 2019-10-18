import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { testURL } from '~/jest.config';

import NodeViewIFrame from '@/components/layout/NodeViewIFrame';

import * as storeConfig from '@/../store/pagebuilder';

describe('NodeViewIframe.vue', () => {

    let store, localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
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
        window.origin = new URL(testURL).origin;
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
        }, 10);
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

        window.origin = new URL(testURL).origin;

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

        window.origin = new URL(testURL).origin;

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

        window.origin = new URL(testURL).origin;

        // see above
        wrapper.vm.messageFromIframe({
            origin: window.origin,
            data: { nodeId: '0.0.7', type: 'load' }
        });

        expect(NodeViewIFrame.methods.initHeightPolling).not.toHaveBeenCalled();
    });
});
