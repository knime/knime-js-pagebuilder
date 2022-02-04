import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import Column from '@/components/layout/Column';
import NodeView from '@/components/layout/NodeView';

import * as storeConfig from '~/store/pagebuilder';
// this is required because the Row component is imported asynchronously in Column, cf.
// https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
const Row = {
    name: 'Row',
    template: '<b class="row" />',
    props: ['rowConfig']
};

const stubs = {
    Row
};

describe('Column.vue', () => {
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
        nodeViews: nodeViews || {},
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
            stubs,
            propsData: {
                columnConfig: {
                    widthXS: 6,
                    additionalClasses: [],
                    additionalStyles: []
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

    it('renders without classes and styles', () => {
        let wrapper = shallowMount(Column, context);
        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('col col-6 col-padding');
        expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('renders with classes and styles', () => {
        context.propsData.columnConfig.additionalClasses = ['class1', 'class2'];
        context.propsData.columnConfig.additionalStyles = ['color: red;', 'border: 1px solid green;'];
        let wrapper = shallowMount(Column, context);
        expect(wrapper.attributes('class')).toEqual('col col-6 class1 class2 col-padding');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

    it('renders responsive grid classes', () => {
        context.propsData.columnConfig = {
            widthXS: 12,
            widthMD: 11,
            widthLG: 10,
            widthXL: 9,
            widthSM: 8,
            additionalClasses: ['class1', 'class2']
        };
        let wrapper = shallowMount(Column, context);
        expect(wrapper.attributes('class'))
            .toEqual('col col-12 col-sm-8 col-md-11 col-lg-10 col-xl-9 class1 class2 col-padding');
    });

    it('renders default responsive grid class if no width defined', () => {
        context.propsData.columnConfig = {};
        let wrapper = shallowMount(Column, context);
        expect(wrapper.attributes('class')).toEqual('col col-12 col-padding');
    });

    it('renders views', () => {
        let content = [{
            type: 'view',
            nodeID: '9:0:4'
        }];
        context.propsData.columnConfig = { content };
        let wrapper = shallowMount(Column, context);

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(1);
        expect(views.at(0).props('viewConfig')).toBe(content[0]);
        expect(rows.length).toBe(0);
        expect(divs.length).toBe(0);
    });

    it('wraps multiple views', () => {
        let content = [{
            type: 'view',
            nodeID: '9:0:4'
        }, {
            type: 'JSONLayoutViewContent',
            nodeID: '9:0:5'
        }];
        context.propsData.columnConfig = { content };
        let wrapper = shallowMount(Column, context);

        let [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        expect(rows.length).toBe(2);
        rows.wrappers.forEach((row, rowInd) => {
            expect(row.props('rowConfig')).toStrictEqual({
                type: 'JSONLayoutRow',
                additionalStyles: [],
                additionalClasses: [],
                columns: [
                    {
                        content: [content[rowInd]],
                        widthXS: 12,
                        additionalStyles: [],
                        additionalClasses: []
                    }
                ]
            });
        });
        expect(divs.length).toBe(0);
    });

    it('renders child rows', () => {
        let content = [{
            type: 'row',
            dummy: 'dummy'
        }, {
            type: 'JSONLayoutRow',
            foo: 'bar'
        }];
        context.propsData.columnConfig = { content };
        let wrapper = shallowMount(Column, context);

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props('rowConfig')).toEqual({ type: 'row', dummy: 'dummy' });
        expect(rows.at(1).props('rowConfig')).toEqual({ type: 'JSONLayoutRow', foo: 'bar' });
        expect(divs.length).toBe(0);
    });

    it('renders nested layouts', () => {
        let content = [{
            type: 'nestedLayout',
            layout: {
                rows: [{
                    type: 'row',
                    dummy: 'dummy'
                }, {
                    type: 'row',
                    foo: 'bar'
                }]
            }
        }, {
            type: 'JSONNestedLayout',
            layout: {
                rows: [{
                    type: 'JSONLayoutRow',
                    baz: 'qux'
                }]
            }
        }];
        context.propsData.columnConfig = { content };
        let wrapper = shallowMount(Column, context);

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        // eslint-disable-next-line no-magic-numbers
        expect(rows.length).toBe(3);
        expect(rows.at(0).props('rowConfig')).toEqual({ type: 'row', dummy: 'dummy' });
        expect(rows.at(1).props('rowConfig')).toEqual({ type: 'row', foo: 'bar' });
        expect(rows.at(2).props('rowConfig')).toEqual({ type: 'JSONLayoutRow', baz: 'qux' });
        expect(divs.length).toBe(0);
    });

    it('renders HTML', () => {
        let html = '<span>foo</span>';
        let html2 = '<span>bar</span>';
        context.propsData.columnConfig = {
            content: [{
                type: 'html',
                value: html
            },
            {
                type: 'JSONLayoutHTMLContent',
                value: html2
            }]
        };
        let wrapper = shallowMount(Column, context);

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        expect(rows.length).toBe(0);
        expect(divs.length).toBe(2);
        expect(divs.at(0).html()).toEqual(`<div>${html}</div>`);
        expect(divs.at(1).html()).toEqual(`<div>${html2}</div>`);
    });

    it('always re-renders NodeView components', () => {
        // this is important so the iframe of NodeViewIFrame gets destroyed and re-created correctly
            
        let content = [{
            type: 'view',
            nodeID: '9:0:4'
        }];
        context.propsData.columnConfig = { content };
        let wrapper = shallowMount(Column, context);

        let view1 = wrapper.find(NodeView).element;

        wrapper.setProps({ columnConfig: { content } });

        let view2 = wrapper.find(NodeView).element;

        expect(view1).not.toBe(view2);
    });

    it('always renders ui-extension node without col padding', () => {
        const wizardPageContent = getWizardPageContent();
        wizardPageContent.nodeViews = { SINGLE: {} };
        context.store.commit('pagebuilder/setPage', {
            wizardPageContent
        });
        let wrapper = shallowMount(Column, context);
        expect(wrapper.attributes('class').includes('col-padding')).toBeFalsy();
    });
});
