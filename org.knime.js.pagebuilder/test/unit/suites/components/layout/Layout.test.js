import Vuex from 'vuex';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';

import Layout from '@/components/layout/Layout';
import Row from '@/components/layout/Row';

import * as storeConfig from '~/store/pagebuilder';

describe('Layout.vue', () => {
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
            '1:0:1:0:0:9': {
                baz: 'qux',
                viewRepresentation: {
                    '@class': 'testing.notWidget'
                },
                nodeInfo: {
                    displayPossible: true
                }
            }
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
                layout: {
                    rows: [{ dummy: 'dummy' }, { foo: 'foo' }]
                }
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
        let wrapper = shallowMount(Layout, context);

        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('container-fluid');
    });

    it('renders rows', () => {
        let wrapper = shallowMount(Layout, context);

        let rows = wrapper.findAll(Row);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props().rowConfig).toEqual({ dummy: 'dummy' });
        expect(rows.at(1).props().rowConfig).toEqual({ foo: 'foo' });
    });

    it('renders parent row without margin when ui-extension node dialog is present', () => {
        const wizardPageContent = getWizardPageContent();
        wizardPageContent.nodeViews = { DIALOG: {} };
        context.store.commit('pagebuilder/setPage', {
            wizardPageContent
        });
        context.propsData.layout.rows = [{ dummy: 'dummy' }];
        let wrapper = mount(Layout, context);

        let parentRow = wrapper.find(Row).element;
        expect(parentRow.classList.contains('parent-row')).toBeFalsy();
    });
});
