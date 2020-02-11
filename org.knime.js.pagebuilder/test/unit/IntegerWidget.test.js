import Vuex from 'vuex';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';

import IntegerWidget from '@/components/widgets/input/IntegerWidget';
import Widget from '@/components/widgets/Widget';

import * as storeConfig from '~/store/pagebuilder';

describe('IntegerWidget.vue', () => {
    let propsData;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                viewRepresentation: {
                    '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation',
                    defaultValue: {
                        '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeValue',
                        integer: 0
                    },
                    currentValue: {
                        '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeValue',
                        integer: 0
                    }
                },
                nodeInfo: {},
                getViewValueMethodName: 'value'
            },
            nodeId: 'id1',
            isValid: false,
            type: 'integer'
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(IntegerWidget, {
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    describe('registers getValue with store', () => {
        let localVue, store, context, wrapper;
        let nodeId = 'id1';

        beforeEach(() => {
            localVue = createLocalVue();
            localVue.use(Vuex);
    
            store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
            let page = {
                wizardPageContent: {
                    webNodes: {
                        [nodeId]: propsData.nodeConfig
                    }
                }
            };
            store.commit('pagebuilder/setPage', page);
            context = {
                store,
                localVue,
                propsData
            };
            wrapper = mount(Widget, {
                ...context
            });
        });

        it('registers getValue method with the store', () => {
            expect(wrapper.vm.hasValueGetter).toBe(true);
            expect(typeof wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId]).toBe('function');
            expect(wrapper.vm.$store.state.pagebuilder.pageValueGetters[nodeId])
                .toBe(wrapper.vm.getValue);
        });
    });
});
