import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import PageBuilder from '@/components/PageBuilder';
import Page from '@/components/Page';
import Progress from '@/components/Progress';
import Result from '@/components/Result';

describe('PageBuilder.vue', () => {

    let store, localVue, context;

    beforeEach(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);
        store = new Vuex.Store();
        PageBuilder.initStore({
            nextPage: () => {},
            previousPage: () => {}
        }, store);
        context = {
            store,
            localVue
        };
    });

    it('initializes the pagebuilder store', () => {
        expect(store.state.pagebuilder).toBeDefined();
    });

    it('renders nothing if no viewState set', () => {
        store.commit('pagebuilder/setViewState', null);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.html()).toBeUndefined();
    });

    it('renders Page if viewState is "page"', () => {
        store.commit('pagebuilder/setViewState', 'page');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Page).exists()).toBeTruthy();
    });

    it('renders Execution if viewState is "executing"', () => {
        store.commit('pagebuilder/setViewState', 'executing');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Progress).exists()).toBeTruthy();
    });

    it('renders Result if viewState is "result"', () => {
        store.commit('pagebuilder/setViewState', 'result');

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.find(Result).exists()).toBeTruthy();
    });

    it('validates individual nodes', () => {
        store.commit('pagebuilder/setPage', {
            webNodes: {
                id1: {
                    foo: 'bar'
                }
            }
        });

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.vm.$store.getters['pagebuilder/isNodeValid']('id1'))
            .toEqual(false);
        
        store.commit('pagebuilder/updateWebNode', {
            nodeId: 'id1',
            isValid: true,
            update: {
                foo: 'rod'
            }
        });

        expect(wrapper.vm.$store.getters['pagebuilder/isNodeValid']('id1'))
            .toEqual(true);
    });

    it('validates page based on individual node validity', () => {
        const page = {
            webNodes: {
                id1: {
                    foo: 'bar'
                }
            }
        };
        store.commit('pagebuilder/setPage', page);
        store.commit('pagebuilder/setNodeValidity', page);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.vm.$store.getters['pagebuilder/isPageValid'])
            .toEqual(false);
        
        store.commit('pagebuilder/updateWebNode', {
            nodeId: 'id1',
            isValid: true,
            update: {
                foo: 'rod'
            }
        });

        expect(wrapper.vm.$store.getters['pagebuilder/isPageValid'])
            .toEqual(true);
    });

    it('returns invalid with empty page', () => {
        const page = {};
        store.commit('pagebuilder/setPage', page);
        store.commit('pagebuilder/setNodeValidity', page);

        let wrapper = shallowMount(PageBuilder, context);

        expect(wrapper.vm.$store.getters['pagebuilder/isPageValid'])
            .toEqual(false);
    });

    it('prevents value modification with invalid node updates', () => {
        const page = {
            webNodes: {
                id1: {
                    foo: 'bar'
                }
            }
        };
        store.commit('pagebuilder/setPage', page);
        store.commit('pagebuilder/setNodeValidity', page);
        let wrapper = shallowMount(PageBuilder, context);
        let node = wrapper.vm.$store.state.pagebuilder.page.webNodes.id1;
        
        expect(node.foo).toEqual('bar');

        let update = {
            nodeId: 'id1',
            isValid: false,
            update: {
                foo: 'rod'
            }
        };
        
        store.commit('pagebuilder/updateWebNode', update);
        expect(node.foo).toEqual('bar');
        update.isValid = true;
        store.commit('pagebuilder/updateWebNode', update);
        expect(node.foo).toEqual('rod');
    });

    it('prevents value modification with invalid keys', () => {
        const page = {
            webNodes: {
                id1: {
                    foo: 'bar'
                }
            }
        };
        store.commit('pagebuilder/setPage', page);
        store.commit('pagebuilder/setNodeValidity', page);
        let wrapper = shallowMount(PageBuilder, context);
        let node = wrapper.vm.$store.state.pagebuilder.page.webNodes.id1;
        
        expect(node.foo).toEqual('bar');

        let update = {
            nodeId: 'id1',
            isValid: true,
            update: {
                fooBar: 'rod' // wrong key
            }
        };
        
        store.commit('pagebuilder/updateWebNode', update);
        expect(node.foo).toEqual('bar');
    });
});
