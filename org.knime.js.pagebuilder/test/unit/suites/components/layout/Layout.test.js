import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Layout from '@/components/layout/Layout.vue';
import Row from '@/components/layout/Row.vue';

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
        vi.restoreAllMocks();
    });

    it('renders', () => {
        const wrapper = shallowMount(Layout, context);

        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('container-fluid');
    });

    it('renders rows', () => {
        const wrapper = shallowMount(Layout, context);

        let rows = wrapper.findAll(Row);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props().rowConfig).toEqual({ dummy: 'dummy' });
        expect(rows.at(1).props().rowConfig).toEqual({ foo: 'foo' });
    });
});
