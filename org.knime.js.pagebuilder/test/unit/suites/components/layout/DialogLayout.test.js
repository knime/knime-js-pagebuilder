import Vuex from 'vuex';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';

import DialogLayout from '@/components/layout/DialogLayout';
import NodeView from '@/components/layout/NodeView';
import Messages from 'webapps-common/ui/components/Messages';

import * as storeConfig from '~/store/pagebuilder';
import * as alertStoreConfig from '~/store/alert';

const mockAlert = {
    message: '',
    type: 'error',
    subtitle: 'Category Column Universe_0_0 is not present in table.',
    nodeId: '0:0:7',
    nodeInfo: { nodeName: 'Scatter Plot' }
};

describe('DialogLayout.vue', () => {
    let localVue, context;

    const getWizardPageContent = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => ({
        webNodes: webNodes || {
            '1:0:1:0:0:7': {
                foo: 'bar',
                viewRepresentation: {
                    '@class': 'testing.notWidget'
                },
                nodeInfo: {
                    displayPossible: true
                }
            }
        },
        nodeViews: nodeViews || {
            DIALOG: {},
            VIEW: {}
        },
        webNodePageConfiguration: webNodePageConfiguration || {
            projectRelativePageIDSuffix: '1:0:1'
        }
    });

    const createContext = ({ webNodes, nodeViews, webNodePageConfiguration } = {}) => {
        let store = new Vuex.Store({ modules: {
            pagebuilder: storeConfig,
            'pagebuilder/alert': alertStoreConfig
        } });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: getWizardPageContent({ webNodes, nodeViews, webNodePageConfiguration })
        });

        return {
            store,
            localVue,
            propsData: {
                layout: { rows: [{ columns: [
                    {
                        content: [{
                            type: '"JSONLayoutViewContent"',
                            nodeID: 'VIEW'
                        }]
                    },
                    {
                        content: [{
                            type: '"JSONLayoutViewContent"',
                            nodeID: 'DIALOG'
                        }]
                    }
                ] }] }
            }
        };
    };

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        context = createContext();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders', () => {
        const wrapper = shallowMount(DialogLayout, context);

        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('layout');
        expect(wrapper.find(Messages).exists()).toBeFalsy();
    });

    it('renders view and dialog', () => {
        const columns = context.propsData.layout.rows[0].columns;
        const wrapper = mount(DialogLayout, context);

        const nodeViews = wrapper.findAll(NodeView);
        expect(nodeViews.length).toBe(2);
        expect(nodeViews.at(0).props().viewConfig).toEqual(columns[0].content[0]);
        expect(nodeViews.at(1).props().viewConfig).toEqual(columns[1].content[0]);
    });

    it('displays Messages from the alert store', () => {
        const wrapper = shallowMount(DialogLayout, context);
        expect(wrapper.find(Messages).exists()).toBeFalsy();
        wrapper.vm.$store.dispatch('pagebuilder/alert/showAlert', mockAlert);
        expect(wrapper.find(Messages).exists()).toBeTruthy();
    });

    it('formats alerts into the expected Messages format', () => {
        const wrapper = shallowMount(DialogLayout, context);
        wrapper.vm.$store.dispatch('pagebuilder/alert/showAlert', mockAlert);
        expect(wrapper.vm.messages).toStrictEqual([{
            count: 1,
            details: '',
            id: '0:0:7',
            message: 'ERROR Category Column Universe_0_0 is not present in table.',
            showCloseButton: true,
            showCollapser: false,
            type: 'error'
        }]);
    });

    it('closes Messages using the alert store', () => {
        const wrapper = shallowMount(DialogLayout, context);
        wrapper.vm.$store.dispatch('pagebuilder/alert/showAlert', mockAlert);
        const messagesWrapper = wrapper.find(Messages);
        expect(messagesWrapper.exists()).toBeTruthy();
        const closeSpy = jest.spyOn(wrapper.vm.$store._actions['pagebuilder/alert/closeAlert'], '0');
        messagesWrapper.vm.$emit('dismiss');
        expect(closeSpy).toHaveBeenCalled();
    });
});
