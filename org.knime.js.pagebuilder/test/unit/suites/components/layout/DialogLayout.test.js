import Vuex from 'vuex';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';

import DialogLayout from '@/components/layout/DialogLayout';
import NodeView from '@/components/layout/NodeView';

import * as storeConfig from '~/store/pagebuilder';

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
        let store = new Vuex.Store({ modules: { pagebuilder: storeConfig } });
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
        expect(wrapper.attributes('class')).toEqual('row');
    });

    it('renders view and dialog', () => {
        const columns = context.propsData.layout.rows[0].columns;
        const wrapper = mount(DialogLayout, context);

        const nodeViews = wrapper.findAll(NodeView);
        expect(nodeViews.length).toBe(2);
        expect(nodeViews.at(0).props().viewConfig).toEqual(columns[0].content[0]);
        expect(nodeViews.at(1).props().viewConfig).toEqual(columns[1].content[0]);
    });
});
