import { expect, describe, beforeAll, afterEach, it, vi } from 'vitest';
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';

import Layout from '@/components/layout/Layout.vue';
import Row from '@/components/layout/Row.vue';

import * as storeConfig from '@/store/pagebuilder';

describe('Layout.vue', () => {
    let context;

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
        let store = createStore({ modules: { pagebuilder: storeConfig } });
        store.commit('pagebuilder/setPage', {
            wizardPageContent: getWizardPageContent({ webNodes, nodeViews, webNodePageConfiguration })
        });

        return {
            global: {
                mock: {
                    $store: store
                }
            },
            props: {
                layout: {
                    rows: [{ dummy: 'dummy' }, { foo: 'foo' }]
                }
            }
        };
    };

    beforeAll(() => {
        context = createContext();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders', () => {
        const wrapper = shallowMount(Layout, context);

        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.attributes('class')).toBe('container-fluid');
    });

    it('renders rows', () => {
        const wrapper = shallowMount(Layout, context);

        let rows = wrapper.findAllComponents(Row);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props().rowConfig).toEqual({ dummy: 'dummy' });
        expect(rows.at(1).props().rowConfig).toEqual({ foo: 'foo' });
    });
});
